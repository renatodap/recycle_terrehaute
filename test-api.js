const fs = require('fs');
const path = require('path');

// Function to convert image to base64
function imageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  return `data:image/jpeg;base64,${base64Image}`;
}

// Test the API endpoint directly
async function testAPI() {
  console.log('🧪 Testing API Endpoint with Apple Image\n');
  console.log('=====================================\n');

  // Load and convert apple image
  const imagePath = path.join(__dirname, 'public/test-images/apple.jpg');
  const base64Image = imageToBase64(imagePath);
  console.log('✅ Image loaded, testing API...\n');

  try {
    const response = await fetch('http://localhost:3005/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: `data:image/jpeg;base64,${base64Image}`
      })
    });

    console.log('Response status:', response.status, response.statusText);

    const data = await response.json();
    console.log('\n📝 API Response:\n');
    console.log(JSON.stringify(data, null, 2));

    if (data.demoMode) {
      console.log('\n⚠️  Running in DEMO MODE (no API key configured)');
    }

    if (data.item && data.instructions) {
      console.log('\n✅ SUCCESS! The API is working!');
      console.log('- Item identified:', data.item);
      console.log('- Demo mode:', data.demoMode ? 'Yes' : 'No');
    }

  } catch (error) {
    console.error('❌ Error calling API:', error.message);
  }
}

// Run the test
testAPI();