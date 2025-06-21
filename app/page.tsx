"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Mic, Eye, Zap, Play, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center py-16 md:py-24">
          <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200">
            <Zap className="w-3 h-3 mr-1" />
            AI-Powered Form Analysis
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Perfect Your
            <span className="text-blue-600 block">Squat Form</span>
            with AI
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Get real-time AI feedback on your squat form using advanced joint tracking. Improve your technique with
            instant voice coaching.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/app">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                <Play className="w-5 h-5 mr-2" />
                Start Training
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="bg-white text-gray-700 border-gray-300 px-8 py-3">
              Watch Demo
            </Button>
          </div>

          {/* Hero Image Placeholder */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 shadow-2xl">
              <img
                src="/placeholder.svg?height=400&width=600"
                alt="Squat form tracking interface"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Advanced Form Analysis</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI analyzes your movement in real-time to help you achieve perfect squat form
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Eye className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Live Joint Tracking</h3>
                <p className="text-gray-600">
                  Advanced computer vision tracks hip, neck, leg, and ankle joints in real-time for precise form analysis
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mic className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">AI Voice Coaching</h3>
                <p className="text-gray-600">
                  Get instant text-to-speech feedback on your form with personalized coaching cues
                </p>
              </CardContent>
            </Card>

            {/* <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Activity className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Form Scoring</h3>
                <p className="text-gray-600">
                  Receive detailed scores and metrics for each squat to track your improvement
                </p>
              </CardContent>
            </Card> */}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-white rounded-3xl shadow-lg">
          <div className="container mx-auto px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Why Choose Our AI Trainer?</h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Prevent Injuries</h3>
                      <p className="text-gray-600">Real-time form correction helps prevent common squat injuries</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Faster Progress</h3>
                      <p className="text-gray-600">Immediate feedback accelerates your learning curve</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Personal Trainer 24/7</h3>
                      <p className="text-gray-600">Get expert coaching anytime, anywhere with your mobile device</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <img
                  src="/placeholder.svg?height=500&width=400"
                  alt="Person doing squats with form analysis"
                  className="w-full h-auto rounded-2xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
