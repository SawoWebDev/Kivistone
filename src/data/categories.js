/*
  One entry per product range. `feature: true` promotes a range into the two
  large spotlight cards at the top of the products grid.
*/
export const categories = [
  {
    slug: 'candle-holders',
    title: 'Candle Holders',
    seed: 'kivistone-candle',
    image: '/assets/products/candle-holders.jpg',
    feature: true,
    description:
      'Fire and stone — two of nature’s fundamental elements put together into a harmonious yet impressive blend. Whether the occasion is official or festive, KiviStone candle holders won’t be left unnoticed.',
    short: 'Two of nature’s fundamental elements, put together into a harmonious yet impressive blend.',
    specs: ['Tealight & taper', 'Flame safe', 'Hand-finished'],
  },
  {
    slug: 'dish-plates',
    title: 'Dish Plates',
    seed: 'kivistone-plates',
    image: '/assets/products/plate.jpg',
    feature: true,
    description:
      'Soapstone is a good conductor of heat and withstands high temperature without any damage. As a natural material it emits no harmful chemicals and does not change the taste of the food heated above it — perfect for sizzling plates and hot dishes.',
    short: 'Holds high heat without damage, and never taints the taste of what you serve on it.',
    specs: ['Oven & grill safe', 'Holds heat', 'Food-safe stone'],
  },
  {
    slug: 'cups-and-coolers',
    title: 'Cups & Coolers',
    seed: 'kivistone-cups',
    image: '/assets/products/cups-and-coolers.jpg',
    description:
      'Put a KiviStone cooler in the freezer for a few moments. Take it out and place your drinks or wine on it to keep them cool for hours — no ice, no dilution, no condensation rings.',
    short: 'A few minutes in the freezer keeps drinks and wine cool for hours — no ice, no dilution.',
    specs: ['Freezer ready', 'Wine & spirits', 'No dilution'],
  },
  {
    slug: 'scent-warmers',
    title: 'Scent Warmers',
    seed: 'kivistone-scent',
    image: '/assets/products/scent-warmer.jpg',
    description:
      'Enjoy the relaxing and vitalizing effect of aromatic oils. Light a candle, pour scented oil into the basin and loosen up — the stone spreads the heat gently, so the fragrance releases slowly rather than burning off.',
    short: 'Light a candle, pour oil into the basin, and let the stone release the fragrance slowly.',
    specs: ['Tealight powered', 'Deep oil basin', 'Even diffusion'],
  },
  {
    slug: 'soap-holders',
    title: 'Soap Holders',
    seed: 'kivistone-soap',
    image: '/assets/products/soap-holder.jpg',
    description:
      'A personal touch for the basin, done in solid soapstone. The holder is beveled in the middle with linear holes that drain excess water, keeping the soap clean and dry after every use, and it stands on legs so air can move underneath.',
    short: 'Beveled and drained, with legs that let air move underneath so soap dries between uses.',
    specs: ['Drainage channels', 'Raised legs', 'Solid soapstone'],
  },
  {
    slug: 'picture-frames',
    title: 'Picture Frames',
    seed: 'kivistone-frame',
    image: '/assets/products/picture-frame.jpg',
    description:
      'Save your memories in the stone. Place photos of your loved ones and the moments worth keeping into timeless, everlasting frames that will outlast the paper inside them.',
    short: 'Photos of the people and moments worth keeping, set into a frame that outlasts them.',
    specs: ['Portrait & round', 'Freestanding', 'Gift boxed'],
  },
  {
    slug: 'stone-coasters',
    title: 'Stone Coasters',
    seed: 'kivistone-coaster',
    image: '/assets/products/stone-coaster.jpg',
    description:
      'The first absorbent stone coasters, car coasters and trivets. CoasterStone offers the widest selection of art available in the marketplace — with over 2,000 designs to choose from, there is something for any style or preference.',
    short: 'Absorbent stone coasters, car coasters and trivets, with over 2,000 designs to choose from.',
    specs: ['2,000+ designs', 'Absorbent', 'Sets & trivets'],
  },
  {
    slug: 'aroma-spirit-cups',
    title: 'Aroma Spirit Cups',
    seed: 'kivistone-aroma',
    image: '/assets/products/aroma.jpg',
    description:
      'Carved for fragrant, grape-based pomace brandy of Italian origin — the kind that carries 35–60% alcohol by volume (70 to 120 US proof). The stone holds the chill and opens up the aroma as you drink.',
    short: 'Carved for fragrant, grape-based pomace brandy — the stone holds the chill and opens the aroma.',
    specs: ['Chill or warm', 'Sold in pairs', 'Carved detail'],
  },
];

export const getCategory = (slug) => categories.find((c) => c.slug === slug);

export const featuredCategories = categories.filter((c) => c.feature);
export const standardCategories = categories.filter((c) => !c.feature);
