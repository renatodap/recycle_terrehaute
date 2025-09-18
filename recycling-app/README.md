# Terre Haute Recycling Assistant

An AI-powered web application to help Terre Haute residents identify recyclable items, find drop-off locations, and check pickup schedules for Vigo County.

## Features

- **📷 Photo Identification**: Take or upload a photo to instantly identify if an item is recyclable
- **🔍 Manual Search**: Search for items by name to check their recycling status
- **♻️ Recycling Info Cards**: Clear visual indicators showing if items are recyclable, require special disposal, or belong in the trash
- **📍 Drop-off Locations** (Coming Soon): Find nearby recycling centers and special disposal locations
- **📅 Pickup Schedule** (Coming Soon): Check your recycling collection dates based on your zone
- **📱 Mobile-First Design**: Optimized for use on phones and tablets

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd recycling-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional):
```bash
cp .env.example .env.local
```
Add your Google Vision API key when ready for production use.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
recycling-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── identify/      # Image recognition endpoint
│   │   └── search/        # Item search endpoint
│   └── page.tsx           # Main homepage
├── components/            # React components
│   ├── ImageUploader.tsx  # Photo upload component
│   ├── SearchBar.tsx      # Search input component
│   └── RecyclingInfoCard.tsx # Results display card
├── data/                  # CSV data files
│   ├── recyclable-items.csv    # Recyclable items database
│   ├── drop-off-locations.csv  # Drop-off locations
│   └── pickup-schedule.csv     # Collection schedule
└── lib/                   # Utility functions
    └── csv-utils.ts       # CSV parsing utilities
```

## Data Management

The app uses CSV files for data storage (perfect for MVP). The data files are located in the `/data` directory:

- **recyclable-items.csv**: Contains items, categories, recycling status, and special instructions
- **drop-off-locations.csv**: Lists recycling centers with addresses, hours, and accepted materials
- **pickup-schedule.csv**: Defines collection zones and schedules

To update recycling rules, simply edit the CSV files directly.

## API Endpoints

### POST /api/identify
Analyzes uploaded images to identify recyclable items.
- Currently returns mock data for testing
- Ready for Google Vision API integration

### GET /api/search
Searches the recyclable items database.
- Query parameter: `?q=search_term`
- Returns matching items with recycling information

## Technology Stack

- **Frontend**: Next.js 14, TypeScript, React
- **Styling**: Tailwind CSS with custom environmental theme
- **Data**: CSV files (upgradeable to database)
- **API**: Next.js API routes
- **AI Integration**: Google Vision API (ready to integrate)

## Next Steps for Development

1. **Google Vision API Integration**:
   - Install `@google-cloud/vision`
   - Add API key to environment variables
   - Update `/api/identify` endpoint with real vision processing

2. **Map Integration**:
   - Add Leaflet or Google Maps for drop-off locations
   - Implement distance calculations
   - Add filtering by material type

3. **Pickup Schedule**:
   - Add address input/zone selection
   - Calculate next pickup dates
   - Add reminder notifications

4. **Database Migration**:
   - Move from CSV to PostgreSQL/SQLite
   - Add admin interface for data management
   - Implement caching for better performance

## Design Highlights

- **Green Environmental Theme**: Custom color palette reflecting sustainability
- **Mobile-First**: Responsive design that works on all devices
- **Accessible**: Clear visual indicators and proper contrast ratios
- **Fast**: Optimized for quick loading and instant feedback

## Contributing

To add more recyclable items or update local rules:
1. Edit the relevant CSV file in `/data`
2. Test the changes locally
3. Submit a pull request

## License

MIT