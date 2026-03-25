const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * STRATEGY: Multi-Environment CORS Normalization
 * Supports Vercel Production, Vercel Dev, and GitHub Codespaces.
 * Normalizes origins by stripping trailing slashes to prevent preflight mismatches.
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
    // Allow requests with no origin (like server-to-server or curl)
    if (!origin) return callback(null, true);
    
    // Normalize the incoming browser origin by removing trailing slash
    const normalizedIncoming = origin.replace(/\/$/, "");
    
    if (allowedOriginsNormalized.includes(normalizedIncoming)) {
      // SUCCESS: Reflect the EXACT origin string sent by the browser.
      // This is required to satisfy the "Access-Control-Allow-Origin" header check.
      callback(null, origin);
    } else {
      console.warn(`[SECURITY] Blocked unauthorized origin: ${origin}`);
      callback(new Error('CORS policy: Identity verification failed.'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

// Standard Parsers for PayU Payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Retrieve secure credentials from backend environment
const PAYU_MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY;
const PAYU_MERCHANT_SALT = process.env.PAYU_MERCHANT_SALT;

if (!PAYU_MERCHANT_KEY || !PAYU_MERCHANT_SALT) {
  console.error("FATAL ERROR: PayU Credentials missing from backend environment variables. Shutting down.");
  process.exit(1);
}

/**
 * ============================================================================
 * ENDPOINT: Root Handler (/)
 * ----------------------------------------------------------------------------
 * Purpose: Fixes the "Cannot GET /" error on Render and provides a 
 * success heartbeat for initial server verification.
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
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'VyaparSetu Gateway'
  });
});

/**
 * ============================================================================
 * ENDPOINT: Generate Payment Hash (/api/payu/generate-hash)
 * ----------------------------------------------------------------------------
 * Purpose: Securely generates the SHA-512 cryptographic hash required by PayU.
 * ============================================================================
 */
app.post('/api/payu/generate-hash', (req, res) => {
  try {
    const { txnid, amount, productinfo, firstname, email, phone, surl, furl } = req.body;

    // Strict validation of mandatory fields
    if (!txnid || !amount || !productinfo || !firstname || !email || !surl || !furl) {
      return res.status(400).json({ error: 'Payload validation failed. Mandatory PayU fields missing.' });
    }

    // STRICT PAYU HASH FORMULA:
    // sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt)
    const hashString = `${PAYU_MERCHANT_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${PAYU_MERCHANT_SALT}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    // Return the authorized hash and merchant key
    res.status(200).json({
      key: PAYU_MERCHANT_KEY,
      hash: hash
    });

  } catch (error) {
    console.error("Hash Generation Exception:", error);
    res.status(500).json({ error: 'Cryptographic failure during hash generation.' });
  }
});

/**
 * ============================================================================
 * ENDPOINT: PayU Success Callback Bridge (/api/payu/success)
 * ----------------------------------------------------------------------------
 * Purpose: Catches PayU's POST request and executes a safe GET redirect to Vercel.
 * ============================================================================
 */
app.post('/api/payu/success', (req, res) => {
  const txnid = req.body.txnid || '';
  console.log(`[PAYU CALLBACK] Success payload received for TXN: ${txnid}`);
  // Redirect to the React frontend with the transaction ID
  res.redirect(`${productionFrontend}/payment?payment_status=success&txnid=${txnid}`);
});

/**
 * ============================================================================
 * ENDPOINT: PayU Failure Callback Bridge (/api/payu/failure)
 * ----------------------------------------------------------------------------
 * Purpose: Catches PayU's POST request and executes a safe GET redirect to Vercel.
 * ============================================================================
 */
app.post('/api/payu/failure', (req, res) => {
  const txnid = req.body.txnid || '';
  console.error(`[PAYU CALLBACK] Failure/Cancellation payload received for TXN: ${txnid}`);
  // Redirect to the React frontend with the transaction ID
  res.redirect(`${productionFrontend}/payment?payment_status=failure&txnid=${txnid}`);
});

// Boot Sequence
app.listen(PORT, () => {
  console.log(`VyaparSetu Backend initialized and listening on port ${PORT}`);
  console.log(`CORS Policy active for: ${allowedOriginsNormalized.join(', ')}`);
});