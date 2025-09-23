# Recycling API - Image Recognition Service

## Overview
Pure API service for identifying recyclable items from images using AI vision services.

## API Endpoints

### POST `/api/identify`
Identifies items in an image and provides recycling instructions.

**Request Body:**
```json
{
  "image": "base64_encoded_image_string"
}
```

**Response:**
```json
{
  "success": true,
  "item": {
    "name": "Plastic Bottle",
    "is_recyclable": true,
    "bin_color": "Blue",
    "disposal_method": "Place in blue recycling bin",
    "preparation": "Rinse clean, remove cap",
    "special_instructions": "Optional special handling notes",
    "disposal_location": "Recycling Center Name",
    "disposal_address": "123 Main St",
    "disposal_phone": "(555) 123-4567"
  },
  "confidence": 0.85,
  "vision_service": "openrouter",
  "ai_service": "openrouter"
}
```

### GET `/api/search`
Search for recycling information by keyword.

**Query Parameters:**
- `q` - Search query string

**Response:**
```json
{
  "success": true,
  "results": [...]
}
```

## Environment Variables

Create a `.env.local` file with:

```bash
# OpenRouter (Primary - Recommended)
OPENROUTER_API_KEY=your_key_here

# Alternative Vision Services (Optional)
OPENAI_API_KEY=your_key_here
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
CLARIFAI_PAT=your_pat_here
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production

```bash
npm run build
npm start
```

## Data Files

The API uses CSV data files located in `/data`:
- `recyclable-items-enhanced.csv` - Item recycling information
- `drop-off-locations.csv` - Recycling center locations
- `pickup-schedule.csv` - Collection schedules

## Vision Services Priority

1. OpenRouter (GPT-4 Vision) - Most efficient
2. OpenAI Vision - Fallback
3. Google Cloud Vision - Alternative
4. Clarifai - Last resort
5. Rule-based interpretation - When all APIs fail

## Rate Limits

- Implements caching to reduce API calls
- 15-minute cache for identical images
- Automatic fallback to alternative services

## License

Private