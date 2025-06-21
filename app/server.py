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