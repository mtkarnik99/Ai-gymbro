"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, Eye, Zap, Play, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-gradient-to-b from-blue-50 via-cyan-50 via-indigo-100 to-purple-100">
      {/* Hero Section */}
      <section className="h-screen snap-start snap-always">
        <div className="container mx-auto px-4 h-full flex items-center justify-center">
          <div className="text-center py-16 md:py-8">
            <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg">
              <Zap className="w-3 h-3 mr-1" />
              AI-Powered Form Analysis
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 mt-4 leading-tight">
              Perfect Your
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent block">
                Workout Form
              </span>
              with GYMBROAI!
            </h1>

            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
              Get real-time AI feedback on your exercise form using advanced joint tracking. Improve your technique with
              instant voice coaching and no cost!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/app">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 shadow-lg transform hover:scale-105 transition-all"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Training
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={() =>
                  window.open(
                    "https://www.youtube.com/watch?v=N7-vfCMKyMo",
                    "_blank",
                    "noopener"
                  )
                }
                className="bg-white/80 backdrop-blur-sm text-gray-700 border-2 border-pink-300 hover:border-pink-400 hover:bg-pink-50/80 px-8 py-3 shadow-lg"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="h-screen snap-start snap-always">
        <div className="container mx-auto px-4 h-full flex items-center justify-center">
          <div className="py-16 w-full">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
                Advanced Form Analysis
              </h2>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                Our AI analyzes your movement in real-time to help you achieve perfect exercise form, whether it be
                squats or pushups! GYMBROAI can be your personal trainer anywhere!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 bg-white/70 backdrop-blur-sm border-l-4 border-l-blue-500">
                <CardContent className="p-8 text-center">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-blue-800">Live Joint Tracking</h3>
                  <p className="text-gray-700">
                    Advanced computer vision tracks joints angles in real-time for precise form analysis.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 bg-white/70 backdrop-blur-sm border-l-4 border-l-green-500">
                <CardContent className="p-8 text-center">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Mic className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-green-800">AI Voice Coaching</h3>
                  <p className="text-gray-700">
                    Get instant text-to-speech feedback on your form with personalized coaching cues.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="h-screen snap-start snap-always">
        <div className="container mx-auto px-4 h-full flex items-center justify-center">
          <div className="py-16 bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 w-full max-w-7xl">
            <div className="container mx-auto px-8">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Why Choose Our AI Trainer?</h2>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Prevent Injuries</h3>
                        <p className="text-gray-600">
                          Real-time form correction helps prevent common exercise injuries.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Faster Progress</h3>
                        <p className="text-gray-600">Immediate feedback accelerates your learning curve.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Personal Trainer 24/7</h3>
                        <p className="text-gray-600">Get expert coaching anytime, anywhere with your mobile device.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r rounded-2xl blur-lg opacity-20 transform rotate-3"></div>
                  <img
                    src="personsquat.png"
                    alt="Person doing squats with form analysis"
                    className="relative w-96 mx-auto h-100 rounded-2xl shadow-2xl border-4 border-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
