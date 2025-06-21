// hooks/useSquatAnalysis.ts

import { useState, useEffect } from 'react';
import { calculateAngle } from '../../lib/utils';

interface Landmark {
  x: number; y: number; z: number; visibility: number;
}
const LANDMARK_INDICES = {
  LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12, LEFT_HIP: 23,
  RIGHT_HIP: 24, LEFT_KNEE: 25, RIGHT_KNEE: 26,
  LEFT_ANKLE: 27, RIGHT_ANKLE: 28,
};

/**
 * A robust, stateful custom hook with advanced, responsive form analysis.
 * @param landmarks - An array of pose landmarks from usePoseEstimation.
 * @returns An object containing angles, rep counter, and real-time feedback.
 */
export const useSquatAnalysis = (landmarks: Landmark[]) => {
  const [stage, setStage] = useState<'up' | 'down'>('up');
  const [counter, setCounter] = useState(0);
  const [feedback, setFeedback] = useState('Begin your squats when ready.');
  const [angles, setAngles] = useState({ leftHip: 0, rightHip: 0, leftKnee: 0, rightKnee: 0 });
  
  const [upFrames, setUpFrames] = useState(0);
  const [downFrames, setDownFrames] = useState(0);

  const FRAME_CONFIRMATION_THRESHOLD = 50;
  const STANDING_THRESHOLD = 160;
  const SQUAT_THRESHOLD = 100;
  const ANGLE_DEVIATION_THRESHOLD = 10;

  useEffect(() => {
    if (!landmarks || landmarks.length === 0) return;

    // --- (Angle Calculation and Smart Angle Selection logic remains the same) ---
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

    // --- NEW HIERARCHICAL FEEDBACK LOGIC ---
    
    // First, update the rep counter and stage based on frame confirmations
    let repJustCompleted = false;
    if (activeKneeAngle > STANDING_THRESHOLD) {
      setUpFrames(prev => prev + 1);
      setDownFrames(0);
      if (upFrames > FRAME_CONFIRMATION_THRESHOLD && stage === 'down') {
        setStage('up');
        setCounter(prev => prev + 1);
        repJustCompleted = true; // Flag that a rep was just completed
      }
    } else if (activeKneeAngle < SQUAT_THRESHOLD) {
      setDownFrames(prev => prev + 1);
      setUpFrames(0);
      if (downFrames > FRAME_CONFIRMATION_THRESHOLD && stage === 'up') {
        setStage('down');
      }
    }

    // Now, determine the feedback based on a priority list
    let newFeedback = "";

    // 1. Highest Priority: Form Correction
    const angleDifference = Math.abs(activeHipAngle - activeKneeAngle);
    if (angleDifference > ANGLE_DEVIATION_THRESHOLD) {
      newFeedback = "Keep your back straight!";
    }
    // 2. Next Priority: Milestone events
    else if (repJustCompleted) {
      newFeedback = "Good Rep!";
    } else if (stage === 'down') {
      newFeedback = "Push up!";
    }
    // 3. Lowest Priority: Neutral state
    else if (stage === 'up') {
      newFeedback = (counter > 0) ? "Ready for next rep." : "Begin your squats.";
    }

    // Only update the state if the feedback message has actually changed
    if (newFeedback && newFeedback !== feedback) {
      setFeedback(newFeedback);
    }
    
  }, [landmarks, stage, upFrames, downFrames, feedback, counter]); // Added dependencies

  return { angles, counter, feedback };
};