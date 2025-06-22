// app/hooks/usePushupAnalysis.ts

import { useState, useEffect } from 'react';
import { calculateAngle } from '../../lib/utils';

interface Landmark {
  x: number; y: number; z: number; visibility: number;
}

const LANDMARK_INDICES = {
  LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13, RIGHT_ELBOW: 14,
  LEFT_WRIST: 15, RIGHT_WRIST: 16,
  LEFT_HIP: 23, RIGHT_HIP: 24,
  LEFT_KNEE: 25, RIGHT_KNEE: 26,
  LEFT_ANKLE: 27, RIGHT_ANKLE: 28,
};

/**
 * A custom hook for analyzing push-up form.
 * @param landmarks - An array of pose landmarks from usePoseEstimation.
 * @returns An object containing angles, rep counter, and real-time feedback.
 */
export const usePushupAnalysis = (landmarks: Landmark[]) => {
  const [stage, setStage] = useState<'up' | 'down'>('up');
  const [counter, setCounter] = useState(0);
  const [feedback, setFeedback] = useState('Begin your push-ups when ready.');
  const [angles, setAngles] = useState({ leftElbow: 0, rightElbow: 0, bodyAngle: 0 });

  const UP_THRESHOLD = 160;
  const DOWN_THRESHOLD = 90;
  const PLANK_ALIGNMENT_THRESHOLD = 160; // Angle for a straight body

  useEffect(() => {
    if (!landmarks || landmarks.length === 0) return;

    const p = LANDMARK_INDICES;
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
    if (leftShoulder?.visibility > 0.5 && leftHip?.visibility > 0.5 && leftKnee?.visibility > 0.5) {
      newAngles.bodyAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
    } else if (rightShoulder?.visibility > 0.5 && rightHip?.visibility > 0.5 && rightKnee?.visibility > 0.5) {
        newAngles.bodyAngle = calculateAngle(rightShoulder, rightHip, rightKnee);
    }


    setAngles(newAngles);

    let activeElbowAngle = 0;
    if (newAngles.leftElbow > 0 && newAngles.rightElbow > 0) {
      activeElbowAngle = (newAngles.leftElbow + newAngles.rightElbow) / 2;
    } else if (newAngles.leftElbow > 0) {
      activeElbowAngle = newAngles.leftElbow;
    } else {
      activeElbowAngle = newAngles.rightElbow;
    }

    if (activeElbowAngle === 0) return;

    // Rep Counting and Feedback Logic
    let newFeedback = feedback;
    if (newAngles.bodyAngle < PLANK_ALIGNMENT_THRESHOLD) {
        newFeedback = "Keep your back straight!";
    } else {
        if (stage === 'up' && activeElbowAngle < DOWN_THRESHOLD) {
            setStage('down');
            newFeedback = "Push up!";
        } else if (stage === 'down' && activeElbowAngle > UP_THRESHOLD) {
            setStage('up');
            setCounter(prev => prev + 1);
            newFeedback = "Good Rep!";
        } else if (stage === 'up') {
            newFeedback = (counter > 0) ? "Ready for next rep." : "Begin your push-ups.";
        }
    }
    
    if (newFeedback !== feedback) {
        setFeedback(newFeedback);
    }

  }, [landmarks, stage, feedback, counter]);

  return { angles, counter, feedback };
};