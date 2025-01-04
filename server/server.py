from http.server import SimpleHTTPRequestHandler, HTTPServer


# 设置服务器地址和端口
host = "localhost"
port = 8000

# 定义处理程序
handler = SimpleHTTPRequestHandler

# 当前目录
handler.directory = "static"
home = "./index.html"

# 创建服务器
with HTTPServer((host, port), handler) as server:
    print(f"Server started at {host}:{port}")
    # 启动服务器
    server.serve_forever()
