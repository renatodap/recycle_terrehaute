import levenshtein from 'js-levenshtein';
import { VisionAnalysisResult, extractMaterialCodes } from './vision-service';

export interface RecyclableItemEnhanced {
  item: string;
  category: string;
  recyclable: string;
  bin_type: string;
  special_instructions: string;
  contamination_notes: string;
  vision_labels: string;
  material_codes: string;
  similar_items: string;
}

export interface MatchResult {
  name: string;
  confidence: number;
  is_recyclable: boolean;
  bin_type: 'recycling' | 'trash' | 'compost' | 'special';
  category: string;
  special_instructions: string;
  contamination_notes: string;
  alternative_disposal?: string;
  vision_labels: string[];
  matching_method: 'direct' | 'category' | 'material' | 'fuzzy';
}

// Material code to recyclability mapping
const MATERIAL_CODE_MAP: Record<string, { recyclable: boolean; bin_type: string }> = {
  'PETE 1': { recyclable: true, bin_type: 'recycling' },
  'HDPE 2': { recyclable: true, bin_type: 'recycling' },
  'PVC 3': { recyclable: false, bin_type: 'trash' },
  'LDPE 4': { recyclable: false, bin_type: 'special' }, // Store drop-off
  'PP 5': { recyclable: true, bin_type: 'recycling' },
  'PS 6': { recyclable: false, bin_type: 'trash' },
  'OTHER 7': { recyclable: false, bin_type: 'trash' },
};

// Category keywords mapping
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Plastic': ['plastic', 'bottle', 'container', 'cup', 'packaging'],
  'Paper': ['paper', 'cardboard', 'newspaper', 'magazine', 'box'],
  'Metal': ['metal', 'aluminum', 'steel', 'tin', 'can'],
  'Glass': ['glass', 'bottle', 'jar', 'container'],
  'Hazardous': ['battery', 'paint', 'chemical', 'oil', 'bulb'],
  'E-Waste': ['electronic', 'computer', 'phone', 'device', 'circuit'],
  'Organic': ['food', 'compost', 'yard waste', 'organic'],
  'Textile': ['clothing', 'fabric', 'textile', 'clothes'],
};

// Calculate string similarity (0-1 scale)
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 1;

  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1;

  const editDistance = levenshtein(s1, s2);
  return 1 - (editDistance / maxLen);
}

// Check if any vision label matches item labels
function findDirectMatch(
  visionLabels: string[],
  itemLabels: string[]
): { found: boolean; score: number } {
  let maxScore = 0;
  let matchFound = false;

  for (const vLabel of visionLabels) {
    for (const iLabel of itemLabels) {
      const similarity = calculateSimilarity(vLabel, iLabel);

      if (similarity > 0.8) { // 80% similarity threshold
        matchFound = true;
        maxScore = Math.max(maxScore, similarity);
      }

      // Check for containment
      if (vLabel.includes(iLabel) || iLabel.includes(vLabel)) {
        matchFound = true;
        maxScore = Math.max(maxScore, 0.9);
      }
    }
  }

  return { found: matchFound, score: maxScore };
}

// Infer category from vision labels
function inferCategory(visionLabels: string[]): string | null {
  const categoryScores: Record<string, number> = {};

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;

    for (const label of visionLabels) {
      for (const keyword of keywords) {
        if (label.toLowerCase().includes(keyword)) {
          score += 1;
        }
      }
    }

    if (score > 0) {
      categoryScores[category] = score;
    }
  }

  // Return the category with the highest score
  const entries = Object.entries(categoryScores);
  if (entries.length === 0) return null;

  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

