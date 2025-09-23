const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Test image URL (apple image for testing)
const APPLE_IMAGE_URL = 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80';

// Download image from URL
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const base64 = buffer.toString('base64');
        resolve(base64);
      });
      response.on('error', reject);
    });
  });
}

// Test OpenAI Vision API directly
async function testOpenAIVision(imageBase64) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ OpenAI API key not found in environment variables');
    return null;
  }

  console.log('🔍 Testing OpenAI Vision API...');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'What is in this image? Please identify the object(s) and describe what you see. Focus on identifying if this is an apple or any other object.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('❌ OpenAI API Error:', data.error);
      return null;
    }

    console.log('✅ OpenAI Vision Response:', data.choices[0]?.message?.content);
    return data.choices[0]?.message?.content;
  } catch (error) {
    console.error('❌ Error calling OpenAI Vision:', error.message);
    return null;
  }
}

// Test Google Vision API directly
async function testGoogleVision(imageBase64) {
  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  if (!apiKey) {
    console.error('❌ Google Vision API key not found');
    return null;
  }

  console.log('🔍 Testing Google Vision API...');

  try {
    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: imageBase64
            },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 10 },
              { type: 'OBJECT_LOCALIZATION', maxResults: 5 }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('❌ Google Vision API Error:', data.error);
      return null;
    }

    const result = data.responses[0];
    console.log('✅ Google Vision Labels:', result.labelAnnotations?.map(l => l.description).join(', '));
    console.log('✅ Google Vision Objects:', result.localizedObjectAnnotations?.map(o => o.name).join(', '));
    return result;
  } catch (error) {
    console.error('❌ Error calling Google Vision:', error.message);
    return null;
  }
}

// Test the local API endpoint
async function testLocalAPI(imageBase64) {
  console.log('🔍 Testing Local API Endpoint...');

  // Try multiple ports (3000 is default, but it might be on 3001, 3002, etc.)
  const ports = [3000, 3001, 3002, 3003, 3004, 3005, 3006];

  for (const port of ports) {
    try {
      const response = await fetch(`http://localhost:${port}/api/identify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageBase64
        })
      });

      const data = await response.json();

      if (data.error) {
        console.error(`❌ Local API Error on port ${port}:`, data.error);
        continue; // Try next port
      }

      console.log(`✅ Local API Response (port ${port}):`);
      console.log('   - Item:', data.item?.name);
      console.log('   - Recyclable:', data.item?.is_recyclable);
      console.log('   - Confidence:', data.confidence);
      console.log('   - Vision Service Used:', data.services?.vision);
      console.log('   - Labels:', data.vision_labels?.map(l => l.name).join(', '));
      return data;
    } catch (error) {
      // Silently try next port
      continue;
    }
  }

  console.error('❌ Could not connect to Local API on any port');
  console.log('   Make sure the Next.js dev server is running: npm run dev');
  return null;
}

// Use a local apple image if available
async function getTestImage() {
  // First check if we have a local apple image
  const localImagePath = path.join(__dirname, 'test-images', 'apple.jpg');

  if (fs.existsSync(localImagePath)) {
    console.log('📷 Using local apple image:', localImagePath);
    const imageBuffer = fs.readFileSync(localImagePath);
    return imageBuffer.toString('base64');
  }

  // Otherwise download from URL
  console.log('📷 Downloading apple image from Unsplash...');
  return await downloadImage(APPLE_IMAGE_URL);
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Image Recognition Tests\n');
  console.log('========================================\n');

  try {
    // Get test image
    const imageBase64 = await getTestImage();
    console.log('✅ Image loaded successfully\n');
    console.log('========================================\n');

    // Test OpenAI Vision
    await testOpenAIVision(imageBase64);
    console.log('\n========================================\n');

    // Test Google Vision
    await testGoogleVision(imageBase64);
    console.log('\n========================================\n');

    // Test Local API
    await testLocalAPI(imageBase64);
    console.log('\n========================================\n');

    console.log('✅ All tests completed!');
    console.log('\nSummary:');
    console.log('- OpenAI Vision should identify an apple');
    console.log('- Google Vision should return labels like "apple", "fruit", "food"');
    console.log('- Local API should recognize it as compostable/organic waste');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the tests
runTests();