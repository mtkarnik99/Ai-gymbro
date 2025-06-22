"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, CameraOff, RotateCcw } from 'lucide-react'
import { Button } from "../../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { useCamera } from "../../app/hooks/useCamera";
import { usePoseEstimation } from "../../app/hooks/usePoseEstimation";
import { useSquatAnalysis } from "../../app/hooks/useSquatAnalysis"
import { usePushupAnalysis } from "../../app/hooks/usePushupAnalysis"; // Import the new hook

export default function CameraPage() {
  const { videoRef, isCameraOn, facingMode, error, startCamera, toggleCamera, switchCamera } = useCamera();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { landmarks } = usePoseEstimation({ videoRef, isCameraOn });
  const [exercise, setExercise] = useState<'squat' | 'pushup'>('squat');
  const squatAnalysis = useSquatAnalysis(landmarks);
  const pushupAnalysis = usePushupAnalysis(landmarks);
  const { angles, counter, feedback } = exercise === 'squat' ? squatAnalysis : pushupAnalysis;
  const [voiceGender, setVoiceGender] = useState<string>("female")
  const [language, setLanguage] = useState<string>("english")

  useEffect(() => {
    startCamera();
  }, []);

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
  ]

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

        ctx.strokeStyle = "lime" // Color of the skeleton lines
        ctx.lineWidth = 4 // Width of the skeleton lines

        POSE_CONNECTIONS.forEach((conn) => {
          const p1 = landmarks[conn[0]]
          const p2 = landmarks[conn[1]]

          // Only draw a line if both points are detected with high confidence
          if (p1 && p2 && p1.visibility > 0.5 && p2.visibility > 0.5) {
            ctx.beginPath()
            ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height)
            ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height)
            ctx.stroke()
          }
        })

        // Draw the landmark points (joints) on top of the lines
        ctx.fillStyle = "aqua" // Color of the joint circles
        landmarks.forEach((lm) => {
          if (lm.visibility > 0.5) {
            // Only draw visible landmarks
            const x = lm.x * canvas.width
            const y = lm.y * canvas.height
            ctx.beginPath()
            ctx.arc(x, y, 6, 0, 2 * Math.PI) // Draw a circle for each joint
            ctx.fill()
          }
        })
      }
    } else if (canvas) {
      // Clear the canvas if no landmarks are detected
      const ctx = canvas.getContext("2d")
      ctx?.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [landmarks]) // This effect re-runs every time new landmarks are received

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-black/80 backdrop-blur-sm border-b border-white/10">
        {/* Mobile Layout */}
        <div className="block md:hidden">
          <div className="flex items-center justify-between p-3">
            <h1 className="text-white text-lg font-semibold">AI Gymbro</h1>
            <div className="flex items-center space-x-2">
              <Button
                onClick={toggleCamera}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {isCameraOn ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
              </Button>
              {isCameraOn && (
                <Button
                  onClick={switchCamera}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Controls Row */}
          <div className="flex items-center justify-center space-x-4 px-3 pb-3">
            <div className="flex items-center space-x-1">
              <span className="text-white text-xs">Voice:</span>
              <Select value={voiceGender} onValueChange={setVoiceGender}>
                <SelectTrigger className="w-20 h-8 bg-white/10 border-white/20 text-white text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-1">
              <span className="text-white text-xs">Lang:</span>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-24 h-8 bg-white/10 border-white/20 text-white text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="chinese">Chinese</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-white text-xl font-semibold">AI Gymbro</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Voiceover Gender Selection */}
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm">Voice:</span>
                <Select value={voiceGender} onValueChange={setVoiceGender}>
                  <SelectTrigger className="w-24 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Language Selection */}
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm">Language:</span>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="chinese">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Exercise Selection */}
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm">Exercise:</span>
                <Select value={exercise} onValueChange={(value) => setExercise(value as 'squat' | 'pushup')}>
                    <SelectTrigger className="w-28 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="squat">Squat</SelectItem>
                    <SelectItem value="pushup">Push-up</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              {/* Camera Controls */}
              <div className="flex items-center space-x-2">
                <Button
                  onClick={toggleCamera}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  {isCameraOn ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                </Button>

                {isCameraOn && (
                  <Button
                    onClick={switchCamera}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rep Counter - Top Left */}
      <div className="absolute top-24 md:top-20 left-4 z-30">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 md:p-4 text-center min-w-[100px] md:min-w-[120px]">
          <div className="text-white/80 text-xs md:text-sm font-medium uppercase tracking-wider">Reps</div>
          <div className="text-white text-3xl md:text-5xl font-bold leading-none mt-1">{counter}</div>
        </div>
      </div>

      {/* Feedback - Top Right */}
      <div className="absolute top-24 md:top-20 right-4 z-30">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 md:p-4 max-w-[200px] md:max-w-xs">
          <div className="text-white/80 text-xs md:text-sm font-medium uppercase tracking-wider mb-1">Feedback</div>
          <div className="text-white text-sm md:text-base font-medium leading-tight">{feedback}</div>
        </div>
      </div>

      {/* Camera View */}
      <div className="relative h-full w-full pt-20 md:pt-16">
        {error && (
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
          style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
        />

        <canvas ref={canvasRef} className="absolute top-0 left-0 h-full w-full" />

         {/* MODIFIED: Updated bottom overlay to show angles AND controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 md:p-6 text-white pt-2 md:pt-4">
          
          {/* Angle display */}
          <div className="mb-4">
            <h3 className="text-white/80 text-sm md:text-base font-semibold uppercase tracking-wider mb-2">
                {exercise === 'squat' ? 'Squat Analysis' : 'Push-up Analysis'}
            </h3>
            <div className="grid grid-cols-2 gap-x-4 md:gap-x-6 gap-y-1 text-xs md:text-sm font-mono bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3">
                {exercise === 'squat' ? (
                <>
                    <span className="text-white/90">L.Hip: <span className="text-white font-semibold">{Math.round(squatAnalysis.angles.leftHip)}°</span></span>
                    <span className="text-white/90">R.Hip: <span className="text-white font-semibold">{Math.round(squatAnalysis.angles.rightHip)}°</span></span>
                    <span className="text-white/90">L.Knee: <span className="text-white font-semibold">{Math.round(squatAnalysis.angles.leftKnee)}°</span></span>
                    <span className="text-white/90">R.Knee: <span className="text-white font-semibold">{Math.round(squatAnalysis.angles.rightKnee)}°</span></span>
                </>
                ) : (
                <>
                    <span className="text-white/90">L.Elbow: <span className="text-white font-semibold">{Math.round(pushupAnalysis.angles.leftElbow)}°</span></span>
                    <span className="text-white/90">R.Elbow: <span className="text-white font-semibold">{Math.round(pushupAnalysis.angles.rightElbow)}°</span></span>
                    <span className="text-white/90">L.Hip: <span className="text-white font-semibold">{Math.round(pushupAnalysis.angles.bodyAngle)}°</span></span>
                </>
                )}
            </div>
          </div>
          
          {/* Settings summary */}
          <div className="text-white/60 text-xs md:text-sm border-t border-white/10 pt-3 text-center">
            Voice: {voiceGender} | Language: {language.charAt(0).toUpperCase() + language.slice(1)} | Exercise: {exercise.charAt(0).toUpperCase() + exercise.slice(1)}
          </div>
        </div>
      </div>
    </div>
  )
}