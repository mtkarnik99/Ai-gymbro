# ai_server.py (Upgraded Version)

import os
import subprocess
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn
from elevenlabs.client import ElevenLabs
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# --- (Initialization and CORS Middleware remains the same) ---
load_dotenv()
ELEVEN_API_KEY = "sk_e8be1fd1802da33b0626966a2d6d574c5ccbce8f005a6e80"
app = FastAPI()
origins = ["http://localhost:3000"]
eleven_client = ElevenLabs(api_key=ELEVEN_API_KEY)
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


# --- NEW: A more detailed Pydantic Model ---
class FeedbackRequest(BaseModel):
    eventType: str  # e.g., 'form_error' or 'rep_complete'
    exercise: str
    angles: dict
    repCount: int
    formError: str | None = None # The specific error detected by the frontend

def generate_prompt(data: FeedbackRequest) -> str:
    # Base persona for the AI
    persona = "You are a supportive, expert personal trainer named Gymbro. Your reply must be only one short, encouraging sentence."

    if data.eventType == 'form_error':
        if data.exercise == 'squat':
            # Create a very detailed prompt for form errors
            knee = data.angles.get('leftKnee', data.angles.get('rightKnee', 0))
            hip = data.angles.get('leftHip', data.angles.get('rightHip', 0))
            return f"""
            {persona}
            A user is doing a squat and their form broke. You detected this error: "{data.formError}".
            Their current knee angle is {knee:.0f}° and hip angle is {hip:.0f}°.
            The ideal relationship is for the hip and knee angles to be similar.
            Give them a coaching cue to fix this specific issue. Example: "Keep that chest proud, drive with your legs!"
            """
        elif data.exercise == 'pushup':
            body_angle = data.angles.get('bodyAngle', 0)
            return f"""
            {persona}
            A user is doing a push-up and their form broke. You detected this error: "{data.formError}".
            Their current body angle (shoulder-hip-knee) is {body_angle:.0f}°.
            The ideal angle for a straight-back plank is closer to 180°.
            Give a coaching cue to keep their body aligned. Example: "Engage your core to keep your back flat like a plank!"
            """

    elif data.eventType == 'rep_complete':
        # Create a prompt specifically for positive reinforcement
        return f"""
        {persona}
        The user just successfully completed rep number {data.repCount} of their {data.exercise} set.
        Give them a single, short, energetic praise. Be varied and not robotic.
        Example: "Nice one!", "Excellent work!", "Crushed it!"
        """

def get_llm_feedback(data: FeedbackRequest) -> str:
    prompt = generate_prompt(data)
    print("----------- PROMPT SENT TO LLM -----------", flush=True)
    print(prompt, flush=True)
    print("------------------------------------------", flush=True)
    try:
        process = subprocess.run(["ollama", "run", "mistral"], input=prompt, capture_output=True, text=True, check=True)
        return process.stdout.strip().replace('"', '') # Remove quotes from LLM response
    except Exception as e:
        print(f"Error calling Ollama: {e}")
        return "Keep it up!"

# The endpoint now uses the new Pydantic model
@app.post("/generate-voice-feedback")
async def generate_voice_feedback(data: FeedbackRequest):
    feedback_text = get_llm_feedback(data)
    print(f"LLM generated: '{feedback_text}'")
    try:
        audio_stream = eleven_client.text_to_speech.convert(
            voice_id="cgSgspJ2msm6clMCkdW9",
            text=feedback_text,
            model_id="eleven_turbo_v2",
        )
        return StreamingResponse(audio_stream, media_type="audio/mpeg")
    except Exception as e:
        print(f"Error with ElevenLabs: {e}")
        return {"error": "Failed to generate audio"}
