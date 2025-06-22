# ai_server.py

import os
import subprocess
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn
from elevenlabs.client import ElevenLabs
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# --- Initialization ---
load_dotenv()
ELEVEN_API_KEY = "sk_e8be1fd1802da33b0626966a2d6d574c5ccbce8f005a6e80"

if not ELEVEN_API_KEY:
    raise ValueError("ELEVEN_API_KEY not found in environment variables.")

# Initialize clients
app = FastAPI()
eleven_client = ElevenLabs(api_key=ELEVEN_API_KEY)

origins = [
    "http://localhost:3000",  # Your local Next.js frontend
    # Add your deployed Vercel URL here when you deploy
    # "https://your-frontend-app-name.vercel.app", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Allow specific origins
    allow_credentials=True,      # Allow cookies (not needed for us, but good practice)
    allow_methods=["*"],         # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],         # Allow all headers
)

# --- Pydantic Model ---
class PoseData(BaseModel):
    angles: dict

# --- LLM and Prompt Logic ---
def generate_prompt_from_pose(pose_data: dict) -> str:
    knee_angle = pose_data.get('knee', 0)
    hip_angle = pose_data.get('hip', 0)
    
    return f"""
You are a supportive and expert personal trainer named "Gymbro".
A user is doing a squat. Their current knee angle is {knee_angle:.0f}° and their hip angle is {hip_angle:.0f}°. Their form just broke because the difference between their hip and knee angle became too large.
Give them a single, concise, and encouraging sentence to help them correct their form by keeping their back straight.
Your reply must be only one sentence. Do not add any extra text.
Example: "Keep that chest proud and lead with your hips!"
"""

def get_llm_feedback(pose_data: dict) -> str:
    prompt = generate_prompt_from_pose(pose_data)
    try:
        process = subprocess.run(
            ["ollama", "run", "mistral"],
            input=prompt,
            capture_output=True,
            text=True,
            check=True
        )
        return process.stdout.strip()
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        print(f"Error calling Ollama: {e}")
        return "Keep up the great work." # Return a fallback generic message

# --- FastAPI Endpoint ---
@app.post("/generate-voice-feedback")
async def generate_voice_feedback(data: PoseData):
    print(f"Received data: {data.angles}")
    
    # 1. Get text from the local LLM
    feedback_text = get_llm_feedback(data.angles)
    print(f"LLM generated: '{feedback_text}'")

    # 2. Generate audio from ElevenLabs
    try:
        audio_stream = eleven_client.text_to_speech.convert(
            voice_id="cgSgspJ2msm6clMCkdW9", # Your chosen voice ID
            text=feedback_text,
            model_id="eleven_turbo_v2", # A fast, high-quality model
        )

        # 3. Stream the audio data back to the frontend
        return StreamingResponse(audio_stream, media_type="audio/mpeg")

    except Exception as e:
        print(f"Error generating or streaming audio: {e}")
        return {"error": "Failed to generate audio"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)