// Main matching algorithm
export function findMatches(
  visionResult: VisionAnalysisResult,
  items: RecyclableItemEnhanced[]
): MatchResult[] {
  const matches: MatchResult[] = [];
  const processedItems = new Set<string>();

  // Combine all vision labels
  const allVisionLabels = [
    ...visionResult.labels.map(l => l.description),
    ...visionResult.objects.map(o => o.name),
    ...visionResult.webEntities.map(w => w.description),
  ].map(l => l.toLowerCase());

  // Stage 1: Direct matching
  console.log('Stage 1: Direct matching with vision labels');
  for (const item of items) {
    const itemVisionLabels = item.vision_labels
      .split(',')
      .map(l => l.trim().toLowerCase());

    const directMatch = findDirectMatch(allVisionLabels, itemVisionLabels);

    if (directMatch.found && !processedItems.has(item.item)) {
      const confidence = Math.min(directMatch.score * 100, 100);

      matches.push({
        name: item.item,
        confidence,
        is_recyclable: item.recyclable.toLowerCase() === 'yes',
        bin_type: item.bin_type as any,
        category: item.category,
        special_instructions: item.special_instructions,
        contamination_notes: item.contamination_notes,
        alternative_disposal: getAlternativeDisposal(item),
        vision_labels: allVisionLabels,
        matching_method: 'direct',
      });

      processedItems.add(item.item);

      // If high confidence match, no need to continue searching
      if (confidence > 90) {
        console.log(`High confidence match found: ${item.item} (${confidence}%)`);
        break;
      }
    }
  }

  // Stage 2: Category inference (if no high confidence match)
  if (matches.length === 0 || matches[0].confidence < 70) {
    console.log('Stage 2: Category inference');
    const inferredCategory = inferCategory(allVisionLabels);

    if (inferredCategory) {
      for (const item of items) {
        if (
          item.category === inferredCategory &&
          !processedItems.has(item.item)
        ) {
          // Check for partial label match
          const itemKeywords = [
            item.item.toLowerCase(),
            ...item.similar_items.split(',').map(s => s.trim().toLowerCase()),
          ];

          let matchScore = 0;
          for (const keyword of itemKeywords) {
            for (const label of allVisionLabels) {
              if (label.includes(keyword) || keyword.includes(label)) {
                matchScore = Math.max(matchScore, 0.6);
              }
            }
          }

          if (matchScore > 0) {
            const confidence = Math.min(matchScore * 100, 70);

            matches.push({
              name: item.item,
              confidence,
              is_recyclable: item.recyclable.toLowerCase() === 'yes',
              bin_type: item.bin_type as any,
              category: item.category,
              special_instructions: item.special_instructions,
              contamination_notes: item.contamination_notes,
              alternative_disposal: getAlternativeDisposal(item),
              vision_labels: allVisionLabels,
              matching_method: 'category',
            });

            processedItems.add(item.item);
          }
        }
      }
    }
  }

  // Stage 3: Material detection from text
  if (visionResult.texts.length > 0) {
    console.log('Stage 3: Material code detection');
    const materialCodes = extractMaterialCodes(visionResult.texts);

    for (const code of materialCodes) {
      const codeUpper = code.toUpperCase();

      // Check material code map
      for (const [mapCode, info] of Object.entries(MATERIAL_CODE_MAP)) {
        if (codeUpper.includes(mapCode.replace(' ', ''))) {
          // Find items with matching material codes
          for (const item of items) {
            if (
              item.material_codes.includes(mapCode) &&
              !processedItems.has(item.item)
            ) {
              matches.push({
                name: item.item,
                confidence: 75, // Material code match confidence
                is_recyclable: info.recyclable,
                bin_type: info.bin_type as any,
                category: item.category,
                special_instructions: item.special_instructions,
                contamination_notes: item.contamination_notes,
                alternative_disposal: getAlternativeDisposal(item),
                vision_labels: allVisionLabels,
                matching_method: 'material',
              });

              processedItems.add(item.item);
              break; // Only add once per material code
            }
          }
        }
      }
    }
  }

  // Stage 4: Fuzzy matching as last resort
  if (matches.length === 0) {
    console.log('Stage 4: Fuzzy matching');
    const scoreThreshold = 0.4; // Lower threshold for fuzzy matching

    for (const item of items) {
      const itemName = item.item.toLowerCase();
      let bestScore = 0;

      for (const label of allVisionLabels) {
        const similarity = calculateSimilarity(itemName, label);
        bestScore = Math.max(bestScore, similarity);
      }

      if (bestScore > scoreThreshold && !processedItems.has(item.item)) {
        const confidence = Math.min(bestScore * 100, 50);

        matches.push({
          name: item.item,
          confidence,
          is_recyclable: item.recyclable.toLowerCase() === 'yes',
          bin_type: item.bin_type as any,
          category: item.category,
          special_instructions: item.special_instructions,
          contamination_notes: item.contamination_notes,
          alternative_disposal: getAlternativeDisposal(item),
          vision_labels: allVisionLabels,
          matching_method: 'fuzzy',
        });

        processedItems.add(item.item);
      }
    }
  }

  // Sort by confidence and limit to top 3
  matches.sort((a, b) => b.confidence - a.confidence);
  return matches.slice(0, 3);
}

// Get alternative disposal method for non-recyclable items
function getAlternativeDisposal(item: RecyclableItemEnhanced): string | undefined {
  if (item.recyclable.toLowerCase() === 'yes') {
    return undefined;
  }

  if (item.bin_type === 'special') {
    return item.special_instructions;
  }

  if (item.recyclable.toLowerCase() === 'no') {
    if (item.category === 'Organic') {
      return 'Consider composting if you have a compost bin';
    }
    if (item.category === 'Textile') {
      return 'Donate to charity or textile recycling program';
    }
    if (item.item.toLowerCase().includes('plastic bag')) {
      return 'Take to grocery store plastic bag recycling bin';
    }
  }

  return 'Place in regular trash';
}

// Extract unidentified objects from vision results
export function getUnidentifiedObjects(
  visionResult: VisionAnalysisResult,
  matches: MatchResult[]
): string[] {
  const identifiedLabels = new Set(
    matches.flatMap(m => m.vision_labels.map(l => l.toLowerCase()))
  );

  const unidentified = [
    ...visionResult.labels.map(l => l.description),
    ...visionResult.objects.map(o => o.name),
  ].filter(label => !identifiedLabels.has(label.toLowerCase()));

  return [...new Set(unidentified)]; // Remove duplicates
}