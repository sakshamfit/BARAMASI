/* ═══════════════════════════════════════════════
   fabric — raw WebGL silk drape.
   A displaced plane textured with the silk
   extracted from the brand reference (wavy gold
   leading edge). Ripples are vertex-driven and
   shaded from their analytic slope, so the cloth
   carries weight and sheen — never a flat slide.
   ═══════════════════════════════════════════════ */

const VERT = `
attribute vec2 aPos;
uniform float uTime, uAmp, uRot, uTx, uTy, uAspect, uPlaneW, uPlaneH;
varying vec2 vUV;
varying float vShade;

void main() {
  vec2 uv = aPos;
  float px = (uv.x - 0.5) * uPlaneW;
  float py = (0.5 - uv.y) * uPlaneH;

  float t = uTime;
  float a1 = uv.x * 10.05 + t * 1.05 + uv.y * 3.0;
  float a2 = uv.x * 19.47 - t * 0.65 + uv.y * 7.5;
  float a3 = uv.y * 13.82 + t * 0.85 + uv.x * 2.2;

  float disp = uAmp * (0.62 * sin(a1) + 0.22 * sin(a2) + 0.34 * sin(a3));
  px += disp * 0.45;
  py += disp;

  float slope = uAmp * (0.62 * cos(a1) * 10.05 + 0.22 * cos(a2) * 19.47) / 10.0;
  vShade = slope;

  float c = cos(uRot), s = sin(uRot);
  vec2 p = vec2(c * px - s * py + uTx, s * px + c * py + uTy);
  gl_Position = vec4(p.x / uAspect, p.y, 0.0, 1.0);
  vUV = uv;
}`;

const FRAG = `
precision mediump float;
uniform sampler2D uTex;
uniform float uFade;
varying vec2 vUV;
varying float vShade;

void main() {
  vec2 uv = vec2(vUV.x * 2.0, vUV.y);   /* mirrored repeat across width */
  vec4 c = texture2D(uTex, uv);         /* premultiplied alpha */
  float sh = clamp(1.0 + vShade * 9.0, 0.62, 1.34);
  sh *= mix(0.8, 1.0, smoothstep(0.0, 0.5, vUV.y));
  gl_FragColor = vec4(c.rgb * sh * uFade, c.a * uFade);
}`;

const GRID_X = 96;
const GRID_Y = 128;

export function createFabric(canvas, texUrl) {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: true,
    premultipliedAlpha: false,
    powerPreference: 'high-performance',
  });
  if (!gl) return null;

  const prog = gl.createProgram();
  for (const [type, src] of [[gl.VERTEX_SHADER, VERT], [gl.FRAGMENT_SHADER, FRAG]]) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error('fabric shader:', gl.getShaderInfoLog(sh));
      return null;
    }
    gl.attachShader(prog, sh);
  }
  gl.linkProgram(prog);
  gl.useProgram(prog);

  /* grid geometry */
  const verts = new Float32Array((GRID_X + 1) * (GRID_Y + 1) * 2);
  let vi = 0;
  for (let y = 0; y <= GRID_Y; y++) {
    for (let x = 0; x <= GRID_X; x++) {
      verts[vi++] = x / GRID_X;
      verts[vi++] = y / GRID_Y;
    }
  }
  const idx = new Uint16Array(GRID_X * GRID_Y * 6);
  let ii = 0;
  for (let y = 0; y < GRID_Y; y++) {
    for (let x = 0; x < GRID_X; x++) {
      const a = y * (GRID_X + 1) + x;
      const b = a + 1;
      const c = a + GRID_X + 1;
      const d = c + 1;
      idx[ii++] = a; idx[ii++] = c; idx[ii++] = b;
      idx[ii++] = b; idx[ii++] = c; idx[ii++] = d;
    }
  }

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  for (const n of ['uTime', 'uAmp', 'uRot', 'uTx', 'uTy', 'uAspect', 'uPlaneW', 'uPlaneH', 'uFade', 'uTex']) {
    U[n] = gl.getUniformLocation(prog, n);
  }

  gl.enable(gl.BLEND);
  /* premultiplied compositing — keeps mipmaps from bleeding the keyed
     background color around the silk hems */
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  /* textures — the intro silk plus any transition silks loaded later */
  function loadTexture(url) {
    const handle = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, handle);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array([90, 16, 8, 255]));
    const ready = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, handle);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
        resolve();
      };
      img.src = url;
    });
    return { handle, ready };
  }

  const base = loadTexture(texUrl);
  const tex = base.handle;
  const ready = base.ready;

  /* animatable state — driven by the intro timeline */
  const state = {
    time: 0,
    amp: 0.02,
    rot: -0.21,
    tx: 0.9,
    ty: 2.3,
    fade: 1,
  };

  let aspect = 1, planeW = 4.8, planeH = 4.8;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    aspect = window.innerWidth / window.innerHeight;
    planeW = Math.max(2 * aspect * 1.45, 4.9);
    planeH = Math.max(planeW, 5.2);
  }
  resize();

  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindTexture(gl.TEXTURE_2D, state.texHandle || tex);
    gl.uniform1f(U.uTime, state.time);
    gl.uniform1f(U.uAmp, state.amp);
    gl.uniform1f(U.uRot, state.rot);
    gl.uniform1f(U.uTx, state.tx);
    gl.uniform1f(U.uTy, state.ty);
    gl.uniform1f(U.uAspect, aspect);
    gl.uniform1f(U.uPlaneW, planeW);
    gl.uniform1f(U.uPlaneH, planeH);
    gl.uniform1f(U.uFade, state.fade);
    gl.uniform1i(U.uTex, 0);
    gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
  }

  /* compile + first draw now so the click moment never stutters */
  render();

  return { gl, state, render, resize, ready, loadTexture };
}
