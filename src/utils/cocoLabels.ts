// COCO (Common Objects in Context) Standard Classification Catalog
// Standard 80-Class Taxonomy reference with priority indoor/surveillance labels

export interface CocoClassMetadata {
  id: number;
  name: string;
  category: 'person' | 'accessory' | 'electronic' | 'container' | 'furniture' | 'indoor' | 'vehicle';
  isHuman: boolean;
  description: string;
}

export const COCO_CLASSES: Record<string, CocoClassMetadata> = {
  person: {
    id: 1,
    name: 'person',
    category: 'person',
    isHuman: true,
    description: 'Human individual (standing, seated, or moving)'
  },
  backpack: {
    id: 27,
    name: 'backpack',
    category: 'accessory',
    isHuman: false,
    description: 'Backpack or rucksack placed on ground or desk'
  },
  umbrella: {
    id: 28,
    name: 'umbrella',
    category: 'accessory',
    isHuman: false,
    description: 'Handheld or folded umbrella'
  },
  handbag: {
    id: 31,
    name: 'handbag',
    category: 'accessory',
    isHuman: false,
    description: 'Handbag, satchel, or briefcase'
  },
  suitcase: {
    id: 33,
    name: 'suitcase',
    category: 'accessory',
    isHuman: false,
    description: 'Luggage or tactical pelican case'
  },
  bottle: {
    id: 44,
    name: 'bottle',
    category: 'container',
    isHuman: false,
    description: 'Water bottle, thermos, or beverage container'
  },
  cup: {
    id: 47,
    name: 'cup',
    category: 'container',
    isHuman: false,
    description: 'Coffee mug, glass, or small cup'
  },
  chair: {
    id: 62,
    name: 'chair',
    category: 'furniture',
    isHuman: false,
    description: 'Office chair, stool, or tactical seat'
  },
  couch: {
    id: 63,
    name: 'couch',
    category: 'furniture',
    isHuman: false,
    description: 'Couch or bench'
  },
  'potted plant': {
    id: 64,
    name: 'potted plant',
    category: 'indoor',
    isHuman: false,
    description: 'Desk plant or foliage'
  },
  tv: {
    id: 72,
    name: 'tv',
    category: 'electronic',
    isHuman: false,
    description: 'Television or desktop monitor'
  },
  laptop: {
    id: 73,
    name: 'laptop',
    category: 'electronic',
    isHuman: false,
    description: 'Portable laptop computer'
  },
  mouse: {
    id: 74,
    name: 'mouse',
    category: 'electronic',
    isHuman: false,
    description: 'Computer mouse or peripheral'
  },
  keyboard: {
    id: 76,
    name: 'keyboard',
    category: 'electronic',
    isHuman: false,
    description: 'Computer keyboard'
  },
  'cell phone': {
    id: 77,
    name: 'cell phone',
    category: 'electronic',
    isHuman: false,
    description: 'Smartphone or mobile handset'
  },
  book: {
    id: 84,
    name: 'book',
    category: 'indoor',
    isHuman: false,
    description: 'Book, notepad, or binder'
  },
  clock: {
    id: 85,
    name: 'clock',
    category: 'indoor',
    isHuman: false,
    description: 'Wall clock or desk timer'
  },
  scissors: {
    id: 87,
    name: 'scissors',
    category: 'indoor',
    isHuman: false,
    description: 'Scissors or office tool'
  },
  'teddy bear': {
    id: 88,
    name: 'teddy bear',
    category: 'indoor',
    isHuman: false,
    description: 'Stuffed toy or plush object'
  }
};

export type CocoClassName = keyof typeof COCO_CLASSES;

/**
 * Filter configuration for detection tracking.
 * When personOnly is true, non-human items are completely suppressed from
 * bounding box rendering and virtual fence alert triggers.
 */
export interface DetectionClassFilter {
  personOnly: boolean;
  allowedClasses: string[];
}

export const DEFAULT_DETECTION_FILTER: DetectionClassFilter = {
  personOnly: true,
  allowedClasses: ['person']
};

/**
 * Heuristically identifies the most probable COCO standard class for an inanimate object
 * based on its dimensions, aspect ratio, position, and mass.
 */
export function classifyInanimateCocoObject(
  pixelWidth: number,
  pixelHeight: number,
  relW: number,
  relH: number,
  relY: number,
  mass: number
): { name: CocoClassName; id: number; confidence: number } {
  const aspect = pixelHeight / Math.max(1, pixelWidth); // H / W

  // 1. Slender vertical item (bottle or cup)
  if (aspect >= 1.6 && relH < 32 && relW < 18) {
    return { name: 'bottle', id: 44, confidence: 0.91 };
  }
  if (aspect >= 1.1 && aspect < 1.6 && relH < 22 && relW < 16) {
    return { name: 'cup', id: 47, confidence: 0.88 };
  }

  // 2. Wide horizontal flat item (cell phone, book, laptop)
  if (aspect <= 0.65) {
    if (relW > 24) {
      return { name: 'laptop', id: 73, confidence: 0.89 };
    }
    if (relW <= 18 && relH <= 14) {
      return { name: 'cell phone', id: 77, confidence: 0.92 };
    }
    return { name: 'book', id: 84, confidence: 0.86 };
  }

  if (aspect > 0.65 && aspect <= 0.95 && relH < 22) {
    return { name: 'book', id: 84, confidence: 0.85 };
  }

  // 3. Compact bulk item (backpack, handbag, luggage)
  if (aspect >= 0.8 && aspect <= 1.4 && relH >= 15 && relH <= 45) {
    if (relY > 50 || mass > 220) {
      return { name: 'backpack', id: 27, confidence: 0.90 };
    }
    return { name: 'handbag', id: 31, confidence: 0.85 };
  }

  // 4. Large background furniture
  if (relH > 40 && relW > 30) {
    return { name: 'chair', id: 62, confidence: 0.87 };
  }

  // Default indoor item
  return { name: 'book', id: 84, confidence: 0.82 };
}
