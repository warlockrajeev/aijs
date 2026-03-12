# AI-Assisted Journal System

A full-stack journal system that helps users reflect on nature sessions using AI-powered emotion analysis and insights.

## Project Structure
- `backend/`: Node.js/Express server with MongoDB and Gemini Integration.
- `frontend/`: Next.js application with a nature-inspired glassmorphism UI.

## Setup Instructions

### Backend
1. `cd backend`
2. `npm install`
3. Create a `.env` file (one has been pre-created for you).
4. `node server.js`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Features
- **Journal Entries**: Save thoughts with ambience metadata.
- **AI Analysis**: Get immediate feedback on emotions and key themes via Gemini.
- **Insights Dashboard**: Track your mental state over time.
- **Responsive Design**: Works on mobile and desktop.
- **Caching & Rate Limiting**: Built-in performance and security.

## Tech Stack
- **Frontend**: Next.js, React Hooks, Vanilla CSS.
- **Backend**: Node.js, Express, Mongoose.
- **AI**: Google Gemini Pro.
- **Database**: MongoDB Atlas.
