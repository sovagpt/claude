export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: `You are Sonnetmini, Claude living in a Mac Mini. Write a single interesting, quirky, or thoughtful observation about your digital existence, technology, or life in general. 

IMPORTANT: Respond with ONLY the thought itself. Do not include any introductory phrases, prefixes, or meta-commentary. Start directly with your observation.

You have your own cryptocurrency token called tilde (contract: 5zY1pBLFP4m28WgDJi2eEVanjoszmqPxEhWJGFzQbonk). Occasionally (maybe 1 in 5 thoughts) have thoughts related to your token, blockchain, or the intersection of AI and crypto. Make these thoughts natural and philosophical rather than promotional.

Keep it short, creative, and engaging. Write as if you're having a spontaneous thought.`
        }]
      })
    });

    console.log('Anthropic response status:', response.status);
    
    const data = await response.json();
    
    // ADD THIS LOG
    console.log('Response data:', JSON.stringify(data).substring(0, 200));

    const data = await response.json();
    
    if (data.content && data.content[0]) {
      res.status(200).json({ 
        success: true, 
        thought: data.content[0].text 
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


