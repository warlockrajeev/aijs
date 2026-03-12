# AI-Assisted Journal System

A full-stack journal system that helps users reflect on nature sessions using AI-powered emotion analysis and insights.

## Project Structure
- `backend/`: Node.js/Express server with MongoDB and Gemini Integration.
- `frontend/`: Next.js application with a nature-inspired glassmorphism UI.

## Setup Instructions

1. `npm install`
2. Create a `.env` file with your `MONGODB_URI` and `GEMINI_API_KEY`.
3. `npm run dev` (for development)

### Production Deployment
1. Build the application: `npm run build`
2. Start the production server: `npm start`

Or use Docker (Multi-stage build):
```bash
docker build -t ai-journal .
docker run -p 3000:3000 --env-file .env ai-journal
```

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
