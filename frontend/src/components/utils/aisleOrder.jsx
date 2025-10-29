// Comprehensive aisle order mapping for supermarket layout
// Lower numbers = earlier in shopping journey (e.g., produce first)

export const CATEGORY_TO_AISLE_ORDER = {
    // Fresh produce - typically at entrance
    'vegetables_fruits': 10,
    
    // Fresh meats and fish
    'meat_fish': 20,
    
    // Dairy and eggs - usually refrigerated section
    'dairy_eggs': 30,
    
    // Bakery - fresh bread section
    'bakery': 40,
    
    // Pantry staples - middle aisles
    'pantry_staples': 50,
    
    // Snacks and sweets
    'snacks_sweets': 60,
    
    // Frozen foods
    'frozen_foods': 80,
    
    // Beverages
    'beverages': 90,
    
    // Household and cleaning
    'household_cleaning': 100,
    
    // Personal care
    'personal_care': 110,
    
    // Other/miscellaneous
    'other': 120
};

export const SPICE_KEYWORDS = [
    'spice', 'herb', 'salt', 'pepper', 'cumin', 'coriander', 
    'turmeric', 'paprika', 'oregano', 'basil', 'thyme', 
    'rosemary', 'cinnamon', 'ginger', 'garlic powder', 
    'onion powder', 'chili', 'cayenne', 'bay leaf', 'nutmeg',
    'cloves', 'cardamom', 'sage', 'parsley', 'dill', 'mint'
];

// Keywords to help identify specific categories
const CATEGORY_KEYWORDS = {
    'vegetables_fruits': [
        'carrot', 'onion', 'potato', 'tomato', 'lettuce', 'cucumber', 'pepper', 'broccoli',
        'cauliflower', 'spinach', 'cabbage', 'mushroom', 'garlic', 'celery', 'leek',
        'apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry', 'lemon', 'lime',
        'pear', 'peach', 'plum', 'cherry', 'avocado', 'kiwi', 'mango', 'pineapple',
        'vegetable', 'fruit', 'salad', 'berry'
    ],
    'meat_fish': [
        'chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'bacon', 'sausage',
        'ham', 'steak', 'mince', 'fish', 'salmon', 'tuna', 'cod', 'prawns',
        'shrimp', 'meat', 'fillet'
    ],
    'dairy_eggs': [
        'milk', 'cheese', 'butter', 'yogurt', 'cream', 'egg', 'yoghurt', 'cheddar',
        'mozzarella', 'parmesan', 'dairy'
    ],
    'bakery': [
        'bread', 'roll', 'baguette', 'croissant', 'bagel', 'muffin', 'cake', 'pastry',
        'bun', 'loaf', 'tortilla', 'wrap', 'pita', 'naan'
    ],
    'pantry_staples': [
        'rice', 'pasta', 'flour', 'sugar', 'oil', 'vinegar', 'sauce', 'stock',
        'tin', 'can', 'jar', 'cereal', 'oats', 'beans', 'lentils', 'chickpeas',
        'tomato paste', 'ketchup', 'mayonnaise', 'mustard', 'honey', 'jam'
    ],
    'snacks_sweets': [
        'crisp', 'chip', 'chocolate', 'candy', 'sweet', 'biscuit', 'cookie',
        'popcorn', 'nuts', 'snack', 'bar'
    ],
    'beverages': [
        'water', 'juice', 'soda', 'coffee', 'tea', 'beer', 'wine', 'drink',
        'cola', 'lemonade', 'squash'
    ],
    'frozen_foods': [
        'frozen', 'ice cream', 'pizza', 'chips'
    ],
    'household_cleaning': [
        'detergent', 'soap', 'cleaner', 'bleach', 'disinfectant', 'sponge',
        'tissue', 'toilet paper', 'kitchen roll', 'bin bag', 'washing'
    ],
    'personal_care': [
        'shampoo', 'conditioner', 'toothpaste', 'deodorant', 'razor', 'lotion',
        'shower gel', 'body wash'
    ]
};

/**
 * Determines the specific category for an ingredient based on keywords and mappings
 * Returns specific category like 'vegetables_fruits', 'dairy_eggs', etc.
 * @param {Object} ingredient - Ingredient object with name
 * @param {Array} ingredientMaps - Array of ingredient mapping objects
 * @returns {string} - Specific category enum value
 */
export function categorizeIngredient(ingredient, ingredientMaps = []) {
    const name = ingredient.name?.toLowerCase() || '';
    
    // Check if it's a spice/herb first
    if (SPICE_KEYWORDS.some(keyword => name.includes(keyword))) {
        return 'pantry_staples'; // Spices go in pantry
    }
    
    // Try to get category from ingredient map (most reliable)
    const mappedIngredient = ingredientMaps.find(
        map => map.raw_ingredient_string?.toLowerCase() === name
    );
    
    if (mappedIngredient && mappedIngredient.category) {
        return mappedIngredient.category;
    }
    
    // Check if ingredient already has a specific category property
    if (ingredient.category && CATEGORY_TO_AISLE_ORDER[ingredient.category]) {
        return ingredient.category;
    }
    
    // Use keyword matching to determine category
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(keyword => name.includes(keyword))) {
            return category;
        }
    }
    
    // Default to 'other' if no match found
    return 'other';
}

/**
 * Determines the aisle order for an ingredient
 * @param {Object} ingredient - Ingredient object with name and potentially category
 * @param {Array} ingredientMaps - Array of ingredient mapping objects
 * @returns {number} - Aisle order number
 */
export function getAisleOrder(ingredient, ingredientMaps = []) {
    // Get the specific category
    const category = categorizeIngredient(ingredient, ingredientMaps);
    
    // Return the aisle order for this category
    return CATEGORY_TO_AISLE_ORDER[category] || 120;
}

/**
 * Sorts items by aisle order
 * @param {Array} items - Array of items with category property
 * @returns {Array} - Sorted array
 */
export function sortByAisleOrder(items) {
    return [...items].sort((a, b) => {
        // Get aisle order, either from stored aisle_order or calculate from category
        const orderA = a.aisle_order || CATEGORY_TO_AISLE_ORDER[a.category] || 999;
        const orderB = b.aisle_order || CATEGORY_TO_AISLE_ORDER[b.category] || 999;
        return orderA - orderB;
    });
}

/**
 * Get all available categories for selection dropdowns
 * @returns {Array} - Array of category options
 */
export function getCategoryOptions() {
    return [
        { value: 'vegetables_fruits', label: 'Vegetables & Fruits' },
        { value: 'meat_fish', label: 'Meat & Fish' },
        { value: 'dairy_eggs', label: 'Dairy & Eggs' },
        { value: 'bakery', label: 'Bakery' },
        { value: 'pantry_staples', label: 'Pantry Staples' },
        { value: 'snacks_sweets', label: 'Snacks & Sweets' },
        { value: 'beverages', label: 'Beverages' },
        { value: 'frozen_foods', label: 'Frozen Foods' },
        { value: 'household_cleaning', label: 'Household & Cleaning' },
        { value: 'personal_care', label: 'Personal Care' },
        { value: 'other', label: 'Other' }
    ];
}