// Detail tags with icons/images for customers to select
export const DETAIL_TAGS = [
  { id: 'handwork', name: 'Handwork', icon: '✋', description: 'Handcrafted details' },
  { id: 'embroidery', name: 'Embroidery', icon: '🧵', description: 'Beautiful embroidery work' },
  { id: 'zardozi', name: 'Zardozi', icon: '✨', description: 'Gold/silver thread work' },
  { id: 'mirror_work', name: 'Mirror Work', icon: '🪞', description: 'Mirror embellishments' },
  { id: 'sequin', name: 'Sequin', icon: '💫', description: 'Sequin detailing' },
  { id: 'bead_work', name: 'Bead Work', icon: '📿', description: 'Bead embellishments' },
  { id: 'stone_work', name: 'Stone Work', icon: '💎', description: 'Stone studded' },
  { id: 'pearl_work', name: 'Pearl Work', icon: '🦪', description: 'Pearl embellishments' },
  { id: 'kundan', name: 'Kundan', icon: '👑', description: 'Kundan jewelry work' },
  { id: 'gota_patti', name: 'Gota Patti', icon: '🎀', description: 'Ribbon lace work' },
  { id: 'chikankari', name: 'Chikankari', icon: '🌸', description: 'Lucknowi embroidery' },
  { id: 'bandhani', name: 'Bandhani', icon: '🎨', description: 'Tie-dye pattern' },
  { id: 'block_print', name: 'Block Print', icon: '🖼️', description: 'Hand block printed' },
  { id: 'silk', name: 'Pure Silk', icon: '🎀', description: '100% silk fabric' },
  { id: 'cotton', name: 'Cotton', icon: '🌿', description: 'Cotton fabric' },
  { id: 'georgette', name: 'Georgette', icon: '💫', description: 'Georgette fabric' },
  { id: 'velvet', name: 'Velvet', icon: '🎭', description: 'Velvet fabric' },
  { id: 'designer', name: 'Designer', icon: '👗', description: 'Designer piece' },
  { id: 'bridal', name: 'Bridal', icon: '💒', description: 'Bridal wear' },
  { id: 'reception', name: 'Reception', icon: '🎉', description: 'Reception wear' },
  { id: 'sangeet', name: 'Sangeet', icon: '💃', description: 'Sangeet function' },
  { id: 'mehndi', name: 'Mehndi', icon: '🌺', description: 'Mehndi function' },
  { id: 'haldi', name: 'Haldi', icon: '🌼', description: 'Haldi function' },
  { id: 'cocktail', name: 'Cocktail', icon: '🍹', description: 'Cocktail party' },
  { id: 'traditional', name: 'Traditional', icon: '🪔', description: 'Traditional style' },
  { id: ' Indo_western', name: 'Indo-Western', icon: '🌟', description: 'Fusion style' },
  { id: 'heavy', name: 'Heavy Work', icon: '⚖️', description: 'Heavy embellishments' },
  { id: 'light', name: 'Light Weight', icon: '🪶', description: 'Easy to carry' },
  { id: 'reversible', name: 'Reversible', icon: '🔄', description: 'Can be worn both sides' },
  { id: 'pockets', name: 'With Pockets', icon: '👜', description: 'Has pockets' },
  { id: 'dupatta_included', name: 'Dupatta Included', icon: '🧣', description: 'Comes with dupatta' },
  { id: 'blouse_included', name: 'Blouse Included', icon: '👚', description: 'Comes with blouse' },
  { id: 'jacket_set', name: 'Jacket Set', icon: '🧥', description: 'Includes jacket' },
  { id: 'stole_included', name: 'Stole Included', icon: '🧣', description: 'Comes with stole' },
  { id: 'mojari_set', name: 'Mojari Set', icon: '👞', description: 'Includes footwear' },
];

// Analytics events type
export interface ListingAnalytics {
  impressions: number;
  views: number;
  addToCart: number;
  dateSelected: number;
  checkoutStarted: number;
  ordersCompleted: number;
  wishlistAdded: number;
  shareCount: number;
}
