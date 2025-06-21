// hooks/usePoseEstimation.ts

import { useState, useEffect, useRef } from 'react';
import { Pose } from '@mediapipe/pose';

// Define the shape of the arguments this hook will take
interface PoseEstimationProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isCameraOn: boolean;
}

export const usePoseEstimation = ({ videoRef, isCameraOn }: PoseEstimationProps) => {
  const [landmarks, setLandmarks] = useState<any[]>([]);
  const poseRef = useRef<Pose | null>(null);

  // This useEffect initializes the AI model
  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      setLandmarks(results.poseLandmarks || []);
    });

    poseRef.current = pose;

    return () => {
      pose.close();
    };
  }, []);

  // This useEffect runs the processing loop
  useEffect(() => {
    let frameId: number;

    const processVideo = async () => {
      if (isCameraOn && videoRef.current?.readyState === 4 && poseRef.current) {
        await poseRef.current.send({ image: videoRef.current });
      }
      frameId = requestAnimationFrame(processVideo);
    };

    if (isCameraOn) {
      processVideo();
    }

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isCameraOn, videoRef]);

  return { landmarks };
};