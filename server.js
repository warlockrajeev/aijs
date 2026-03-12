const express = require('express');
const next = require('next');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const journalRoutes = require('./routes/journalRoutes');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const hpp = require('hpp');

dotenv.config();

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Performance Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Needed for Next.js dev/some UI
      "img-src": ["'self'", "data:", "https://*"],
    },
  },
}));
app.use(hpp());
app.use(compression());
app.use(morgan(dev ? 'dev' : 'combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased for production
  message: "Too many requests from this IP, please try again later."
});

app.use('/api/', limiter);
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Limit body size

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

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
