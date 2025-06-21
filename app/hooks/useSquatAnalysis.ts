import { useState, useEffect } from 'react';
import { calculateAngle } from '../../lib/utils';

// Define the shape of a landmark point for clarity
interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

// Define landmark indices for clarity and easy access
const LANDMARK_INDICES = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

/**
 * A custom hook to analyze squat angles from MediaPipe pose landmarks.
 * @param landmarks - An array of pose landmarks from the usePoseEstimation hook.
 * @returns An object containing the calculated angles for hips and knees.
 */
export const useSquatAnalysis = (landmarks: Landmark[]) => {
  const [angles, setAngles] = useState({
    leftHip: 0,
    rightHip: 0,
    leftKnee: 0,
    rightKnee: 0,
  });

  useEffect(() => {
    // Only proceed if we have a valid landmarks array
    if (landmarks && landmarks.length > 0) {
      const p = LANDMARK_INDICES; // shorthand

      // Get all the necessary points from the landmarks array
      const leftShoulder = landmarks[p.LEFT_SHOULDER];
      const rightShoulder = landmarks[p.RIGHT_SHOULDER];
      const leftHip = landmarks[p.LEFT_HIP];
      const rightHip = landmarks[p.RIGHT_HIP];
      const leftKnee = landmarks[p.LEFT_KNEE];
      const rightKnee = landmarks[p.RIGHT_KNEE];
      const leftAnkle = landmarks[p.LEFT_ANKLE];
      const rightAnkle = landmarks[p.RIGHT_ANKLE];
      
      let newAngles = { leftHip: 0, rightHip: 0, leftKnee: 0, rightKnee: 0 };

      // --- Angle Calculations ---
      // We check for the visibility of all three points involved in an angle before calculating it.
      
      // Calculate Left Hip Angle (Shoulder, Hip, Knee)
      if (leftShoulder?.visibility > 0.5 && leftHip?.visibility > 0.5 && leftKnee?.visibility > 0.5) {
        newAngles.leftHip = calculateAngle(leftShoulder, leftHip, leftKnee);
      }
      
      // Calculate Right Hip Angle
      if (rightShoulder?.visibility > 0.5 && rightHip?.visibility > 0.5 && rightKnee?.visibility > 0.5) {
        newAngles.rightHip = calculateAngle(rightShoulder, rightHip, rightKnee);
      }
      
      // Calculate Left Knee Angle (Hip, Knee, Ankle)
      if (leftHip?.visibility > 0.5 && leftKnee?.visibility > 0.5 && leftAnkle?.visibility > 0.5) {
        newAngles.leftKnee = calculateAngle(leftHip, leftKnee, leftAnkle);
      }
      
      // Calculate Right Knee Angle
      if (rightHip?.visibility > 0.5 && rightKnee?.visibility > 0.5 && rightAnkle?.visibility > 0.5) {
        newAngles.rightKnee = calculateAngle(rightHip, rightKnee, rightAnkle);
      }
      
      setAngles(newAngles); // Update the state with all newly calculated angles
    }
  }, [landmarks]); // This effect re-runs only when the landmarks array changes

  return angles;
};