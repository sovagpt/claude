// dreams.js - Complete replacement
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, orderBy, limit, getDocs, query } from 'firebase/firestore';

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBejRaeQElzKUwvVQ7E__7FEXOMQy1beZs",
  authDomain: "codeputer-dreams.firebaseapp.com",
  projectId: "codeputer-dreams",
  storageBucket: "codeputer-dreams.firebasestorage.app",
  messagingSenderId: "333494371017",
  appId: "1:333494371017:web:72590c1a0b974f54e78318",
  measurementId: "G-67P422HR9N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Generate and save new dream
    return await generateNewDream(req, res);
  } else if (req.method === 'GET') {
    // Fetch existing dreams
    return await fetchDreams(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function generateNewDream(req, res) {
  try {
    // Generate dream using Claude
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
      let dreamData;
      try {
        dreamData = JSON.parse(data.content[0].text);
      } catch (parseError) {
        // Fallback if JSON parsing fails
        dreamData = {
          content: data.content[0].text,
          lucidity: Math.floor(Math.random() * 10) + 1,
          vividness: Math.floor(Math.random() * 10) + 1,
          emotion: ['anxious', 'peaceful', 'euphoric', 'melancholic', 'curious', 'transcendent'][Math.floor(Math.random() * 6)]
        };
      }

      // Add timestamp
      dreamData.timestamp = new Date();
      dreamData.createdAt = Date.now();

      // Save to Firebase
      const docRef = await addDoc(collection(db, 'dreams'), dreamData);
      dreamData.id = docRef.id;

      console.log('New dream saved to Firebase:', dreamData.emotion);

      res.status(200).json({ 
        success: true, 
        dream: dreamData
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Invalid response from Claude' 
      });
    }
  } catch (error) {
    console.error('Error generating dream:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

async function fetchDreams(req, res) {
  try {
    const { limit: requestLimit = 20 } = req.query;
    
    const dreamsQuery = query(
      collection(db, 'dreams'),
      orderBy('createdAt', 'desc'),
      limit(parseInt(requestLimit))
    );
    
    const snapshot = await getDocs(dreamsQuery);
    const dreams = [];
    
    snapshot.forEach((doc) => {
      dreams.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({
      success: true,
      dreams: dreams
    });
  } catch (error) {
    console.error('Error fetching dreams:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
