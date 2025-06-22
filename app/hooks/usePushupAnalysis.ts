// app/hooks/usePushupAnalysis.ts

import { useState, useEffect } from 'react';
import { calculateAngle } from '../../lib/utils'; // Ensure this path is correct

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
 * @param landmarks - An array of pose landmarks.
 * @param exercise - The currently selected exercise ('squat' or 'pushup').
 * @returns An object containing angles, rep counter, and the current form error.
 */
export const usePushupAnalysis = (landmarks: any[], exercise: 'squat' | 'pushup') => {
  // --- Internal State for the Hook ---
  const [stage, setStage] = useState<'up' | 'down'>('up');
  const [counter, setCounter] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [angles, setAngles] = useState({ leftElbow: 0, rightElbow: 0, bodyAngle: 0 });

  // State for robust rep counting
  const [upFrames, setUpFrames] = useState(0);
  const [downFrames, setDownFrames] = useState(0);
  const [errorFrames, setErrorFrames] = useState(0);
  
  // Constants for tuning the analysis
  const FRAME_CONFIRMATION_THRESHOLD = 50;
  const ERROR_CONFIRMATION_THRESHOLD = 150; // Frames to confirm an error
  const UP_THRESHOLD = 160;    // Angle for a straight arm in the "up" position
  const DOWN_THRESHOLD = 90;   // Angle for the bottom of a push-up
  const PLANK_ALIGNMENT_THRESHOLD = 150; // Minimum angle for a straight body/back

  // This useEffect resets the state if the user switches to a different exercise
  useEffect(() => {
    if (exercise !== 'pushup') {
      setCounter(0);
      setStage('up');
      setFormError(null);
      setUpFrames(0);
      setDownFrames(0);
      setErrorFrames(0);
    }
  }, [exercise]);

  // This is the main analysis effect
  useEffect(() => {
    // Guard clause to stop processing if this is not the active exercise
    if (exercise !== 'pushup' || !landmarks || landmarks.length === 0) {
      return;
    }

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

    // Calculate elbow angles
    if (leftShoulder?.visibility > 0.5 && leftElbow?.visibility > 0.5 && leftWrist?.visibility > 0.5) {
      newAngles.leftElbow = calculateAngle(leftShoulder, leftElbow, leftWrist);
    }
    if (rightShoulder?.visibility > 0.5 && rightElbow?.visibility > 0.5 && rightWrist?.visibility > 0.5) {
      newAngles.rightElbow = calculateAngle(rightShoulder, rightElbow, rightWrist);
    }
    
    // Calculate body angle (shoulder-hip-knee) to check for a straight plank
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

    if (activeElbowAngle === 0) return; // Fail-safe

    if (newAngles.bodyAngle > 0 && newAngles.bodyAngle < PLANK_ALIGNMENT_THRESHOLD) {
      // If form is bad, increment the error frame counter
      setErrorFrames(prev => prev + 1);
    } else {
      // If form is good, reset the counter and clear any existing error
      setErrorFrames(0);
      setFormError(null);
    }

    // If the error has persisted past the threshold, set the official error state
    if (errorFrames > ERROR_CONFIRMATION_THRESHOLD) {
      setFormError("Keep your back straight!");
    }

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

  }, [landmarks, exercise, stage, upFrames, downFrames]);

  // Return the same object shape as useSquatAnalysis for seamless integration
  return { angles, counter, formError };
};