
from flask import Flask, jsonify
from datetime import datetime, timezone
import os

app = Flask(__name__)

# Stores the most recent cron execution time
last_run = None


@app.route("/")
def hello():
    return jsonify({
        "message": "Hello World!",
        "status": "Cron demo is running!"
    })


@app.route("/cron-trigger", methods=["GET"])
def cron_trigger():
    global last_run

    last_run = datetime.now(timezone.utc).isoformat()

    return jsonify({
        "message": "Cron job successfully executed!",
        "last_run": last_run
    })


@app.route("/cron-status", methods=["GET"])
def cron_status():
    return jsonify({
        "last_run": last_run
    })


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5002))
    )
