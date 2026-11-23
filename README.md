# Bibliomaniacs

A web application built using a single React Native codebase (via React Native for Web). The application communicates with a Python Flask backend, uses Firebase for secure authentication and data storage, and integrates AI features powered by a large language model (LLM).

## Prerequisites
Make sure you have the following installed before getting started:

Node.js (v18 or higher recommended)
Python 3.9+
Expo CLI — npm install -g expo-cli
Redis (running locally or via a cloud provider)
A Firebase project with Firestore enabled


## Installation

### Clone the Repository
bashgit clone <your-repo-url>
cd plumbingproject
### Install Frontend Dependencies
bashnpm install
### Set Up the Python Backend
It's recommended to use a virtual environment:
bashcd backend
python3 -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
pip install -r requirements.txt
The backend depends on (at minimum):

flask
flask-cors
firebase-admin
fireo
reportlab
redis
better-profanity

If a requirements.txt is not present, install these manually:
bashpip install flask flask-cors firebase-admin fireo reportlab redis better-profanity
Configure Firebase

Go to your Firebase Console, open your project, and navigate to Project Settings → Service Accounts.
Click Generate new private key and download the JSON file.
Place it in the backend/ directory and rename it to serviceKey.json.

Alternatively, set it as an environment variable (recommended for production):
bashexport FIREBASE_SERVICE_KEY=$(cat path/to/serviceKey.json)
### Configure Redis
Make sure Redis is running on localhost:6379 (default), or update the connection settings in backend/cache.py to point to your Redis instance.
### Set Admin Emails
In backend/config.py, add the email addresses that should have admin access:
pythonADMIN_EMAILS = ["admin@example.com"]


## Running the App

Development (frontend + backend together)
From the project root:
bashnpm run dev
This runs the Flask backend and Expo dev server concurrently using concurrently.
Frontend Only
bashnpm run client     # Expo dev server
npm run web        # Browser
npm run android    # Android emulator/device
npm run ios        # iOS simulator/device
Backend Only
bashnpm run server
# or directly:
python3 backend/app.py

## Building for Production
Export the Expo app as a static web build:
bashnpm run build
Output will be in the dist/ directory.

Project Structure
PlumbingProjectApp/
├── app/
├── assets/
├── backend/
│   ├── recommendationModel/
│   │   ├── housedBooks/
│   │   ├── bigReviews.csv
│   │   ├── reviewedBooks.csv
│   │   ├── reviews2024.csv
│   │   ├── requirements.txt
│   │   └── *.py
│   ├── app.py
│   ├── cache.py
│   ├── cache_utils.py
│   ├── config.py
│   ├── data_loader.py
│   ├── email_utils.py
│   ├── firebaseConfig.js
│   ├── genre_images.py
│   └── serviceKey.json
├── .gitignore
└── package.json

## Environment Variables
HUGGINGFACEHUB_API_TOKEN=your_huggingface_token

EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
ADMIN_EMAILS=admin_emails

## Setup Notes

serviceKey.json contains sensitive credentials — never commit it to version control. Add it to .gitignore.

Redis must be running before starting the backend, as it is used for caching prompts and responses.

The recommendation model (commented out in app.py) is not active in the current build.

Admin emails in .env should each be separated by a space, no commas


## Tech Stack Overview

#### Frontend

React Native (with React Native for Web) – Core UI framework for building apps from a single codebase, running on web browsers via React Native for Web (extension layer).
Expo – Provides build tools, device testing, and development environment
Tailwind CSS – Utility-first styling for fast and responsive UI design
Axios – Used for making HTTPS API requests to the backend

#### Backend

Python Flask – Lightweight server that exposes REST API endpoints
Communicates with the frontend via JSON-based API calls

#### Authentication & Database

Firebase Authentication
- Supports federated identity providers such as Google Sign-In
- Tokens are verified server-side using Firebase Admin SDK

Cloud Firestore (Firebase)
- NoSQL document-based database
- Stores application data (users, roles, books, etc.)

#### ORM / Data Layer

FireORM – Used to manage Firestore data with an object-model interface

#### AI / Caching

Redis – Used for caching responses and improving AI/LLM request performance
LLM Model Used: Mistral-7B-Instruct-v0.2
- Hosted on Hugging Face: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2

#### PDF Generation

jsPDF – React library used for exporting and generating PDF documents

#### PDF Book List Import

pdfplumber – Extracts book-list text in the Flask backend before records are saved to Firestore or local SQLite when Firebase credentials are absent.
The backend API is `POST /api/books/upload` (multipart field `file`) and `GET /api/books?q=<text>`.

## Run the PDF Book Import Locally

The book import API uses Firestore when `FIREBASE_SERVICE_KEY` is configured. Without it, the backend automatically stores imported books in `PlumbingProjectApp/backend/books.db` using SQLite.

Open a PowerShell terminal for the backend:

```powershell
cd C:\Users\parig\Documents\GitHub\BibliomaniacsPlumProject\PlumbingProjectApp
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r .\backend\requirements.txt
python .\backend\app.py
```

Open a second PowerShell terminal for the web app:

```powershell
cd C:\Users\parig\Documents\GitHub\BibliomaniacsPlumProject\PlumbingProjectApp
npm install
$env:EXPO_PUBLIC_API_URL = "http://127.0.0.1:5001"
npm run web
```

