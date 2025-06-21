"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, CameraOff, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const socketRef = useRef<WebSocket | null>(null)
  
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")
  const [landmarks, setLandmarks] = useState<any[]>([])

  const POSE_CONNECTIONS = [
    // Torso
    [11, 12], // Left shoulder to right shoulder
    [11, 23], // Left shoulder to left hip
    [12, 24], // Right shoulder to right hip
    [23, 24], // Left hip to right hip
  
    // Left Arm
    [11, 13], // Left shoulder to left elbow
    [13, 15], // Left elbow to left wrist
  
    // Right Arm
    [12, 14], // Right shoulder to right elbow
    [14, 16], // Right elbow to right wrist
  
    // Left Leg
    [23, 25], // Left hip to left knee
    [25, 27], // Left knee to left ankle
  
    // Right Leg
    [24, 26], // Right hip to right knee
    [26, 28], // Right knee to right ankle
  ];

  const startCamera = async (facing: "user" | "environment" = facingMode) => {
    try {
      setIsLoading(true);
      setError(null);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const constraints = { video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setIsCameraOn(true);
      setFacingMode(facing);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please check permissions.");
      setIsCameraOn(false);
    } finally {
      setIsLoading(false);
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  }

  const toggleCamera = () => { if (isCameraOn) { stopCamera() } else { startCamera() } }
  const switchCamera = () => { const newFacingMode = facingMode === "user" ? "environment" : "user"; startCamera(newFacingMode) }


  // Main useEffect for setup and teardown
  useEffect(() => {
    // 1. Start the camera when the component mounts
    startCamera()

    // 2. Establish the WebSocket connection
    socketRef.current = new WebSocket("ws://ai-gymbro.onrender.com/ws")

    socketRef.current.onopen = () => console.log("WebSocket connection established")
    socketRef.current.onclose = () => console.log("WebSocket connection closed")
    socketRef.current.onerror = (error) => console.error("WebSocket error:", error)
    
    // 3. Set up the message handler to receive landmarks from the server
    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.length > 0) {
        setLandmarks(data)
      } else {
        setLandmarks([]) // Clear landmarks if no person is detected
      }
    }

    // 4. Define the cleanup logic to run when the component unmounts
    return () => {
      socketRef.current?.close()
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, []) 

  // This useEffect is dedicated to sending frames to the backend
  useEffect(() => {
    if (!isCameraOn || socketRef.current?.readyState !== WebSocket.OPEN) {
      return // Don't do anything if camera is off or socket is not ready
    }

    const intervalId = setInterval(() => {
      const video = videoRef.current
      if (video) {
        const canvas = document.createElement("canvas")
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const dataUrl = canvas.toDataURL("image/jpeg")
          socketRef.current?.send(dataUrl)
        }
      }
    }, 50)

    // Cleanup function to stop sending frames when the camera is turned off
    return () => clearInterval(intervalId)
    
  }, [isCameraOn]) // This effect depends on `isCameraOn`

// This useEffect is dedicated to drawing the skeleton and landmarks
useEffect(() => {
  const canvas = canvasRef.current
  const video = videoRef.current

  if (canvas && video && landmarks.length > 0) {
    const ctx = canvas.getContext("2d")
    if (ctx) {
      // Match canvas size to the video's displayed size for accurate overlay
      canvas.width = video.clientWidth
      canvas.height = video.clientHeight
      
      // Clear the canvas from the previous frame
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      ctx.strokeStyle = "lime"; // Color of the skeleton lines
      ctx.lineWidth = 4;        // Width of the skeleton lines

      POSE_CONNECTIONS.forEach(conn => {
        const p1 = landmarks[conn[0]];
        const p2 = landmarks[conn[1]];

        // Only draw a line if both points are detected with high confidence
        if (p1 && p2 && p1.visibility > 0.5 && p2.visibility > 0.5) {
          ctx.beginPath();
          ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
          ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
          ctx.stroke();
        }
      });

      // Draw the landmark points (joints) on top of the lines
      ctx.fillStyle = "aqua"; // Color of the joint circles
      landmarks.forEach(lm => {
          if (lm.visibility > 0.5) { // Only draw visible landmarks
              const x = lm.x * canvas.width;
              const y = lm.y * canvas.height;
              ctx.beginPath();
              ctx.arc(x, y, 6, 0, 2 * Math.PI); // Draw a circle for each joint
              ctx.fill();
          }
      });
    }
  } else if (canvas) {
      // Clear the canvas if no landmarks are detected
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
  }
}, [landmarks]) // This effect re-runs every time new landmarks are received

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
        <div className="relative h-full w-full">
            {isLoading && ( <div className="absolute inset-0 flex items-center justify-center bg-black z-10"><div className="text-white text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div><p>Loading camera...</p></div></div> )}
            {error && ( <div className="absolute inset-0 flex items-center justify-center bg-black z-10"><div className="text-white text-center p-6"><CameraOff className="h-16 w-16 mx-auto mb-4 text-red-500" /><p className="mb-4">{error}</p><Button onClick={() => startCamera()} variant="outline" className="bg-white text-black">Try Again</Button></div></div> )}
            <video ref={videoRef} className="h-full w-full object-cover" playsInline muted autoPlay style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }} />
            <canvas ref={canvasRef} className="absolute top-0 left-0 h-full w-full" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6"></div>
            <div className="absolute top-4 left-4 right-4"></div>
      </div>
    </div>
  )
}