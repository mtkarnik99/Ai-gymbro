# 🤖 GymBroAI

AI GymBro is an AI-powered personal trainer that uses your device’s camera to analyze your squat and pushup form in real time. It provides instant, accurate, and encouraging voice feedback using advanced pose detection, LLM-based coaching, and realistic text-to-speech.



## 🎬 Demo

<div align="center">

  <!-- Clickable YouTube thumbnail -->
  <a href="https://www.youtube.com/watch?v=N7-vfCMKyMo" target="_blank">
    <img src="https://img.youtube.com/vi/N7-vfCMKyMo/0.jpg" alt="Demo Video" width="480"/>
  </a>
  <br>

</div>




## 🚀 Features

- **Real-Time Joint Detection:** Uses computer vision to track your body joints live.
- **Exercise Recognition:** Detects and analyzes squats and pushups automatically.
- **AI Voice Feedback:** Provides instant, personalized coaching using LLM and TTS.
- **Rep Counting:** Accurately counts your repetitions and gives motivational praise.
- **Modern UI:** Clean, responsive interface for both desktop and mobile.

---

## 🛠️ Tech Stack

- **Frontend:** React (Next.js), TypeScript, Tailwind CSS
- **Backend:** FastAPI, Python
- **AI/ML:** Pose Estimation (MediaPipe), LLM (Ollama/Mistral), ElevenLabs TTS
- **Deployment:** Docker, Uvicorn

---

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js & npm
- Python 3.10+
- [Ollama](https://ollama.com/) (for local LLM)
- [ElevenLabs API Key](https://elevenlabs.io/)
- (Optional) Docker

### Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/your-org/ai-gymbro.git
    cd ai-gymbro
    ```

2. **Frontend Setup:**
    ```bash
    cd app
    npm install
    npm run dev
    ```

3. **Backend Setup:**
    ```bash
    cd ../
    pip install -r requirements.txt
    python -m uvicorn ai_server:app --host 0.0.0.0 --port 8000
    ```



---

## 🖥️ Usage

1. Open [http://localhost:3000](http://localhost:3000) in your browser.
2. Allow camera access.
3. Select your exercise (squat or pushup).
4. Start moving! Get instant AI voice feedback on your form and reps.

---

## 👥 Collaborators

| Name                      | Contributions                                                                                           |
|---------------------------|---------------------------------------------------------------------------------------------------------|
| **Alan Tai**              | Joint detection & tracking, squat detection/analysis, AI voice module integration.                      |
| **Joshua Chan**           | Joint detection & tracking, squat detection/analysis, AI voice module integration.                      |
| **Suriya Kasiyalan Siva** |  Developed AI voice coaching module (TTS & LLM), form analysis. |
| **Philip Elbert**         | Frontend & UI implementation, real-time squat feedback algorithm.                                       |
| **Meet Karnik**           | Pushup detection logic, joint tracking, frontend/UI, exercise form analysis, rep counting.              |

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgements

- [ElevenLabs](https://elevenlabs.io/)
- [MediaPipe](https://mediapipe.dev/)
- [Ollama](https://ollama.com/)
