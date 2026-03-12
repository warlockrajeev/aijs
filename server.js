const express = require('express');
const next = require('next');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const journalRoutes = require('./routes/journalRoutes');

dotenv.config();

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});

app.use(limiter);
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/journal', journalRoutes);

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Next.js Integration
nextApp.prepare().then(() => {
  // Use a regex to catch all non-API routes
  app.all(/.*/, (req, res) => {
    return handle(req, res);
  });

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
