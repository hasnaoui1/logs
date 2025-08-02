import requests
import time
import random
import datetime

API_URL = "http://localhost:8080/api/logs"
TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJoYXNhbWluZTY2QGdtYWlsLmNvbSIsImlhdCI6MTc1MzY4OTgzNSwiZXhwIjoxNzUzNzI1ODM1fQ.ZLLVSiGAKJbzoxXpM1f8KrjXsnmfxNXDp1HCV2LCqhk"  # <- paste your valid JWT token here
ROBOT_ID = 1  

LOG_LEVELS = ["INFO", "WARNING", "ERROR"]
MESSAGES = {
    "INFO": ["System running smoothly", "Heartbeat OK", "Battery stable"],
    "WARNING": ["High temperature detected", "Battery below 30%", "Sensor delay"],
    "ERROR": ["Motor failure", "Lost GPS signal", "Critical system error"]
}
def generate_log():
    log_type = random.choice(LOG_LEVELS)
    message = random.choice(MESSAGES[log_type])
    timestamp = datetime.datetime.utcnow().isoformat()
    return {
        "robotId": ROBOT_ID,
        "type": log_type,
        "message": message,
        "timestamp": timestamp
    }

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

        time.sleep(0.1)  


if __name__ == "__main__":
    send_log()
