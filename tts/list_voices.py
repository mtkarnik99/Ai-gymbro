import os
from elevenlabs import ElevenLabs
from dotenv import load_dotenv

# Load your ElevenLabs API key
load_dotenv()
api_key = os.getenv("ELEVEN_API_KEY")

# Initialize ElevenLabs client
client = ElevenLabs(api_key=api_key)

# List all voices
def list_voices():
    try:
        voices = client.voices.get_all().voices  # access `.voices` from the GetVoicesResponse
        print(f"\nTotal Voices Found: {len(voices)}\n")
        for v in voices:
            print(f"Name:  {v.name}")
            print(f"ID:    {v.voice_id}")
            if v.labels:
                print(f"Tags:  {v.labels}")
            print("-" * 40)
    except Exception as e:
        print(f"[ERROR] Failed to list voices: {e}")

if __name__ == "__main__":
    list_voices()
