import os
import numpy as np
from PIL import Image, ImageFilter

SRC = r"C:\Users\giris\OneDrive\Desktop\Siaara"
OUT = os.path.join(SRC, "assets", "img")
sb = Image.open(os.path.join(SRC, "logo  1st.jpg")).convert("RGB")

# ---- curtain: chroma key + geometric shadow cut below the hem edge ----
c = sb.crop((1028, 337, 1532, 617)).convert("RGB")
a = np.asarray(c).astype(np.float32)
h, w, _ = a.shape
bg = np.array([236.0, 216.0, 193.0])
d = np.sqrt(((a - bg) ** 2).sum(axis=2))

t = np.clip((d - 34) / (80 - 34), 0, 1)
t = t * t * (3 - 2 * t)

hard = (d > 105).astype(np.float32)
# rolling 5-row density to ignore stray sparkle pixels
dens = np.zeros_like(hard)
for k in range(-2, 3):
    dens += np.roll(hard, k, axis=0)
solid = dens >= 3

edge = np.zeros(w)
for x in range(w):
    rows = np.nonzero(solid[:, x])[0]
    edge[x] = rows.max() if len(rows) else 0
# smooth the traced hem curve
kernel = np.ones(11) / 11.0
edge = np.convolve(np.pad(edge, 5, mode="edge"), kernel, mode="valid")

yy = np.arange(h)[:, None]
mask = np.clip((edge[None, :] + 2.5 - yy) / 3.0, 0, 1)
alpha = (t * mask * 255).astype(np.uint8)

# grade: washed-out pale sheen zones -> rose-lit silk (keeps texture detail)
mx = a.max(axis=2)
mn = a.min(axis=2)
L = mx / 255.0
sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)
k = np.clip((L - 0.58) / 0.2, 0, 1) * np.clip((0.4 - sat) / 0.25, 0, 1)
k = (k * 0.8)[:, :, None]
rose = a * np.array([0.98, 0.6, 0.55])
a = a * (1 - k) + rose * k

im = Image.fromarray(np.dstack([a.astype(np.uint8), alpha]), "RGBA")
r, g, b, al = im.split()
al = al.filter(ImageFilter.GaussianBlur(0.7))
im = Image.merge("RGBA", (r, g, b, al))
im.save(os.path.join(OUT, "curtain.png"))
print("curtain: shadow cut below hem edge")

# ---- recompose the tall silk texture ----
curtain = im
fill = sb.crop((1120, 407, 1532, 537))
W, H = 1024, 2048
ch = int(curtain.height * (W / curtain.width))
curt = curtain.resize((W, ch), Image.LANCZOS)
ca = np.asarray(curt).copy()
for i in range(80):
    ca[i, :, 3] = (ca[i, :, 3].astype(np.float32) * (i / 79.0)).astype(np.uint8)
curt = Image.fromarray(ca, "RGBA")

flip = curtain.resize((W, ch), Image.LANCZOS).transpose(Image.FLIP_TOP_BOTTOM)
fa = np.asarray(flip).copy()
for i in range(80):
    fa[ch - 80 + i, :, 3] = (fa[ch - 80 + i, :, 3].astype(np.float32) * (1 - i / 79.0)).astype(np.uint8)
flip = Image.fromarray(fa, "RGBA")

BH = 300
fill2 = np.asarray(fill.resize((W, BH), Image.LANCZOS).convert("RGBA")).astype(np.float32)
fill2m = fill2[::-1].copy()
base = np.zeros((H, W, 4), dtype=np.float32)
wsum = np.zeros((H,), dtype=np.float32)
ramp = np.ones((BH,), dtype=np.float32)
ramp[:60] = np.linspace(0, 1, 60)
ramp[-60:] = np.linspace(1, 0, 60)
y, i = 480, 0
while y < 1700:
    band = fill2 if i % 2 == 0 else fill2m
    y2 = min(y + BH, H); n = y2 - y
    base[y:y2] += band[:n] * ramp[:n, None, None]
    wsum[y:y2] += ramp[:n]
    y += 240; i += 1
nz = wsum > 0
base[nz] /= wsum[nz, None, None]
base[:, :, 3] = np.where(wsum[:, None] > 0, 255.0, 0.0)
base[1700:] = 0
tex = Image.fromarray(base.astype(np.uint8), "RGBA")
tex.alpha_composite(flip, (0, 0))
tex.alpha_composite(curt, (0, H - ch))
tex.save(os.path.join(OUT, "fabric-tex.png"))
print("fabric-tex recomposed; fill starts below the flipped hem edge")
