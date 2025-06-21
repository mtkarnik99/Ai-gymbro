# server.py

from fastapi import FastAPI, WebSocket
import cv2
import mediapipe as mp
import numpy as np
import base64
import json

app = FastAPI()

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    if angle > 180.0:
        angle = 360 - angle
    return angle

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        # Receive image data from the browser
        data = await websocket.receive_text()

        # The data is a base64 encoded string, decode it
        img_data = base64.b64decode(data.split(',')[1])
        nparr = np.frombuffer(img_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # --- Process the frame with MediaPipe ---
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(image)

        landmarks_list = []
        if results.pose_landmarks:
            for landmark in results.pose_landmarks.landmark:
                landmarks_list.append({
                    'x': landmark.x,
                    'y': landmark.y,
                    'z': landmark.z,
                    'visibility': landmark.visibility
                })

        # Send the landmarks back to the browser as a JSON string
        await websocket.send_text(json.dumps(landmarks_list))