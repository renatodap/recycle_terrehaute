const fs = require('fs');
const path = require('path');

// Function to convert image to base64
function imageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  return `data:image/jpeg;base64,${base64Image}`;
}

// Mock test to show what the response should look like
async function testMockResponse() {
  console.log('🧪 Mock Test: What OpenAI Should Return for Apple Image\n');
  console.log('=====================================\n');

  // Load and convert apple image
  const imagePath = path.join(__dirname, 'public/test-images/apple.jpg');
  console.log('📷 Loading apple image from:', imagePath);

  const base64Image = imageToBase64(imagePath);
  console.log('✅ Image loaded, base64 length:', base64Image.length);

  // Simulate what OpenAI should return
  console.log('\n📝 Expected OpenAI Response:\n');
  console.log('=====================================');

  const mockResponse = `This is an apple.

Apples are organic waste and are NOT recyclable through traditional recycling programs.

**Disposal Options:**

1. **Composting (Best Option)**: If you have a home compost bin or access to a community composting program, this is the most environmentally friendly option.

2. **Regular Trash**: Place the apple in your regular household trash bin. It will decompose in the landfill.

**Note**: Food waste like apples should never go in recycling bins as they contaminate other recyclable materials. Consider starting a compost bin to reduce organic waste going to landfills.

For Terre Haute residents: Check with Vigo County Solid Waste Management (3150 S 3rd St) about any local composting programs or organic waste collection services.`;

  console.log(mockResponse);
  console.log('=====================================\n');

  // Show what the parsed response would look like
  console.log('🎯 Parsed for UI Display:');
  console.log('- Item: Apple (organic waste)');
  console.log('- Recyclable: No');
  console.log('- Location: Compost bin or regular trash');
  console.log('- Preparation: None needed\n');

  console.log('✨ This is what the app should display when the API is working!\n');
}

// Run the mock test
testMockResponse();