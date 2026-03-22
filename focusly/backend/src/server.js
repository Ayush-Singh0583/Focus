require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const analyticsRoutes = require('./routes/analytics');
const timerRoutes = require('./routes/timers');
const { errorHandler, notFound } = require('./middleware/error');


// IMPORTANT → create app first
const app = express();


// ================= SECURITY =================
app.use(helmet());


// ================= RATE LIMIT =================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20
});

app.use('/api/auth', authLimiter);
app.use(limiter);


// ================= CORS =================

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'https://focus-nu-topaz.vercel.app',
  'https://focus-pqk27kkmw-ayush-singh0583-projects.vercel.app'
];

// ================= CORS =================

const corsOptions = {
  origin: function(origin, callback) {

    if (!origin) return callback(null, true);

    // allow localhost
    if (origin.includes("localhost"))
      return callback(null, true);

    // allow any vercel preview or production domain
    if (origin.includes("vercel.app"))
      return callback(null, true);

    // allow custom domain if added later
    if (origin === process.env.CLIENT_URL)
      return callback(null, true);

    console.log("Blocked CORS:", origin);

    callback(new Error("Not allowed by CORS"));

  },

  credentials: true
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));


// ================= BODY =================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// ================= LOGGING =================

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


// ================= ROUTES =================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/timers', timerRoutes);


// ================= ERROR =================

app.use(notFound);
app.use(errorHandler);


// ================= DB =================

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {

    console.log('✅ MongoDB connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  })
  .catch(err => {

    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);

  });


module.exports = app;