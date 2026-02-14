 # 🛡️ SAFETYWISE

## 📖 Project Description
**SafetyWise** is a predictive urban intelligence platform designed to assess and visualize night-time safety. By leveraging real-time data from the Google Places API, the system evaluates critical environmental factors—such as the density of police stations, hospitals, and active businesses—to generate a weighted safety index. This version improves upon traditional safety apps by offering a sequential, context-aware flow that prioritizes the traveler's timeframe before analyzing their destination.

---

## 💻 Tech Stack
* **Frontend**: React.js (Vite) for high-performance UI rendering.
* **Styling**: Tailwind CSS v4 with PostCSS for a minimalist, modern aesthetic.
* **Icons**: Lucide React for consistent, high-fidelity iconography.
* **Backend**: FastAPI (Python) for rapid, asynchronous API handling.
* **Server**: Uvicorn as the ASGI web server interface.
* **External API**: Google Places API for location intelligence.

---

## ✨ Features List
* **Sequential UX Flow**: Users select their travel timeframe (Evening, Night, After Midnight) before searching to ensure context-specific risk modeling.
* **Intelligent Autocomplete**: Instant, precise location suggestions as the user types, powered by Google’s global database.
* **Dynamic Safety Scoring**: A custom algorithm that calculates a safety index out of 100 based on active urban infrastructure and time-risk multipliers.
* **Color-Coded Risk Visualization**: An adaptive interface that renders "Risky" results in critical red and "Safe" results in vibrant green for instant user feedback.
* **Supersized Security Indicators**: High-impact iconography (size 96-120) that provides immediate visual confirmation of the safety level.

---

## 🛠️ Installation Commands
```bash
# Backend Installation
cd backend
pip install fastapi uvicorn requests

# Frontend Installation
cd ../frontend
npm install
npm install @tailwindcss/postcss lucide-react


🚀 Run Commands
# Start Backend (Term 1)
cd backend
uvicorn main:app --reload

# Start Frontend (Term 2)
cd frontend
npm run dev


📖 API Documentation
GET /suggestions: Provides real-time destination hints based on user input.

GET /analyze: Processes place IDs and time segments to return a safety score (0-95) and reasoning.

Auto-Docs: Full Swagger documentation available at http://127.0.0.1:8000/docs while the server is active.



👥 Team Members
TANYA MARIAM VIJI
SANA NOUSHAD


📄 License Info
This project is licensed under the MIT License.