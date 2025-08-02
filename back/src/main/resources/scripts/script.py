import requests
import time
import random
import datetime
from collections import deque

API_URL = "http://localhost:8080/api/logs"
TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJoYXNhbWluZTY2QGdtYWlsLmNvbSIsImlhdCI6MTc1Mzk0ODU3OCwiZXhwIjoxNzUzOTg0NTc4fQ.3gmuHpqyIsfLfxEyRSgRyMVhfmx7cqkt9XS1vRdWcA8"
ROBOT_ID = 2

GRID_SIZE = 5
position = {"x": 0, "y": 0}
LOG_HISTORY = deque(maxlen=9)

LOG_LEVELS = ["INFO", "WARNING", "ERROR"]
MESSAGES = {
    "INFO": [
        "Moved successfully",
        "Heartbeat OK",
        "Battery stable",
        "Sensor read complete",
        "Ping response normal",
        "Awaiting next instruction"
    ],
    "WARNING": [
        "Battery below 30%",
        "Temperature approaching threshold",
        "High CPU usage detected",
        "Sensor delay",
        "Obstacle nearby"
    ],
    "ERROR": [
        "Motor failure",
        "Lost GPS signal",
        "Critical system error",
        "Navigation stuck",
        "Cannot reach destination"
    ]
}

# === Determine next log level based on history ===
def next_log_type():
    counts = {"INFO": 0, "WARNING": 0, "ERROR": 0}
    for l in LOG_HISTORY:
        counts[l] += 1
    if counts["INFO"] < 6:
        return "INFO"
    elif counts["WARNING"] < 2:
        return "WARNING"
    else:
        return "ERROR"

# === Generate a movement-based log ===
def generate_log():
    global position

    direction = random.choice(["up", "down", "left", "right"])
    old_pos = position.copy()

    if direction == "up":
        position["y"] = max(0, position["y"] - 1)
    elif direction == "down":
        position["y"] = min(GRID_SIZE - 1, position["y"] + 1)
    elif direction == "left":
        position["x"] = max(0, position["x"] - 1)
    elif direction == "right":
        position["x"] = min(GRID_SIZE - 1, position["x"] + 1)

    stuck = old_pos == position
    timestamp = datetime.datetime.utcnow().isoformat()

    if stuck:
        log_type = "ERROR"
        message = f"Tried to move {direction} but hit wall"
    else:
        log_type = next_log_type()
        message = (
            f"Moved {direction} to ({position['x']},{position['y']})"
            if log_type == "INFO"
            else random.choice(MESSAGES[log_type])
        )

    LOG_HISTORY.append(log_type)

    return {
        "robotId": ROBOT_ID,
        "type": log_type,
        "message": message,
        "timestamp": timestamp
    }

# === Send log to backend ===
def send_log():
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json"
    }

    while True:
        log_data = generate_log()
        try:
            response = requests.post(
                f"{API_URL}?token={TOKEN}",
                json=log_data,
                headers=headers
            )
            print(f"[{log_data['timestamp']}] Sent {log_data['type']}: {log_data['message']} - Status: {response.status_code}")
        except Exception as e:
            print("Error sending log:", e)

        time.sleep(1.5)

if __name__ == "__main__":
    send_log()
