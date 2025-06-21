import cv2
import mediapipe as mp
import numpy as np

def calculate_angle(a, b, c):
    """Calculate the angle between three points."""
    a = np.array(a)  # First point
    b = np.array(b)  # Middle point
    c = np.array(c)  # Last point

    # Calculate the angle using the dot product and arccosine
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)

    if angle > 180:
        angle = 360 - angle

    return angle

def get_angle_from_landmarks(landmarks, point1, point2, point3):
    
    """Get the angle from three landmarks."""
    a = (landmarks[point1].x, landmarks[point1].y)
    b = (landmarks[point2].x, landmarks[point2].y)
    c = (landmarks[point3].x, landmarks[point3].y)

    return calculate_angle(a, b, c)

def process_image(image, pose, mp_pose, mp_drawing):
    """Process the image to detect pose landmarks and calculate angles."""
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = pose.process(image)

    if results.pose_landmarks:
        landmarks = results.pose_landmarks.landmark

        # Example: Calculate angle between left shoulder, left elbow, and left wrist
        left_shoulder_angle = get_angle_from_landmarks(landmarks, mp_pose.PoseLandmark.LEFT_SHOULDER.value,
                                                       mp_pose.PoseLandmark.LEFT_ELBOW.value,
                                                       mp_pose.PoseLandmark.LEFT_WRIST.value)

        # Draw landmarks and connections
        mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

        return image, left_shoulder_angle

    return image, None