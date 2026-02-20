const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    console.log("Ping received from a client!");
    res.status(200).json({ status: '✅ VyaparSetu API is LIVE!', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🟢 BACKEND: Running on http://localhost:${PORT}`));
