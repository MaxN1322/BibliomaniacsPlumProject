
from flask import Flask, jsonify
from datetime import datetime

app = Flask(__name__)

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    return response

@app.route("/")
def hello():
    return jsonify({
        "message": "Hello World!",
        "status": "Cron job successfully executed!",
        "timestamp": datetime.now().isoformat()
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002)