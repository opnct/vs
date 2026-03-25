const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * STRATEGY: Strict Origin Reflection & Normalization
 * Whitelist updated to support Production, Local Dev, and GitHub Codespaces.
 */
const productionFrontend = (process.env.FRONTEND_URL || 'https://vyaparsetuai.vercel.app').replace(/\/$/, "");
const allowedOriginsNormalized = [
  productionFrontend,
  'http://localhost:5173',
  'http://localhost:3000',
  'https://studious-space-giggle-r4gpwr9vrjv25wvv-3000.app.github.dev' // Authorized Codespace Origin
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-side/non-browser requests
    if (!origin) return callback(null, true);
    
    // Normalize the incoming origin to check against our whitelist
    const normalizedIncoming = origin.replace(/\/$/, "");
    
    if (allowedOriginsNormalized.includes(normalizedIncoming)) {
      // SUCCESS: Reflect the EXACT origin string sent by the browser.
      callback(null, origin);
    } else {
      console.warn(`[SECURITY] Blocked unauthorized origin: ${origin}`);
      callback(new Error('CORS policy: Identity verification failed.'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

// Standard Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Retrieve secure credentials from backend .env
const PAYU_MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY;
const PAYU_MERCHANT_SALT = process.env.PAYU_MERCHANT_SALT;

if (!PAYU_MERCHANT_KEY || !PAYU_MERCHANT_SALT) {
  console.error("FATAL ERROR: PayU Credentials missing from backend .env. Shutting down.");
  process.exit(1);
}

/**
 * ============================================================================
 * ENDPOINT: Root Handler (/)
 * ----------------------------------------------------------------------------
 * Purpose: Fixes the "Cannot GET /" error and provides a basic heartbeat.
 * ============================================================================
 */
app.get('/', (req, res) => {
  res.status(200).send('VyaparSetu API: Active and Secure');
});

/**
 * ============================================================================
 * ENDPOINT: Health Check (/api/health)
 * ----------------------------------------------------------------------------
 * Purpose: Targeted endpoint for cron-job.org to keep the Render instance awake.
 * ============================================================================
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

/**
 * ============================================================================
 * ENDPOINT: Generate Payment Hash (/api/payu/generate-hash)
 * ----------------------------------------------------------------------------
 * Purpose: Securely generates the PayU SHA-512 hash.
 * ============================================================================
 */
app.post('/api/payu/generate-hash', (req, res) => {
  try {
    const { txnid, amount, productinfo, firstname, email, phone, surl, furl } = req.body;

    // Strict validation
    if (!txnid || !amount || !productinfo || !firstname || !email || !surl || !furl) {
      return res.status(400).json({ error: 'Payload validation failed. Mandatory PayU fields missing.' });
    }

    // sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt)
    const hashString = `${PAYU_MERCHANT_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${PAYU_MERCHANT_SALT}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    res.status(200).json({
      key: PAYU_MERCHANT_KEY,
      hash: hash
    });

  } catch (error) {
    console.error("Hash Generation Exception:", error);
    res.status(500).json({ error: 'Cryptographic failure. Contact system administrator.' });
  }
});

// Boot Sequence
app.listen(PORT, () => {
  console.log(`VyaparSetu Backend listening on port ${PORT}`);
  console.log(`CORS Whitelist Active for: ${allowedOriginsNormalized.join(', ')}`);
});