The upload and search UI is available from `/testpage`. To use the deployed Render backend from Vercel, set the Vercel environment variable `EXPO_PUBLIC_API_URL` to the Render API origin, for example `https://your-backend.onrender.com`, then rebuild the web app.

## Deploy to Render and Vercel

### Render backend

Create a Render Web Service with the repository root as its root directory. Use these commands:

```sh
pip install -r PlumbingProjectApp/backend/requirements.txt
gunicorn --chdir PlumbingProjectApp/backend app:app --bind 0.0.0.0:$PORT
```

Render supplies `PORT` automatically. The backend allows cross-origin API requests so the Vercel site can call it.

Configure these Render environment variables as needed:

- `FIREBASE_SERVICE_KEY` — optional for local-style SQLite fallback; provide the Firebase service-account JSON for Firestore-backed, persistent deployed books and the existing Firebase backend features.
- `HUGGINGFACEHUB_API_TOKEN` — needed for the existing hosted LLM features.
- `ADMIN_EMAILS` — optional comma-separated admin email list used by the existing backend.

SQLite is suitable for local development. Render's local filesystem may be reset and is not shared between service instances, so use `FIREBASE_SERVICE_KEY` for persistent books in production.

### Vercel frontend

Set the Vercel project root directory to `PlumbingProjectApp`, the build command to `npm run build`, and the output directory to `dist`. To deploy from a terminal:

```sh
cd PlumbingProjectApp
npm install
npm run build
npx vercel --prod
```

Set `EXPO_PUBLIC_API_URL` in Vercel to the Render service origin, with or without a trailing slash, for example `https://your-backend.onrender.com`. The frontend removes trailing slashes and defaults to `http://127.0.0.1:5001` for local development. Rebuild the Vercel deployment after changing this variable.

For the existing Firebase login features in the frontend, also set `EXPO_PUBLIC_FIREBASE_API_KEY`, `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`, `EXPO_PUBLIC_FIREBASE_PROJECT_ID`, `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`, `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, and `EXPO_PUBLIC_FIREBASE_APP_ID` in Vercel.

## Running the PDF Extractor (pdfplumber) Locally

This workflow starts the Flask backend and Expo web frontend separately. The backend extracts book titles and authors from an uploaded PDF using `pdfplumber`; `samples/sample_books.pdf` is included as a sample upload. The UI is available at `http://localhost:8081/testpage`.

### Prerequisites

- Python 3 (3.9 or newer recommended) and `pip`
- Node.js and npm

### 1. Install backend dependencies

Run these commands from the repository root.

**Windows (PowerShell):**

```powershell
py -3 -m venv PlumbingProjectApp\.venv
.\PlumbingProjectApp\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r PlumbingProjectApp\backend\requirements.txt
```

If PowerShell blocks virtual-environment activation, allow it for the current terminal with `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`, then activate again.

**macOS / Linux:**

```sh
python3 -m venv PlumbingProjectApp/.venv
source PlumbingProjectApp/.venv/bin/activate
python -m pip install --upgrade pip
pip install -r PlumbingProjectApp/backend/requirements.txt
```

The backend requirements include `pdfplumber` for PDF extraction, `Flask` and `flask-cors` for the API, `firebase-admin` for Firestore, and `python-dotenv` for loading local environment variables.

### 2. Configure Firebase (optional)

For Firestore persistence, create `PlumbingProjectApp/backend/.env` and put the service-account JSON on one line as the value of `FIREBASE_SERVICE_KEY`:

```dotenv
FIREBASE_SERVICE_KEY='{"type":"service_account","project_id":"your-project-id", ... }'
```

Use the complete JSON contents of your Firebase service-account key in place of the shortened example above. Keep this file private; `.env` files and Firebase key files should not be committed. If `FIREBASE_SERVICE_KEY` is unset, the backend falls back to local SQLite, so upload and search work without Firebase credentials. SQLite data is stored locally and is not a substitute for durable cloud persistence.

### 3. Install frontend dependencies

Open a terminal at the repository root and run:

```sh
cd PlumbingProjectApp
npm install
```

### 4. Run the app in two terminals

**Terminal 1 — backend, port 5001:** from the repository root, activate the virtual environment, then start Flask.

Windows (PowerShell):

```powershell
cd PlumbingProjectApp
.\.venv\Scripts\Activate.ps1
python backend/app.py
```

macOS / Linux:

```sh
cd PlumbingProjectApp
source .venv/bin/activate
python backend/app.py
```

**Terminal 2 — frontend, port 8081:**

```sh
cd PlumbingProjectApp
npm run web
```

### 5. Test PDF extraction and search

1. Open `http://localhost:8081/testpage` in a browser.
2. Choose the PDF upload button and select `samples/sample_books.pdf` from the repository root.
3. Wait for the upload and parsing status to finish. The extracted book titles and authors should appear on the page.
4. Use the book search field to filter the saved results by title or author. Reload the page to confirm the saved books are fetched again.
5. With `FIREBASE_SERVICE_KEY` configured, the records are persisted in Firestore. Without it, they are stored in `PlumbingProjectApp/backend/books.db` in local SQLite.
