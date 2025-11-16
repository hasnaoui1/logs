import time
import paho.mqtt.client as mqtt
import random
import json
from datetime import datetime

broker = "localhost"
topic = "logs/simulation"
robot_id = 1

client = mqtt.Client(client_id="robot-log-simulator")
client.connect(broker, 1883, 60)

# ------- REALISTIC LOG TEMPLATES -------- #

INFO_LOGS = [
    lambda: f"[INFO] CPU Usage: {random.randint(8, 80)}%",
    lambda: f"[INFO] Memory Usage: {random.randint(1000, 8000)}MB",
    lambda: f"[INFO] Battery: {random.randint(20, 100)}%",
    lambda: f"[INFO] Temperature: {random.randint(40, 85)}°C",
    lambda: f"[INFO] Motor torque stabilized on joint {random.randint(1, 6)}",
    lambda: f"[INFO] Sensor check OK (LIDAR: {random.randint(10, 30)}k points/s)",
    lambda: f"[INFO] Odometry updated (x={random.uniform(0,10):.2f}, y={random.uniform(0,10):.2f})",
    lambda: f"[INFO] FPS: {random.randint(15, 60)}",
]

WARNING_LOGS = [
    lambda: f"[WARNING] Battery low: {random.randint(5, 20)}%",
    lambda: f"[WARNING] Motor overheating (joint {random.randint(1, 6)})",
    lambda: f"[WARNING] High CPU load detected: {random.randint(80, 98)}%",
    lambda: f"[WARNING] Network latency spike: {random.randint(100, 500)}ms",
    lambda: f"[WARNING] Sensor noise increased on LIDAR",
]

ERROR_LOGS = [
    lambda: "[ERROR] Joint controller failure on axis 2",
    lambda: "[ERROR] Obstacle detected: emergency brake engaged",
    lambda: "[ERROR] Lost communication with navigation module",
    lambda: "[ERROR] Unable to localize robot (SLAM failure)",
    lambda: "[ERROR] Motor stall detected on wheel 1",
]

EVENT_LOGS = [
    lambda: "[EVENT] Robot started navigation task",
    lambda: "[EVENT] Reached checkpoint A",
    lambda: "[EVENT] Docking for charging",
    lambda: "[EVENT] Human detected, switching to safe mode",
    lambda: "[EVENT] Route recalculated due to obstruction",
]

# Weighted distribution (realistic)
LOG_WEIGHTS = [
    ("INFO", 0.70),
    ("WARNING", 0.15),
    ("ERROR", 0.10),
    ("EVENT", 0.05),
]

def pick_log():
    r = random.random()
    cumulative = 0
    for log_type, weight in LOG_WEIGHTS:
        cumulative += weight
        if r <= cumulative:
            return log_type
    return "INFO"

def generate_log():
    log_type = pick_log()

    if log_type == "INFO":
        msg = random.choice(INFO_LOGS)()
    elif log_type == "WARNING":
        msg = random.choice(WARNING_LOGS)()
    elif log_type == "ERROR":
        msg = random.choice(ERROR_LOGS)()
    else:
        msg = random.choice(EVENT_LOGS)()

    timestamp = datetime.utcnow().isoformat()

    # Final format: robotId|timestamp|message
    return f"{robot_id}|{timestamp}|{msg}"

# ------------ PUBLISH LOOP ------------ #

try:
    while True:
        log = generate_log()
        client.publish(topic, log)
        print("Published:", log)
        time.sleep(random.uniform(0.5, 1.5))  # Realistic frequency

except KeyboardInterrupt:
    print("Stopped.")
    client.disconnect()
