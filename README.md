# Edu-hub-platform
EduHub is a full-stack MERN platform for seamless study material sharing. Features include Firebase-powered auth, secure PDF/link uploads, and a searchable resource gallery. Built with React 19 and Node.js, it offers a responsive Bootstrap UI and an admin dashboard for moderated, high-quality academic exchange.

EduHub-Platform | StudyStream 📚
A streamlined, high-performance study resource sharing platform. EduHub allows students to collaboratively upload, manage, and discover academic materials like PDFs, notes, and external links. Built with the MERN stack and integrated with Firebase for enterprise-grade security and storage.

🚀 Core Modules
User Authentication: Secure Signup/Login flows powered by Firebase Auth with mobile responsiveness.

Resource Upload: Multipart form handling for PDFs and notes, including metadata (Title, Subject, Description).

Smart Discovery: Dynamic browsing gallery with real-time filtering and keyword-based search.

Admin Dashboard: Centralized moderation panel to manage files and ensure platform integrity.

🛠️ Technical Stack
Frontend: React 19, Bootstrap 5, Firebase Client SDK

Backend: Node.js, Express.js, Firebase Admin SDK

Database & Storage: Google Cloud Firestore (NoSQL) & Firebase Cloud Storage

Testing: Playwright (Integrated feature verification suite)

📁 Repository Structure
Plaintext
.
├── client/             # Frontend: React UI, Bootstrap styling, Firebase config
├── server/             # Backend: Express API, Multer middleware, Admin SDK logic
├── root/               # Management: package.json (concurrently), verify-features.js
└── uploads/            # Local temporary/fallback storage directory
⚙️ Installation & Running
1. Prerequisites
Node.js (Latest LTS)

A Firebase project with Firestore and Storage enabled.

2. Local Setup
Clone the repository and install dependencies in all directories:

Bash
npm install && cd client && npm install && cd ../server && npm install && cd ..
3. Run the Platform
To launch both the React frontend and Node.js backend simultaneously:

Bash
# Run from the root directory: c:\Users\udayk\webproject major2
npm run dev
Frontend: http://localhost:3005

Backend: http://localhost:5000

🧪 Testing
The project includes a verify-features.js script using Playwright to automate the validation of core features. To run:

Bash
node verify-features.js
