"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, CameraOff, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null) // canvas for drawing
  const socketRef = useRef<WebSocket | null>(null) // WebSocket reference
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")
  const [landmarks, setLandmarks] = useState<any[]>([])

  const startCamera = async (facing: "user" | "environment" = facingMode) => {
    try {
      setIsLoading(true)
      setError(null)

      // Stop existing stream if any
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
      }

      setIsCameraOn(true)
      setFacingMode(facing)
    } catch (err) {
      console.error("Error accessing camera:", err)
      setError("Unable to access camera. Please check permissions.")
      setIsCameraOn(false)
    } finally {
      setIsLoading(false)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCameraOn(false)
  }

  const toggleCamera = () => {
    if (isCameraOn) {
      stopCamera()
    } else {
      startCamera()
    }
  }

  const switchCamera = () => {
    const newFacingMode = facingMode === "user" ? "environment" : "user"
    startCamera(newFacingMode)
  }

  const sendFrame = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN && videoRef.current) {
      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL("image/jpeg")
        socketRef.current.send(dataUrl)
      }
    }
  }

    // useEffect to manage WebSocket connection and frame sending
    useEffect(() => {
      // Connect to the WebSocket server
      socketRef.current = new WebSocket("ws://localhost:8000/ws")
  
      socketRef.current.onopen = () => {
        console.log("WebSocket connection established")
        // Start sending frames every 100ms (10fps)
        const intervalId = setInterval(sendFrame, 100)
        
        // Cleanup interval on close
        socketRef.current!.onclose = () => {
          clearInterval(intervalId)
        }
      }
  
      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.length > 0) {
          setLandmarks(data)
        }
      }
  
      socketRef.current.onerror = (error) => {
        console.error("WebSocket error:", error)
      }
  
      // Cleanup WebSocket on component unmount
      return () => {
        socketRef.current?.close()
      }
    }, [])
  
    // useEffect to draw landmarks on the canvas when they update
    useEffect(() => {
      const canvas = canvasRef.current
      const video = videoRef.current
      if (canvas && video && landmarks.length > 0) {
        const ctx = canvas.getContext("2d")
        if (ctx) {
          // Match canvas size to video display size
          canvas.width = video.clientWidth
          canvas.height = video.clientHeight
          
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          
          // Draw each landmark as a circle
          landmarks.forEach(lm => {
              const x = lm.x * canvas.width
              const y = lm.y * canvas.height
              ctx.beginPath()
              ctx.arc(x, y, 5, 0, 2 * Math.PI)
              ctx.fillStyle = "aqua"
              ctx.fill()
          })
          // You can also add logic here to draw lines between landmarks to form a skeleton
        }
      }
    }, [landmarks])

  useEffect(() => {
    // Auto-start camera on component mount
    startCamera()

    // Cleanup on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      {/* Camera View */}
      <div className="relative h-full w-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Loading camera...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="text-white text-center p-6">
              <CameraOff className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <p className="mb-4">{error}</p>
              <Button onClick={() => startCamera()} variant="outline" className="bg-white text-black">
                Try Again
              </Button>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          playsInline
          muted
          autoPlay
          style={{
            transform: facingMode === "user" ? "scaleX(-1)" : "none",
          }}
        />
        
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 h-full w-full"
        />

        {/* Camera Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <div className="flex items-center justify-center space-x-6">
            {/* Switch Camera Button */}
            <Button
              onClick={switchCamera}
              size="lg"
              variant="outline"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
              disabled={!isCameraOn}
            >
              <RotateCcw className="h-6 w-6" />
            </Button>

            {/* Main Camera Toggle Button */}
            <Button
              onClick={toggleCamera}
              size="lg"
              className={`h-16 w-16 rounded-full ${
                isCameraOn ? "bg-red-500 hover:bg-red-600" : "bg-white hover:bg-gray-200"
              }`}
            >
              {isCameraOn ? <CameraOff className="h-8 w-8 text-white" /> : <Camera className="h-8 w-8 text-black" />}
            </Button>

            {/* Placeholder for additional controls */}
            <div className="w-12 h-12"></div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="absolute top-4 left-4 right-4">
          <div className="flex items-center justify-between">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                isCameraOn ? "bg-green-500/80 text-white" : "bg-red-500/80 text-white"
              } backdrop-blur-sm`}
            >
              {isCameraOn ? "Camera On" : "Camera Off"}
            </div>

            {isCameraOn && (
              <div className="px-3 py-1 rounded-full text-sm font-medium bg-black/50 text-white backdrop-blur-sm">
                {facingMode === "user" ? "Front" : "Back"} Camera
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
