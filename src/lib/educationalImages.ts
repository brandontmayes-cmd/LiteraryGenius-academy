/**
 * Free Educational Images - CORS-friendly sources
 * These images are hosted on services that allow embedding
 */

export const FREE_EDUCATIONAL_IMAGES = {
  science: {
    waterCycle: {
      url: 'https://images.unsplash.com/photo-1501696461415-6bd6660c6742?w=800&q=80',
      alt: 'Water cycle in nature',
      fallback: 'https://raw.githubusercontent.com/nasa/NASA-APIs/master/images/water-cycle.jpg'
    },
    solarSystem: {
      url: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&q=80',
      alt: 'Solar system planets',
      fallback: 'https://solarsystem.nasa.gov/system/resources/detail_files/2486_stsci-h-p1936a_1800.jpg'
    },
    plantCell: {
      url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&q=80',
      alt: 'Plant cell structure',
      fallback: 'https://cdn.pixabay.com/photo/2017/03/27/13/28/cell-2178759_960_720.jpg'
    },
    photosynthesis: {
      url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&q=80',
      alt: 'Plant photosynthesis process',
      fallback: 'https://cdn.pixabay.com/photo/2016/11/29/03/52/photosynthesis-1867572_960_720.jpg'
    },
    humanBody: {
      url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
      alt: 'Human anatomy',
      fallback: 'https://cdn.pixabay.com/photo/2017/10/10/21/47/man-2837375_960_720.jpg'
    },
    animals: {
      lion: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800&q=80',
      elephant: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&q=80',
      frog: 'https://images.unsplash.com/photo-1628773643773-7b84e66c2fd4?w=800&q=80',
      butterfly: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=800&q=80'
    }
  },
  socialStudies: {
    usaMap: {
      url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80',
      alt: 'Map of United States',
      fallback: 'https://cdn.pixabay.com/photo/2016/03/31/19/24/america-1295894_960_720.png'
    },
    worldMap: {
      url: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&q=80',
      alt: 'World map',
      fallback: 'https://cdn.pixabay.com/photo/2016/03/31/19/24/map-1295847_960_720.png'
    },
    globe: {
      url: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800&q=80',
      alt: 'Globe showing Earth',
      fallback: 'https://cdn.pixabay.com/photo/2016/12/27/21/03/planet-1935581_960_720.jpg'
    },
    washington: {
      url: 'https://images.unsplash.com/photo-1555601568-c9e6f328489b?w=800&q=80',
      alt: 'Washington D.C. Capitol building',
      fallback: 'https://cdn.pixabay.com/photo/2016/11/22/19/05/building-1850119_960_720.jpg'
    }
  },
  math: {
    shapes: {
      url: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800&q=80',
      alt: 'Geometric shapes',
      fallback: 'https://cdn.pixabay.com/photo/2017/01/31/22/32/geometry-2027895_960_720.png'
    },
    fractions: {
      url: 'https://images.unsplash.com/photo-1605106901227-991bd663255c?w=800&q=80',
      alt: 'Visual representation of fractions',
      fallback: 'https://cdn.pixabay.com/photo/2016/03/31/19/50/checkerboard-1295957_960_720.png'
    }
  }
};

/**
 * Get a working image URL with fallback
 */
export function getWorkingImageUrl(category: keyof typeof FREE_EDUCATIONAL_IMAGES, subcategory: string): string {
  try {
    const categoryImages = FREE_EDUCATIONAL_IMAGES[category];
    if (!categoryImages) return '';
    
    const image = categoryImages[subcategory as keyof typeof categoryImages];
    if (typeof image === 'string') {
      return image;
    } else if (image && typeof image === 'object' && 'url' in image) {
      return image.url;
    }
    
    return '';
  } catch {
    return '';
  }
}

/**
 * Educational image prompts for AI image generation (future feature)
 */
export const IMAGE_GENERATION_PROMPTS = {
  science: {
    waterCycle: 'Simple educational diagram showing the water cycle with evaporation, condensation, precipitation, and collection clearly labeled',
    photosynthesis: 'Clear diagram of photosynthesis showing sun, CO2, water, oxygen, and glucose with arrows',
    foodChain: 'Simple food chain diagram showing grass -> grasshopper -> frog -> snake -> hawk',
    plantCell: 'Labeled diagram of a plant cell showing cell wall, chloroplasts, nucleus, vacuole',
    animalCell: 'Labeled diagram of an animal cell showing nucleus, mitochondria, cell membrane'
  },
  socialStudies: {
    usaRegions: 'Map of the United States divided into 5 regions with different colors and labels',
    worldContinents: 'World map showing all 7 continents in different colors with labels',
    compass: 'Large compass rose showing N, S, E, W directions clearly'
  }
};
