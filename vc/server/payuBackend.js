const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * STRATEGY: Multi-Environment CORS Normalization
 * Supports Vercel Production, Vercel Dev, and local Vite development.
 * Normalizes origins by stripping trailing slashes to prevent string-mismatch errors.
 */
const productionFrontend = (process.env.FRONTEND_URL || 'https://vyaparsetuai.vercel.app').replace(/\/$/, "");
const allowedOrigins = [
  productionFrontend,
  'http://localhost:5173', // Standard Vite Local
  'http://localhost:3000'  // Standard Vercel Dev / Next.js Local
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, postman, or server-side fetch)
    if (!origin) return callback(null, true);
    
    // Normalize incoming browser origin by removing trailing slash
    const normalizedOrigin = origin.replace(/\/$/, "");
    
    // Check against authorized whitelist
    if (allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS REJECTION] Unauthorized Origin: ${origin}`);
      callback(new Error('CORS policy: Access Denied for this origin.'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

// Parsers for incoming payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Retrieve secure credentials from backend .env
const PAYU_MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY;
const PAYU_MERCHANT_SALT = process.env.PAYU_MERCHANT_SALT;

if (!PAYU_MERCHANT_KEY || !PAYU_MERCHANT_SALT) {
  console.error("FATAL ERROR: PayU Merchant Key or Salt is missing from the backend .env file. Shutting down.");
  process.exit(1);
}

/**
 * ============================================================================
 * ENDPOINT: Health Check (/api/health)
 * ----------------------------------------------------------------------------
 * Purpose: Provides a lightweight ping target for cron-job.org to prevent 
 * Render's free tier from entering sleep mode.
 * ============================================================================
 */
app.get('/api/health', (req, res) => {
  res.status(200).send('VyaparSetu Gateway Node: Server Active');
});

// Root fallback for cron-job basic pings
app.get('/', (req, res) => {
  res.status(200).send('API Active');
});

/**
 * ============================================================================
 * ENDPOINT: Generate Payment Hash (/api/payu/generate-hash)
 * ----------------------------------------------------------------------------
 * Purpose: Generates the strict SHA-512 hash required by PayU to authorize 
 * the transaction initiation. This keeps the Salt completely hidden from the browser.
 * ============================================================================
 */
app.post('/api/payu/generate-hash', (req, res) => {
  try {
    const { txnid, amount, productinfo, firstname, email, phone, surl, furl } = req.body;

    // Strict validation of mandatory fields required by PayU
    if (!txnid || !amount || !productinfo || !firstname || !email || !surl || !furl) {
      return res.status(400).json({ error: 'Missing mandatory payload fields for hash generation.' });
    }

    // STRICT PAYU HASH FORMULA:
    // sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt)
    const hashString = `${PAYU_MERCHANT_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${PAYU_MERCHANT_SALT}`;
    
    // Generate Cryptographic Hash
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    // Return the authorized hash and key back to the React frontend
    res.status(200).json({
      key: PAYU_MERCHANT_KEY,
      hash: hash
    });

  } catch (error) {
    console.error("Hash Generation Exception:", error);
    res.status(500).json({ error: 'Internal server error during cryptographic hash generation.' });
  }
});

/**
 * WEBHOOK ENDPOINT REMOVED: 
 * System now relies strictly on frontend SURL/FURL redirection for transaction status capture.
 */

// Boot Sequence
app.listen(PORT, () => {
  console.log(`VyaparSetu Secure PayU Node Server initialized on port ${PORT}`);
  console.log(`CORS Policy active for: ${allowedOrigins.join(', ')}`);
});