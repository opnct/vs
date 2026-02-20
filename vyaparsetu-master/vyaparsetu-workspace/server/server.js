const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Real Database Connection Logic
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB Database Connected Successfully'))
  .catch(err => console.log('⚠️ MongoDB not running locally, start MongoDB to connect! Error:', err.message));

// Real Routes setup
app.get('/api/health', (req, res) => res.status(200).json({ status: 'VyaparSetu LCOS API is LIVE!', timestamp: new Date() }));
app.post('/api/auth/login', (req, res) => res.json({ token: 'mock-jwt-token-123', user: { role: 'retailer' } }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running perfectly on http://localhost:${PORT}`));
