# 🏟️ FIFA World Cup 2026: Stadium AI Companion

> A real-time, GenAI-powered operational nervous system designed for the world's largest sporting event.

---

## 📖 Overview

The **Stadium AI Companion** is a unified digital platform built to handle the immense logistical and experiential challenges of the 2026 FIFA World Cup. By synchronizing live stadium telemetry with Google's Gemini LLM, this application provides predictive routing for fans, instant linguistic support for volunteers, and causal anomaly detection for command staff.

---

## ✨ Vertical Portals & Features

### 1. Fan Experience (Smart Navigation)
*   **Predictive Queue Betting:** Analyzes live concourse congestion so fans can decide whether to grab food now or wait.
*   **Accessible Routing:** Dynamically adjusts AI recommendations to prioritize elevators and step-free paths for users with mobility needs.
*   **Matchday Digital Passport:** Generates a personalized, lighthearted recap of the fan's experience using their session data.

### 2. Field Volunteer (Instant Phrasebook)
*   **On-the-Fly Translation:** Generates exact situational phrases (e.g., "Medical Emergency", "Lost Child") in multiple languages with phonetic pronunciation guides.
*   **Cultural Context:** AI provides respectful, localized interaction tips based on the target language/culture to ensure world-class hospitality.
*   **Live Dispatch Alerts:** Real-time syncing with the Command Center to resolve crowd-control incidents.

### 3. Command Center (Organizer View)
*   **Live Telemetry Dashboard:** A premium glassmorphism-styled visual grid tracking wait times and flow percentages across all gates.
*   **Causal Spike Analysis:** Instead of just reporting a surge, Gemini diagnoses *why* it is happening by cross-referencing weather, transit updates, and nearby events.
*   **One-Click Deployment:** Organizers can instantly broadcast actionable AI recommendations to fans or dispatch field volunteers to critical bottlenecks.

---

## 🛠️ Tech Stack

*   **Frontend:** React (Vite), Tailwind CSS (Dark Mode/Glassmorphism UI), Lucide React Icons.
*   **Backend & Database:** Supabase (PostgreSQL).
*   **Serverless Execution:** Supabase Edge Functions.
*   **Generative AI:** Google Gemini API (gemini-2.5-flash) securely invoked via Edge Functions.
*   **Testing:** Vitest & React Testing Library (AAA pattern with custom Supabase mock factories).

---

## 🧪 Simulation Assumptions (Hackathon Context)

To demonstrate the platform's capabilities without access to a physical stadium's IoT network, the following elements are simulated:
*   **Sensor Telemetry:** Live gate congestion and queue times are mocked in a Supabase `stadium_state` table and polled every 5 seconds.
*   **Crowd Surges:** The Organizer View includes a "Simulate Surge" button that force-updates the database, beautifully demonstrating the app's real-time reactivity and AI diagnostics.

---

## 🚀 Local Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd stadium-ai-companion
