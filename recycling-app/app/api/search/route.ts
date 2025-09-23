import { NextRequest, NextResponse } from 'next/server';
import { readRecyclableItems, searchItems } from '@/lib/csv-utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Load recyclable items from CSV
    const recyclableItems = await readRecyclableItems();

    // Search for matching items
    const results = searchItems(recyclableItems, query);

    // If no exact matches, try fuzzy matching
    if (results.length === 0) {
      const fuzzyResults = recyclableItems.filter(item => {
        const itemWords = item.item.toLowerCase().split(' ');
        const categoryWords = item.category.toLowerCase().split(' ');
        const queryWords = query.toLowerCase().split(' ');

        return queryWords.some(qWord =>
          itemWords.some(iWord => iWord.includes(qWord) || qWord.includes(iWord)) ||
          categoryWords.some(cWord => cWord.includes(qWord) || qWord.includes(cWord))
        );
      });

      return NextResponse.json({
        success: true,
        results: fuzzyResults.slice(0, 5),
        fuzzy: true,
        message: fuzzyResults.length > 0
          ? `Found ${fuzzyResults.length} similar item(s)`
          : 'No items found'
      });
    }

    return NextResponse.json({
      success: true,
      results: results.slice(0, 10),
      fuzzy: false,
      message: `Found ${results.length} item(s)`
    });

  } catch (error) {
    console.error('Error searching items:', error);
    return NextResponse.json(
      { error: 'Failed to search items' },
      { status: 500 }
    );
  }
}