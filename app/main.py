import cv2
import mediapipe as mp
import numpy as np
from utils import process_image

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)
mp_drawing = mp.solutions.drawing_utils

def main():
    """Main function to run the pose detection."""
    cap = cv2.VideoCapture(0)

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame, angle = process_image(frame, pose, mp_pose, mp_drawing)

        if angle is not None:
            cv2.putText(frame, f'Left Shoulder Angle: {angle:.2f}', (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)

        cv2.imshow('Pose Detection', frame)

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()