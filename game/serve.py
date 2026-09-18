#!/usr/bin/env python3
import http.server, socketserver, os
PORT=8000
os.chdir(os.path.dirname(__file__))
Handler=http.server.SimpleHTTPRequestHandler
Handler.extensions_map.update({".js":"application/javascript",".css":"text/css",".html":"text/html",".json":"application/json"})
class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

with ReusableTCPServer(("", PORT), Handler) as httpd:
    print(f"Serving F1 Clash Zero at http://localhost:{PORT}")
    httpd.serve_forever()
