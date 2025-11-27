import { supabase } from './supabase';

/**
 * Get the public URL for an image in Supabase Storage
 */
export function getImageUrl(bucketName: string, path: string): string {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Upload an image to Supabase Storage
 */
export async function uploadImage(
  bucketName: string,
  path: string,
  file: File
): Promise<{ url: string | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const url = getImageUrl(bucketName, path);
    return { url, error: null };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { url: null, error: error as Error };
  }
}

/**
 * List all images in a folder
 */
export async function listImages(
  bucketName: string,
  folderPath: string = ''
): Promise<{ files: any[]; error: Error | null }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath);

    if (error) throw error;

    return { files: data || [], error: null };
  } catch (error) {
    console.error('Error listing images:', error);
    return { files: [], error: error as Error };
  }
}

/**
 * Delete an image from storage
 */
export async function deleteImage(
  bucketName: string,
  path: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([path]);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting image:', error);
    return { success: false, error: error as Error };
  }
}

/**
 * Pre-defined educational images library
 * These are common images we'll use frequently
 */
export const EDUCATIONAL_IMAGES = {
  science: {
    waterCycle: 'science/diagrams/water-cycle.png',
    plantCell: 'science/diagrams/plant-cell.png',
    animalCell: 'science/diagrams/animal-cell.png',
    solarSystem: 'science/space/solar-system.png',
    foodChain: 'science/diagrams/food-chain.png',
  },
  socialStudies: {
    usaMap: 'social-studies/maps/usa-states.png',
    worldMap: 'social-studies/maps/world-continents.png',
    usaRegions: 'social-studies/maps/usa-regions.png',
  },
  math: {
    numberLine: 'math/diagrams/number-line.png',
    fractionCircles: 'math/diagrams/fraction-circles.png',
  }
};

/**
 * Get a pre-defined educational image URL
 */
export function getEducationalImageUrl(category: keyof typeof EDUCATIONAL_IMAGES, imageName: string): string {
  const images = EDUCATIONAL_IMAGES[category];
  const path = images[imageName as keyof typeof images];
  
  if (!path) {
    console.warn(`Image not found: ${category}/${imageName}`);
    return '';
  }

  return getImageUrl('educational-images', path);
}

/**
 * Search for images by keyword (future enhancement)
 */
export async function searchImages(
  keyword: string,
  category?: string
): Promise<{ files: any[]; error: Error | null }> {
  const folderPath = category ? `${category}/` : '';
  const { files, error } = await listImages('educational-images', folderPath);
  
  if (error) return { files: [], error };

  // Filter files by keyword
  const filtered = files.filter(file => 
    file.name.toLowerCase().includes(keyword.toLowerCase())
  );

  return { files: filtered, error: null };
}
