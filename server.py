# Python Backend: Custom HTTP Server with API Routing for Stock Evaluator
import os
import json
from http.server import SimpleHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

PORT = int(os.environ.get("PORT", 8080))

class CustomAPIHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # API Route to trigger data refresh
        parsed_path = urlparse(self.path)
        if parsed_path.path == '/api/refresh':
            try:
                query_params = parse_qs(parsed_path.query)
                is_force = query_params.get('force', ['false'])[0].lower() == 'true'
                
                if is_force:
                    print("後端收到帶有 force=true 的 /api/refresh 請求，將強制重新抓取數據...")
                else:
                    print("後端收到 /api/refresh 請求，嘗試讀取快取或更新數據...")
                
                # Import fetch function directly from analyzer.py
                from analyzer import fetch_realtime_data
                data = fetch_realtime_data(force=is_force)

                
                self.send_response(200)
                self.send_header('Content-type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response_str = json.dumps(data, ensure_ascii=False)
                self.wfile.write(response_str.encode('utf-8'))
                print("後端成功更新數據並回傳 JSON。")
            except Exception as e:
                print(f"後端更新數據失敗: {e}")
                self.send_response(500)
                self.send_header('Content-type', 'text/plain; charset=utf-8')
                self.end_headers()
                self.wfile.write(f"後端更新失敗: {str(e)}".encode('utf-8'))
        else:
            # Default static file server
            super().do_GET()

def run_server():
    # Set current directory to directory of this script to serve local static files correctly
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, CustomAPIHandler)
    print(f"Server started! Please open in browser: http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")

if __name__ == "__main__":
    run_server()
