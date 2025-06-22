// hooks/useSquatAnalysis.ts

import { useState, useEffect } from 'react';
import { calculateAngle } from '../../lib/utils'; // Make sure this path is correct

// Define the shape of a landmark point
interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

// Landmark indices for clarity
const LANDMARK_INDICES = {
  LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12, LEFT_HIP: 23,
  RIGHT_HIP: 24, LEFT_KNEE: 25, RIGHT_KNEE: 26,
  LEFT_ANKLE: 27, RIGHT_ANKLE: 28,
};

/**
 * A robust, stateful custom hook that analyzes squat form, counts reps,
 * and identifies specific form errors to be handled by an external service.
 * @param landmarks - An array of pose landmarks from usePoseEstimation.
 * @returns An object containing angles, rep counter, and the current form error.
 */
export const useSquatAnalysis = (landmarks: Landmark[]) => {
  const [stage, setStage] = useState<'up' | 'down'>('up');
  const [counter, setCounter] = useState(0);
  const [angles, setAngles] = useState({ leftHip: 0, rightHip: 0, leftKnee: 0, rightKnee: 0 });
  
  // NEW: This state's job is to flag when a form error occurs.
  const [formError, setFormError] = useState<string | null>(null);

  const [upFrames, setUpFrames] = useState(0);
  const [downFrames, setDownFrames] = useState(0);

  // Constants for tuning the analysis
  const FRAME_CONFIRMATION_THRESHOLD = 50;
  const STANDING_THRESHOLD = 160;
  const SQUAT_THRESHOLD = 100;
  const ANGLE_DEVIATION_THRESHOLD = 20;

  useEffect(() => {
    if (!landmarks || landmarks.length === 0) return;

    // --- Angle Calculation & Smart Selection (remains the same) ---
    const p = LANDMARK_INDICES;
    const leftShoulder = landmarks[p.LEFT_SHOULDER]; const rightShoulder = landmarks[p.RIGHT_SHOULDER];
    const leftHip = landmarks[p.LEFT_HIP]; const rightHip = landmarks[p.RIGHT_HIP];
    const leftKnee = landmarks[p.LEFT_KNEE]; const rightKnee = landmarks[p.RIGHT_KNEE];
    const leftAnkle = landmarks[p.LEFT_ANKLE]; const rightAnkle = landmarks[p.RIGHT_ANKLE];
    const newAngles = { leftHip: 0, rightHip: 0, leftKnee: 0, rightKnee: 0 };
    if (leftShoulder?.visibility > 0.5 && leftHip?.visibility > 0.5 && leftKnee?.visibility > 0.5) newAngles.leftHip = calculateAngle(leftShoulder, leftHip, leftKnee);
    if (rightShoulder?.visibility > 0.5 && rightHip?.visibility > 0.5 && rightKnee?.visibility > 0.5) newAngles.rightHip = calculateAngle(rightShoulder, rightHip, rightKnee);
    if (leftHip?.visibility > 0.5 && leftKnee?.visibility > 0.5 && leftAnkle?.visibility > 0.5) newAngles.leftKnee = calculateAngle(leftHip, leftKnee, leftAnkle);
    if (rightHip?.visibility > 0.5 && rightKnee?.visibility > 0.5 && rightAnkle?.visibility > 0.5) newAngles.rightKnee = calculateAngle(rightHip, rightKnee, rightAnkle);
    setAngles(newAngles);
    
    let activeKneeAngle = 0;
    if (newAngles.leftKnee > 0 && newAngles.rightKnee > 0) activeKneeAngle = (newAngles.leftKnee + newAngles.rightKnee) / 2;
    else if (newAngles.leftKnee > 0) activeKneeAngle = newAngles.leftKnee;
    else activeKneeAngle = newAngles.rightKnee;
    
    let activeHipAngle = 0;
    if (newAngles.leftHip > 0 && newAngles.rightHip > 0) activeHipAngle = (newAngles.leftHip + newAngles.rightHip) / 2;
    else if (newAngles.leftHip > 0) activeHipAngle = newAngles.leftHip;
    else activeHipAngle = newAngles.rightHip;

    if (activeKneeAngle === 0) return;

    // --- Form Error Detection ---
    const angleDifference = Math.abs(activeHipAngle - activeKneeAngle);
    let currentError: string | null = null;

    if (activeKneeAngle < STANDING_THRESHOLD && activeHipAngle > 0 && angleDifference > ANGLE_DEVIATION_THRESHOLD) {
      currentError = "Keep your back straight!";
    }
    
    // Set or clear the form error state.
    // This will trigger the useEffect in page.tsx to call the AI.
    setFormError(currentError);

    // --- Rep Counting Logic (unaffected by feedback) ---
    if (activeKneeAngle > STANDING_THRESHOLD) {
      setUpFrames(prev => prev + 1);
      setDownFrames(0);
      if (upFrames > FRAME_CONFIRMATION_THRESHOLD && stage === 'down') {
        setStage('up');
        setCounter(prev => prev + 1);
      }
    } else if (activeKneeAngle < SQUAT_THRESHOLD) {
      setDownFrames(prev => prev + 1);
      setUpFrames(0);
      if (downFrames > FRAME_CONFIRMATION_THRESHOLD && stage === 'up') {
        setStage('down');
      }
    }
    
  }, [landmarks, stage, upFrames, downFrames]);

  // Return the calculated angles, counter, and the specific form error
  return { angles, counter, formError };
};