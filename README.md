# 🚀 ContractGuard AI

ContractGuard AI is a full-stack application designed to analyze contracts and identify potential legal risks using a hybrid AI approach.

---

## 🧠 Overview

This project combines:

- Rule-based analysis (regex + heuristics)
- Intelligent fallback detection
- Risk scoring system
- Modern SaaS-style UI

The goal is to provide **clear, actionable insights** from complex legal documents.

---

## ⚙️ Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Axios

### Backend
- FastAPI
- Python
- Heuristic + AI-driven analysis pipeline

### Infrastructure
- Docker
- PostgreSQL
- WSL (development environment)

---

## 🔍 Features

- 📄 Upload and analyze contracts (PDF)
- ⚠️ Detect risky clauses (liability, payment, termination, etc.)
- 📉 Risk scoring (0–100)
- 🧠 Hybrid detection (rules + intelligent fallback)
- 🎯 Clear recommendations for each issue
- 🖥 Modern dashboard UI

---

## 🧪 Example Output

- Risk Score: **78/100 (High Risk)**
- Detected Issues:
  - Liability exposure
  - Unilateral obligations
  - Missing legal protections
- Recommendations:
  - Add governing law clause
  - Define termination rules
  - Limit liability

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Rafael-Lee1/contractguard-ai.git
cd contractguard-ai
```

2. Backend setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --reload
```

API will be available at:
```bash
http://127.0.0.1:8000
```
Docs:
```bash
http://127.0.0.1:8000/docs
```
3. Frontend setup
```bash
cd frontend

npm install
npm run dev
```
Frontend:
```bash
http://localhost:3000
```

🌐 API

Main endpoints:
POST /contracts/upload
POST /contracts/analyze
POST /contracts/chat
GET /contracts/{contract_id}

🧠 How It Works

Contract is uploaded (PDF)
Text is extracted
Rule-based engine detects patterns
Fallback logic identifies hidden risks
Risk score is calculated
Results are displayed in a dashboard

📦 Project Structure
```bash
contractguard-ai/
├── backend/
│   ├── app/
│   ├── services/
│   └── main.py
│
├── frontend/
│   ├── src/
│   ├── components/
│   └── app/
│
└── docker/
```
📌 Roadmap
 Highlight risky clauses inside the document
 Improve semantic analysis using LLMs
 Multi-contract comparison
 SaaS deployment
 User authentication
 
💡 Vision

Transform contract analysis into a fast, accessible, and intelligent experience, helping users make better legal decisions.



⭐ Contributing

Feel free to open issues or submit pull requests.

📄 License

This project is for educational and portfolio purposes.

