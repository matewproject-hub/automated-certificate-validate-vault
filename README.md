# 🛡️ AUTOCRED VAULT
### Automated Certificate Verification & Smart Credit Management System

AUTOCRED VAULT is an advanced verification system designed for academic institutions. It uses computer vision, OCR, and cloud integration to automatically verify certificates, prevent fraudulent uploads, and manage student activity points in real-time.

---

## 🚀 Core Features

### 🔍 Automated Verification Pipeline
- **Noise Analysis**: Detects digital tampering or high-level image manipulation using Laplacian variance.
- **Font Consistency**: Scans text structure to ensure no segments have been inconsistently edited.
- **Structural Matching**: Uses ORB (Oriented FAST and Rotated BRIEF) feature matching to verify certificate layouts against official templates.
- **OCR Integration**: Powered by Tesseract to extract and classify certificate data.

### 🛡️ Smart Identity Protection
- **Name Matching**: Automatically compares the name on the certificate with the registered user's profile.
- **Duplication Control**: Enforces strict constraints (e.g., only one NPTEL certificate per student).
- **Format Validation**: Strict validation for institute emails (`@saintgits.org`) and standardized register numbers (`MGPxxxxxxx`).

### 📊 Management Dashboards
- **Student Portal**: Upload certificates, view real-time verification status, and track total activity points.
- **Admin Panel**: Batch-wise student overview, detailed certificate inspection, and student statistics.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Axios, Lucide React (Icons)
- **Backend**: FastAPI (Python), OpenCV, Pytesseract, Bcrypt
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (PDF Hosting)

---

## ⚙️ Setup Instructions

### 1. Prerequisites
- Python 3.9+
- Node.js 18+
- Tesseract OCR engine installed on your system.

### 2. Environment Setup
Create an `auth/.env` file with your Supabase credentials:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-public-key
```

### 3. Database Configuration
Run the provided SQL schema in your Supabase **SQL Editor** to create the `users` and `certificates` tables. Also, create a **Public Bucket** named `certificates` in Supabase Storage.

### 4. Installation & Running

**Backend:**
```bash
cd auth
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 📂 Project Structure

```
├── auth/
│   ├── main.py              # Unified FastAPI Server
│   ├── verification/         # AI Logic (Noise, Font, Layout, Classify)
│   ├── utils/               # PDF processing utilities
│   └── .env                 # Cloud Credentials
├── frontend/
│   ├── src/                 # React Components & Dashboards
│   └── vite.config.js       # Proxy configurations
└── README.md
```

---

## 📝 License
This project is developed for institutional certificate verification and activity point automation.
