import os
import subprocess
from elevenlabs import ElevenLabs, play
from elevenlabs import Voice
from dotenv import load_dotenv

# Load env variables
load_dotenv()
api_key = os.getenv("ELEVEN_API_KEY")
voice = os.getenv("VOICE_NAME", "Rachel")

client = ElevenLabs(api_key=api_key)


# VOICE_CACHE = {v.name.lower(): v for v in client.voices.get_all() if hasattr(v, "name")}
VOICE_CACHE = {voice.name.lower(): voice for voice in client.voices.get_all().voices}

def get_voice_by_name(name):
    voice = VOICE_CACHE.get(name.lower())
    if not voice:
        raise ValueError(f"Voice '{name}' not found.")
    return voice


def generate_prompt_from_pose(pose_data):
    """Create a human-style coaching prompt from pose values."""
    return f"""
You are a supportive posture coach. The user’s pose measurements are:

- Neck angle: {pose_data['neck_angle']} degrees
- Spine angle: {pose_data['spine_angle']} degrees
- Shoulder height difference: {pose_data['shoulder_delta']} pixels (positive = right side higher)

Create a short and friendly voice coaching message (under 2 sentences) that motivates the user and helps correct their posture. but **strictly limit the output to 2 or 3 short sentences max**. Do not use analogies or long phrases. Avoid robotic tone and medical terms.
"""

def query_mistral(prompt):
    """Query Mistral via Ollama subprocess."""
    proc = subprocess.Popen(
        ["ollama", "run", "mistral"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    stdout, stderr = proc.communicate(input=prompt.encode("utf-8"))

    if stderr:
        print("[LLM ERROR]", stderr.decode())
    return stdout.decode().strip()

def get_voice_by_name(name):
    voices = client.voices.get_all()

    for v in voices:
        # v might be a tuple like (id, Voice) or just a Voice object
        if isinstance(v, tuple):
            v = v[1]  # take the actual Voice object
        if hasattr(v, "name") and v.name.lower() == name.lower():
            return v

    raise ValueError(f"Voice '{name}' not found.")


def speak_with_elevenlabs(text, voice_id="cgSgspJ2msm6clMCkdW9"):
    try:
        audio = client.text_to_speech.convert(
            text=text,
            voice_id=voice_id,  # ✅ Fixed: correct argument name
            model_id="eleven_monolingual_v1"
        )
        play(audio)
    except Exception as e:
        print(f"[TTS ERROR] {e}")



def give_pose_feedback(pose_data):
    """Main call: raw pose → LLM → voice."""
    prompt = generate_prompt_from_pose(pose_data)
    response = query_mistral(prompt)
    print(f"\n[LLM Feedback]: {response}\n")
    speak_with_elevenlabs(response)

# Example call
if __name__ == "__main__":
    example_pose = {
        "neck_angle": 68.3,
        "spine_angle": 76.1,
        "shoulder_delta": 22.5
    }
    give_pose_feedback(example_pose)
