"""
Real-Time AI Posture Coach: LLM + TTS Streaming Feedback System

Project Description:
This script generates **real-time spoken feedback** based on user pose data.
It combines a local LLM (Mistral via Ollama) with ElevenLabs TTS to guide posture correction.

Input:
- Pose data: neck_angle, spine_angle, shoulder_delta, etc.

Process:
1. A custom prompt is built using the input angles.
2. Mistral (via Ollama) is queried to generate a **concise, 2-sentence** coaching tip.
3. The response is streamed as tokens, buffered into chunks.
4. Each chunk is spoken out loud using ElevenLabs TTS as it becomes available.

Output:
- Spoken guidance (e.g., “Straighten your neck slightly. Align your shoulders evenly.”)
- Latency logs for both LLM generation and TTS processing.

Key Features:
- Threaded real-time streaming: LLM + TTS run in parallel
- Optimized for low-latency feedback
- Supports speech speed adjustment
- Enforces strict output format via prompt rules

"""


import os
import subprocess
import threading
import queue
import time
from elevenlabs import ElevenLabs, play
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
api_key = os.getenv("ELEVEN_API_KEY")

# Initialize ElevenLabs client
client = ElevenLabs(api_key=api_key)

# ------------------- Utility Functions -------------------

# def generate_prompt_from_pose(pose_data):
#     return f"""
# User pose data:
# - Neck angle: {pose_data['neck_angle']}°
# - Spine angle: {pose_data['spine_angle']}°
# - Shoulder difference: {pose_data['shoulder_delta']} px

# Give posture feedback in 1–2 **short sentences** only.
# Be concise, supportive, and avoid technical or medical terms.
# **Do not** explain or repeat instructions. Only return the feedback text.
# """

def generate_prompt_from_pose(pose_data):
    return f"""
You are a supportive posture coach. The user’s pose measurements are:

- Hip angle: {pose_data['hip_angle']} degrees
- Knee angle: {pose_data['knee_angle']} degrees
- Shoulder alignment offset: {pose_data['shoulder_angle']} degrees

Give short, friendly feedback to help improve posture. 
✅ Your reply must follow these rules:
- Exactly **2 sentences** (no more, no less)
- Use simple, encouraging language
- Avoid analogies, medical terms, or long explanations
- Don't start with "As a coach..." or include meta-commentary

Only output those two sentences. Do not include anything else.
"""



def stream_from_phi(prompt, chunk_queue):
    """Streams LLM output line-by-line and pushes buffered chunks to queue for TTS."""
    start_time = time.time()
    proc = subprocess.Popen(
        ["ollama", "run", "mistral"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1
    )

    proc.stdin.write(prompt + "\n")
    proc.stdin.flush()
    proc.stdin.close()

    first_response = True
    buffer = ""
    for line in proc.stdout:
        line = line.strip()
        if not line:
            continue
        if first_response:
            llm_latency = time.time() - start_time
            print(f"[LLM LATENCY] First token received after {llm_latency:.2f} seconds.")
            first_response = False

        buffer += line + " "
        if any(p in line for p in [".", "!", "?"]) or len(buffer.split()) >= 12:
            chunk_queue.put(buffer.strip())
            buffer = ""

    if buffer:
        chunk_queue.put(buffer.strip())
    chunk_queue.put(None)

def speak_from_queue(chunk_queue, voice_id):
    """Speaks chunks from LLM as they arrive using ElevenLabs TTS."""
    while True:
        chunk = chunk_queue.get()
        if chunk is None:
            break
        print(f"[Speaking]: {chunk}")
        try:
            start_tts = time.time()
            audio = client.text_to_speech.convert(
                text=chunk,
                voice_id=voice_id,
                model_id="eleven_monolingual_v1",
                voice_settings={
                    "stability": 0.5,
                    "similarity_boost": 0.75,
                    "style": 0.4,
                    "speed": 1.2  # ✅ maximum allowed
                }
            )
            convert_time = time.time() - start_tts

            start_play = time.time()
            play(audio)
            play_time = time.time() - start_play

            print(f"[TTS CONVERT LATENCY] {convert_time:.2f} s | [PLAYBACK TIME] {play_time:.2f} s")
        except Exception as e:
            print(f"[TTS ERROR] {e}")

# ------------------- Main Logic -------------------

# def give_pose_feedback(pose_data, voice_id="cgSgspJ2msm6clMCkdW9"):
#     """Streams LLM output and speaks it live."""
#     prompt = generate_prompt_from_pose(pose_data)
#     print("[DEBUG] Prompt generated for LLM.")

#     chunk_queue = queue.Queue()
#     t1 = threading.Thread(target=stream_from_phi, args=(prompt, chunk_queue))
#     t2 = threading.Thread(target=speak_from_queue, args=(chunk_queue, voice_id))

#     t1.start()
#     t2.start()
#     t1.join()
#     t2.join()


def give_pose_feedback(pose_data, is_good_form=False, rep_count=0, voice_id="cgSgspJ2msm6clMCkdW9"):
    if is_good_form and rep_count > 0 and rep_count % 2 == 0:
        try:
            praise_line = "Good form! Keep it up."
            print(f"[Speaking Praise]: {praise_line}")
            start_tts = time.time()
            audio = client.text_to_speech.convert(
                text=praise_line,
                voice_id=voice_id,
                model_id="eleven_monolingual_v1",
                voice_settings={
                    "stability": 0.5,
                    "similarity_boost": 0.75,
                    "style": 0.4,
                    "speed": 1.2
                }
            )
            convert_time = time.time() - start_tts
            start_play = time.time()
            play(audio)
            play_time = time.time() - start_play
            print(f"[TTS CONVERT LATENCY] {convert_time:.2f} s | [PLAYBACK TIME] {play_time:.2f} s")
        except Exception as e:
            print(f"[TTS ERROR - Praise] {e}")
        return




# ------------------- Example -------------------


if __name__ == "__main__":
    rep_count = 1  # Initialize your rep counter

    example_pose = {
        "hip_angle": 100.0,        # Ideal hip angle at bottom ~90–100°
        "knee_angle": 95.0,        # Ideal knee angle at bottom ~90–100°
        "shoulder_angle": 15.0     # Difference between shoulders; low = symmetrical
    }

    # Simulate 5 reps
    for rep in range(1, 10):
        is_good_form = True  # Simulate a good-form rep
        good_form_rep_count = rep if is_good_form else 0
        print(f"\n[Squat Rep {rep}]")
        give_pose_feedback(example_pose, is_good_form=True, rep_count=rep_count)
        rep_count += 1  # Increment after calling



