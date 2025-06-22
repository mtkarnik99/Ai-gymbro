// app/hooks/usePushupAnalysis.ts

import { useState, useEffect } from 'react';
import { calculateAngle } from '../../lib/utils';

// Define the shape of a landmark point
interface Landmark {
  x: number; y: number; z: number; visibility: number;
}

// Landmark indices needed for push-up analysis
const LANDMARK_INDICES = {
  LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13, RIGHT_ELBOW: 14,
  LEFT_WRIST: 15, RIGHT_WRIST: 16,
  LEFT_HIP: 23, RIGHT_HIP: 24,
  LEFT_KNEE: 25, RIGHT_KNEE: 26,
};

/**
 * A robust, stateful custom hook for analyzing push-up form.
 * It detects form errors and provides a trigger for AI feedback.
 * @param landmarks - An array of pose landmarks from usePoseEstimation.
 * @returns An object containing angles, rep counter, and the current form error.
 */
export const usePushupAnalysis = (landmarks: Landmark[]) => {
  // State for the analysis
  const [stage, setStage] = useState<'up' | 'down'>('up');
  const [counter, setCounter] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [angles, setAngles] = useState({ leftElbow: 0, rightElbow: 0, bodyAngle: 0 });

  // State for robust rep counting
  const [upFrames, setUpFrames] = useState(0);
  const [downFrames, setDownFrames] = useState(0);

  // Constants for tuning the analysis
  const FRAME_CONFIRMATION_THRESHOLD = 3;
  const UP_THRESHOLD = 160;    // Angle for a straight arm
  const DOWN_THRESHOLD = 90;   // Angle for the bottom of a push-up
  const PLANK_ALIGNMENT_THRESHOLD = 150; // Minimum angle for a straight body/back

  useEffect(() => {
    if (!landmarks || landmarks.length === 0) return;

    const p = LANDMARK_INDICES;
    
    // --- Angle Calculation ---
    const leftShoulder = landmarks[p.LEFT_SHOULDER];
    const rightShoulder = landmarks[p.RIGHT_SHOULDER];
    const leftElbow = landmarks[p.LEFT_ELBOW];
    const rightElbow = landmarks[p.RIGHT_ELBOW];
    const leftWrist = landmarks[p.LEFT_WRIST];
    const rightWrist = landmarks[p.RIGHT_WRIST];
    const leftHip = landmarks[p.LEFT_HIP];
    const rightHip = landmarks[p.RIGHT_HIP];
    const leftKnee = landmarks[p.LEFT_KNEE];
    const rightKnee = landmarks[p.RIGHT_KNEE];

    const newAngles = { leftElbow: 0, rightElbow: 0, bodyAngle: 0 };

    if (leftShoulder?.visibility > 0.5 && leftElbow?.visibility > 0.5 && leftWrist?.visibility > 0.5) {
      newAngles.leftElbow = calculateAngle(leftShoulder, leftElbow, leftWrist);
    }
    if (rightShoulder?.visibility > 0.5 && rightElbow?.visibility > 0.5 && rightWrist?.visibility > 0.5) {
      newAngles.rightElbow = calculateAngle(rightShoulder, rightElbow, rightWrist);
    }
    
    // Calculate body angle using the most visible side
    if (leftShoulder?.visibility > 0.5 && leftHip?.visibility > 0.5 && leftKnee?.visibility > 0.5) {
      newAngles.bodyAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
    } else if (rightShoulder?.visibility > 0.5 && rightHip?.visibility > 0.5 && rightKnee?.visibility > 0.5) {
      newAngles.bodyAngle = calculateAngle(rightShoulder, rightHip, rightKnee);
    }

    setAngles(newAngles);

    // --- Smart Angle Selection ---
    let activeElbowAngle = 0;
    if (newAngles.leftElbow > 0 && newAngles.rightElbow > 0) activeElbowAngle = (newAngles.leftElbow + newAngles.rightElbow) / 2;
    else if (newAngles.leftElbow > 0) activeElbowAngle = newAngles.leftElbow;
    else activeElbowAngle = newAngles.rightElbow;

    if (activeElbowAngle === 0) return;

    // --- Form Error Detection ---
    let currentError: string | null = null;
    if (newAngles.bodyAngle > 0 && newAngles.bodyAngle < PLANK_ALIGNMENT_THRESHOLD) {
      currentError = "Keep your back straight!";
    }
    setFormError(currentError); // Set or clear the form error for the parent component

    // --- Robust Rep Counting Logic ---
    if (activeElbowAngle > UP_THRESHOLD) {
      setUpFrames(prev => prev + 1);
      setDownFrames(0);
      if (upFrames > FRAME_CONFIRMATION_THRESHOLD && stage === 'down') {
        setStage('up');
        setCounter(prev => prev + 1);
      }
    } else if (activeElbowAngle < DOWN_THRESHOLD) {
      setDownFrames(prev => prev + 1);
      setUpFrames(0);
      if (downFrames > FRAME_CONFIRMATION_THRESHOLD && stage === 'up') {
        setStage('down');
      }
    }

  }, [landmarks, stage, upFrames, downFrames]);

  // Return the same object shape as useSquatAnalysis
  return { angles, counter, formError };
};