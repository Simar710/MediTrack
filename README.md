# MediTrack

A Medication Reminder and Prescription Management App.

## Overview
MediTrack is a full-stack healthtech solution designed to meet the needs of the healthcare industry. It includes patient and pharmacist dashboards, a mobile app, and a secure backend for managing prescriptions and notifications.

### Tech Stack
- **Frontend:** Next.js (React, TypeScript)
- **Mobile:** Flutter (Dart)
- **Backend:** Node.js (Express.js, TypeScript), PostgreSQL (via Prisma ORM)
- **Other Tools:** Firebase, GitHub Actions

## Project Sections
### 1. Backend
- **Description:** Secure RESTful APIs for managing prescription data, user authentication, and notifications.
- **Tech Stack:** Node.js, Express.js, TypeScript, PostgreSQL (Prisma ORM).
- **Features:**
  - User authentication and authorization.
  - Prescription management.
  - Notification scheduling and delivery.

### 2. Frontend
- **Description:** A responsive web application for patient registration, prescription tracking, and real-time notifications.
- **Tech Stack:** Next.js, React, TypeScript.
- **Features:**
  - Patient and pharmacist dashboards.
  - Real-time updates and notifications.
  - User-friendly interface for managing prescriptions.

### 3. Mobile (In Progress)
- **Description:** A cross-platform mobile app for patients to receive reminders and manage prescriptions on the go.
- **Tech Stack:** Flutter (Dart), Firebase Cloud Messaging.
- **Features:**
  - Push notifications for reminders.
  - Prescription tracking.

## Installation
### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- PostgreSQL
- Flutter SDK (for mobile development)

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/Simar710/MediTrack
   cd MediTrack
   ```

2. Install dependencies for the backend and frontend:
   ```bash
   cd meditrack-backend
   npm install
   cd ../meditrack-frontend
   npm install
   ```

3. Set up the database:
   - Configure the PostgreSQL database connection in the backend `.env` file.
   - Run migrations using Prisma:
     ```bash
     cd meditrack-backend
     npx prisma migrate dev
     ```

4. Run the backend:
   ```bash
   cd meditrack-backend
   npm run dev
   ```

5. Run the frontend:
   ```bash
   cd meditrack-frontend
   npm run dev
   ```

6. Run the mobile app (in progress):
   - Open the `mobile` directory in your Flutter IDE.
   - Run the app on an emulator or physical device.

## Project Structure
```
MediTrack/
├── meditrack-backend/             # Backend codebase
├── meditrack-frontend/            # Frontend codebase
├── meditrack-mobile/              # Mobile app codebase (in progress)
└── README.md            # Project documentation
```
