const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error('ERROR: ANTHROPIC_API_KEY environment variable is not set.');
  process.exit(1);
}

// Proxy endpoint — forwards requests to Anthropic and streams the response back
app.post('/api/messages', async (req, res) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: { message: 'Proxy server error: ' + err.message } });
  }
});

// Health check
app.get('/', (req, res) => res.json({ status: 'ok', service: 'Eventura API proxy' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Eventura proxy running on port ${PORT}`));
