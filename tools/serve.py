"""SIAARA dev server — static files with caching disabled so module
updates always reach the browser during design iteration."""
import http.server
import functools
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    handler = functools.partial(NoCacheHandler, directory=ROOT)
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 4174), handler)
    print(f"serving {ROOT} at http://127.0.0.1:4174 (no-store)")
    server.serve_forever()
