# Monospend 

Monospend is a modern, privacy-first personal finance application that eliminates the "manual entry fatigue" associated with traditional budgeting tools. By leveraging the Google Gemini Large Language Model (LLM), Monospend allows users to log their daily expenses using natural, conversational language. 

Built with a highly interactive "Y2K/Cyberpunk" aesthetic, the application gamifies financial discipline to keep users engaged.

## ✨ Key Features

* **🧠 AI-Powered Smart Add:** Type your expenses naturally (e.g., *"Had a great lunch for RM15"*). The Gemini API automatically extracts the amount, categorizes the spend, and logs the description.
* **🛡️ Privacy-First Architecture:** Monospend operates entirely as a Client-Side Single Page Application (SPA). All financial data is saved strictly to your browser's `LocalStorage`. Your personal data never touches a cloud database.
* **🎮 Gamified Dashboard:** * **Hull Integrity Bar:** A dynamic progress bar that visually represents your remaining budget, shifting from green to yellow to red.
  * **BitBuddy Avatar:** A reactive, interactive avatar whose "mood" changes based on your current spending-to-budget ratio.
* **🚨 Statistical Anomaly Detection:** A built-in statistical engine that monitors spending patterns and automatically flags transactions that exceed 300% of your category average.

## 🛠️ Technology Stack

* **Frontend Framework:** React 19
* **Language:** TypeScript
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **AI Integration:** Google Gemini 2.5 Flash API
* **Testing:** Vitest

## 🚀 Getting Started

Follow these instructions to set up and run Monospend on your local machine.

### Prerequisites
* [Node.js](https://nodejs.org/) installed on your machine.
* A free [Google Gemini API Key](https://aistudio.google.com/app/apikey).

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Liksheng/monospend.git](https://github.com/Liksheng/monospend.git)
   cd monospend

2.Install dependencies:
npm install

3.Set up Environment Variables:
Create a new file in the root directory named .env
Open the .env.example file (if provided), or simply paste the following into your new .env file:
**Code snippet
VITE_GEMINI_API_KEY=your_actual_api_key_here

4.Run the Development Server:
**Bash
npm run dev
