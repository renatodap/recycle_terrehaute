export interface RecyclingResult {
  item_name: string;
  is_recyclable: boolean;
  bin_color: 'Blue' | 'Green' | 'Black' | 'Special';
  disposal_method: string;
  preparation: string;
  special_instructions?: string;
  disposal_location?: string;
  disposal_address?: string;
  disposal_phone?: string;
  confidence: number;
  image_url?: string;
}

export interface DisposalLocation {
  name: string;
  address: string;
  phone?: string;
  hours?: string;
  accepts: string[];
  distance?: number;
}

export interface FAQItem {
  item: string;
  recyclable: boolean;
  category: 'recycle' | 'trash' | 'compost' | 'hazard' | 'special';
  instructions: string;
  icon: string;
}