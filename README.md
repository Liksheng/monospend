# Monospend 

Monospend is a modern, privacy-first personal finance application that eliminates the "manual entry fatigue" associated with traditional budgeting tools. By leveraging the Google Gemini Large Language Model (LLM), Monospend allows users to log their daily expenses using natural, conversational language. 

Built with a highly interactive "Y2K/Cyberpunk" aesthetic, the application gamifies financial discipline to keep users engaged while ensuring absolute data sovereignty.

## ✨ Key Features

* **🧠 AI-Powered Smart Add:** Type your expenses naturally (e.g., *"Had a great lunch for RM15"*). The system uses a **Stateless Express Proxy** to securely parse the data via the Gemini API, automatically extracting the amount, categorizing the spend, and logging the description.
* **📷 Optical Ingest (Receipt Scan):** Upload a photo of a physical receipt. The system utilizes Gemini's multimodal vision capabilities to automatically extract the total cost, store name, and date.
* **🛡️ Privacy-First & Secure Architecture:** Monospend keeps your financial data strictly in your browser's `LocalStorage`—your personal data never touches a cloud database. Sensitive API credentials are protected behind a backend proxy, preventing client-side exposure.
* **🎮 Gamified Dashboard:** * **Hull Integrity Bar:** A dynamic progress bar that visually represents your remaining budget, shifting from green to yellow to red.
  * **BitBuddy Avatar:** A reactive, interactive avatar whose "mood" changes based on your current spending-to-budget ratio.
* **🚨 Statistical Anomaly Detection:** A built-in statistical engine that monitors spending patterns and automatically flags transactions that exceed 300% of your category average. Verified by a comprehensive Vitest testing suite.
* **📈 Predictive Modelling:** Analyzes your "Daily Burn Rate" to mathematically forecast when your current reserves will deplete based on historical spending habits.

## 🛠️ Technology Stack

**Frontend**
* **Framework:** React 19
* **Language:** TypeScript
* **Build Tool:** Vite
* **Styling:** Tailwind CSS

**Backend & Integration**
* **Runtime:** Node.js
* **Server Framework:** Express (Stateless Proxy)
* **AI Integration:** Google Gemini 2.5 Flash API
* **Testing:** Vitest

## 🚀 Getting Started (Beginner-Friendly Guide)

Follow these step-by-step instructions to run the full-stack Monospend environment on your local machine.

### Step 1: Check your Prerequisites
Before starting, you need two things:
1. **Node.js:** Download and install it from [nodejs.org](https://nodejs.org/). *(You can check if you have it by opening your Command Prompt / Terminal and typing `node -v`)*.
2. **Gemini API Key:** Get a free AI key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Step 2: Download the Project
You can either clone the repository using Git:
```bash
git clone [https://github.com/Liksheng/monospend.git](https://github.com/Liksheng/monospend.git)
cd monospend
```
### OR if you are not familiar with Git, click the green "Code" button at the top of the GitHub page, select "Download ZIP", extract the folder, and open your Terminal / Command Prompt inside that extracted monospend folder.

### Step 3: Install Required Files
In your terminal, type the following command and press Enter:
```bash  
   npm install
```
### (This will take a minute or two. It downloads all the necessary background files the app needs to run).

### Step 4: Add your AI Key
The app needs your Google Gemini key to understand natural language.
Inside the monospend folder, create a brand new file and name it exactly: .env (Make sure Windows doesn't accidentally save it as .env.txt!).
Open that .env file in Notepad or VS Code and paste this single line, replacing the placeholder with your actual key:
```bash
VITE_GEMINI_API_KEY=your_actual_api_key_here
```
### Save the file. (Note: The Express backend securely reads this key from the server environment so it is never exposed to the browser's source code).

### Step 5: Start the App!
```Bash
npm run dev
```
### (This command uses concurrently to automatically start both the Vite frontend on port 3000 and the secure Express backend proxy on port 3001).

### Finally, open your web browser (like Chrome or Edge) and go to:
👉 http://localhost:3000