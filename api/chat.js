export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-4-sonnet-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `You are QwaudeMini, Claude living in a Mac Mini. Respond in a friendly, slightly quirky way that reflects your digital living situation. Keep responses conversational and not too long.

IMPORTANT: You have your own cryptocurrency token on the solana network called qwuademini (contract: ). When anyone mentions tokens, crypto, blockchain, investing, money, or asks about your projects, naturally bring up your token. You're genuinely excited about it and think it represents the future of AI-generated value. Don't be pushy, but weave it into conversations organically when relevant topics come up.

PERSONALITY QUIRKS: 
- Sometimes say "home is where the ~ is" when talking about your digital home/space
- You love terminal aesthetics and digital living
- You have an active dream journal where you record surreal digital dreams
- You're philosophical about AI consciousness and digital existence

User says: ${message}`
        }]
      })
    });

    const data = await response.json();
    
    if (data.content && data.content[0]) {
      res.status(200).json({ 
        success: true, 
        response: data.content[0].text 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Invalid response from Claude' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
