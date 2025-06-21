// hooks/useCamera.ts

import { useState, useRef, useCallback } from 'react';

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async (facing: 'user' | 'environment' = facingMode) => {
    setError(null);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    try {
      const constraints = { video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
            setIsCameraOn(true);
        };
      }
      setFacingMode(facing);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please check permissions.");
    }
  }, [stream, facingMode]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  }, [stream]);

  const toggleCamera = useCallback(() => {
    if (isCameraOn) {
      stopCamera();
    } else {
      startCamera();
    }
  }, [isCameraOn, startCamera, stopCamera]);

  const switchCamera = useCallback(() => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    startCamera(newFacingMode);
  }, [facingMode, startCamera]);

  return { 
    videoRef, 
    stream, 
    isCameraOn, 
    facingMode, 
    error, 
    startCamera, 
    stopCamera, 
    toggleCamera, 
    switchCamera 
  };
};