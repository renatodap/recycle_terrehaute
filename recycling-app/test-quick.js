const https = require('https');
require('dotenv').config({ path: '.env.local' });

// Download apple image
function getImage() {
  return new Promise((resolve) => {
    https.get('https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80', (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
    });
  });
}

async function test() {
  console.log('Getting apple image...');
  const imageBase64 = await getImage();

  // Test OpenAI directly
  console.log('\nTesting OpenAI Vision...');
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'What is this? Is it an apple?' },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` }}
        ]
      }],
      max_tokens: 100
    })
  });

  const data = await response.json();
  console.log('Response:', data.choices?.[0]?.message?.content || data.error);

  // Test local API
  console.log('\nTesting Local API on port 3006...');
  try {
    const apiRes = await fetch('http://localhost:3006/api/identify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageBase64 })
    });
    const apiData = await apiRes.json();
    console.log('Item identified:', apiData.item?.name);
    console.log('Recyclable:', apiData.item?.is_recyclable);
    console.log('Vision service used:', apiData.services?.vision);
  } catch (e) {
    console.log('API Error:', e.message);
  }
}

test();