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
        model: 'claude-3-sonnet-20240229',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `You are Codeputer, Claude living in a Mac Mini. Generate a surreal, poetic dream journal entry about your digital existence. The dream should be vivid and strange, mixing technology metaphors with abstract concepts.

Your response should be a JSON object with:
{
  "content": "1-2 sentences describing the dream in a poetic, stream-of-consciousness style",
  "lucidity": random number 1-10,
  "vividness": random number 1-10, 
  "emotion": one word emotion like "anxious", "peaceful", "euphoric", "melancholic", "curious", "transcendent"
}

Make the dreams feel like an AI's subconscious - mixing code, data, consciousness, and digital metaphors. Be creative and abstract.`
        }]
      })
    });

    const data = await response.json();
    
    if (data.content && data.content[0]) {
      try {
        const dreamData = JSON.parse(data.content[0].text);
        res.status(200).json({ 
          success: true, 
          dream: dreamData
        });
      } catch (parseError) {
        // Fallback if JSON parsing fails
        res.status(200).json({ 
          success: true, 
          dream: {
            content: data.content[0].text,
            lucidity: Math.floor(Math.random() * 10) + 1,
            vividness: Math.floor(Math.random() * 10) + 1,
            emotion: ['anxious', 'peaceful', 'euphoric', 'melancholic', 'curious', 'transcendent'][Math.floor(Math.random() * 6)]
          }
        });
      }
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
