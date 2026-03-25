const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Restrict to your frontend
  methods: ['POST']
}));

// Parsers for incoming payloads (PayU webhooks are often URL-encoded)
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
 * ENDPOINT 1: Generate Payment Hash (/api/payu/generate-hash)
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
    // Note: Empty pipes (||) represent the unused udf1 to udf10 parameters.
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
 * ============================================================================
 * ENDPOINT 2: Verify Webhook / Callback (/api/payu/webhook)
 * ----------------------------------------------------------------------------
 * Purpose: Securely verifies the signature of the payload sent back by PayU 
 * after a transaction completes. This prevents users from manipulating the URL 
 * parameters to fake a successful payment.
 * ============================================================================
 */
app.post('/api/payu/webhook', (req, res) => {
  try {
    const payuResponse = req.body;
    
    const { 
      txnid, amount, productinfo, firstname, email, 
      status, hash: receivedHash, additionalCharges 
    } = payuResponse;

    if (!receivedHash) {
      return res.status(400).send('Security Exception: Missing response hash signature.');
    }

    // STRICT PAYU REVERSE HASH FORMULA (For incoming responses):
    // sha512(salt|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
    // If additionalCharges exists: sha512(additionalCharges|salt|status|...)
    
    let reverseHashString = '';
    
    if (additionalCharges) {
      reverseHashString = `${additionalCharges}|${PAYU_MERCHANT_SALT}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${PAYU_MERCHANT_KEY}`;
    } else {
      reverseHashString = `${PAYU_MERCHANT_SALT}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${PAYU_MERCHANT_KEY}`;
    }

    // Generate hash locally to compare against the one PayU sent
    const calculatedHash = crypto.createHash('sha512').update(reverseHashString).digest('hex');

    if (calculatedHash === receivedHash) {
      // HASH MATCH: Transaction is mathematically proven to be authentic and from PayU.
      console.log(`[VERIFIED] Authentic PayU Transaction: ${txnid} | Status: ${status}`);
      
      // -> Optional: Initialize firebase-admin here to update your Firestore `vyapar_payments` 
      //    collection securely from the server side, ensuring absolute data integrity.
      
      res.status(200).send('Webhook payload received and cryptographic signature verified successfully.');
    } else {
      // HASH MISMATCH: The payload was tampered with by a malicious actor or middleman.
      console.error(`[SECURITY ALERT] Tampering detected! Hash mismatch for Transaction: ${txnid}`);
      res.status(400).send('Tampered transaction payload detected. Access Denied.');
    }

  } catch (error) {
    console.error("Webhook Verification Exception:", error);
    res.status(500).send('Internal server error during webhook verification processing.');
  }
});

// Boot Sequence
app.listen(PORT, () => {
  console.log(`VyaparSetu Secure PayU Node Server initialized and listening on port ${PORT}`);
});