const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Function to convert image to base64
function imageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  return `data:image/jpeg;base64,${base64Image}`;
}

// Test OpenAI API with apple image
async function testOpenAI() {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment variables');
    console.log('Please set OPENAI_API_KEY in your .env.local file');
    return;
  }

  console.log('✅ API Key found:', OPENAI_API_KEY.substring(0, 10) + '...');

  // Load and convert apple image
  const imagePath = path.join(__dirname, 'public/test-images/apple.jpg');
  console.log('📷 Loading image from:', imagePath);

  const base64Image = imageToBase64(imagePath);
  console.log('✅ Image converted to base64, length:', base64Image.length);

  // Call OpenAI API
  console.log('\n🚀 Calling OpenAI API...\n');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert recycling assistant for Terre Haute, Indiana. When analyzing images, provide SPECIFIC, ACTIONABLE instructions.

Available recycling locations in Terre Haute:
1. Vigo County Solid Waste Management (3150 S 3rd St) - Accepts: Electronics, Batteries, Paint, Motor Oil. Hours: Mon-Fri 7AM-3PM, Sat 8AM-12PM
2. Republic Services Recycling Center (2927 S 7th St) - Accepts: Paper, Cardboard, Plastic (#1-7), Glass, Metal. Hours: Mon-Fri 8AM-5PM
3. Home Depot (3925 S US Hwy 41) - Accepts: Batteries, Light Bulbs, Paint. Hours: Mon-Sat 6AM-9PM, Sun 8AM-8PM
4. Best Buy (3401 S US Hwy 41) - Accepts: Electronics, Batteries, Cell Phones. Hours: Mon-Sat 10AM-8PM, Sun 11AM-6PM
5. Walmart (5555 S US Hwy 41) - Accepts: Plastic Bags, Batteries. Hours: Daily 6AM-11PM
6. Kroger (2156 Poplar St) - Accepts: Plastic Bags. Hours: Daily 6AM-12AM
7. Rose-Hulman Recycling Center (5500 Wabash Ave) - Accepts: Paper, Cardboard, Plastic, Metal. Hours: Mon-Fri 7AM-4PM
8. City Hall Drop-off (17 Harding Ave) - Accepts: Paper, Small Electronics. Hours: Mon-Fri 8AM-4:30PM

IMPORTANT: For organic waste like food, say it should go to compost or regular trash.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Identify this item and tell me exactly where in Terre Haute I should take it for recycling or disposal.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image
                }
              }
            ]
          }
        ],
        max_tokens: 250,
        temperature: 0.3
      })
    });

    console.log('Response status:', response.status, response.statusText);

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ API Error:', error);
      return;
    }

    const data = await response.json();
    console.log('\n✅ SUCCESS! OpenAI Response:\n');
    console.log('=====================================');
    console.log(data.choices[0]?.message?.content || 'No response');
    console.log('=====================================\n');

    // Log token usage
    if (data.usage) {
      console.log('Token Usage:');
      console.log('- Prompt tokens:', data.usage.prompt_tokens);
      console.log('- Completion tokens:', data.usage.completion_tokens);
      console.log('- Total tokens:', data.usage.total_tokens);
    }

  } catch (error) {
    console.error('❌ Error calling OpenAI:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
  }
}

// Run the test
console.log('🧪 Testing OpenAI Image Detection with Apple Image\n');
console.log('=====================================\n');
testOpenAI();