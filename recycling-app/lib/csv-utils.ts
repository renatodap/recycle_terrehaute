import fs from 'fs';
import path from 'path';

export interface RecyclableItem {
  item: string;
  category: string;
  recyclable: string;
  special_instructions: string;
}

export interface DropOffLocation {
  name: string;
  address: string;
  lat: string;
  lng: string;
  accepts: string;
  hours: string;
}

export interface PickupSchedule {
  zone: string;
  day: string;
  frequency: string;
}

export function parseCSV<T>(content: string): T[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const data = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    return obj as T;
  });

  return data;
}

export async function readRecyclableItems(): Promise<RecyclableItem[]> {
  const filePath = path.join(process.cwd(), 'data', 'recyclable-items.csv');
  const content = await fs.promises.readFile(filePath, 'utf-8');
  return parseCSV<RecyclableItem>(content);
}

export async function readDropOffLocations(): Promise<DropOffLocation[]> {
  const filePath = path.join(process.cwd(), 'data', 'drop-off-locations.csv');
  const content = await fs.promises.readFile(filePath, 'utf-8');
  return parseCSV<DropOffLocation>(content);
}

export async function readPickupSchedule(): Promise<PickupSchedule[]> {
  const filePath = path.join(process.cwd(), 'data', 'pickup-schedule.csv');
  const content = await fs.promises.readFile(filePath, 'utf-8');
  return parseCSV<PickupSchedule>(content);
}

export function searchItems(items: RecyclableItem[], query: string): RecyclableItem[] {
  const lowerQuery = query.toLowerCase();
  return items.filter(item =>
    item.item.toLowerCase().includes(lowerQuery) ||
    item.category.toLowerCase().includes(lowerQuery)
  );
}