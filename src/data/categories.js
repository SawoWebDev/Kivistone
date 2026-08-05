/*
  One entry per product range. `feature: true` promotes a range into the two
  large spotlight cards at the top of the products grid.
*/
export const categories = [
  {
    slug: 'candle-holders',
    title: 'Candle Holders',
    seed: 'kivistone-candle',
    image: '/assets/products/candle-holders.webp',
    feature: true,
    description:
      'Fire and stone, two of nature’s fundamental elements put together into a harmonious yet impressive blend. Whether the occasion is official or festive, Kivistone candle holders won’t be left unnoticed.',
    short: 'Fire and stone have always been an intriguing mix, one that draws us back to the Stone Age. Brought together in a Kivistone candle holder, these two natural elements create a harmonious, hand-carved piece from genuine Finnish soapstone. Whether the occasion is formal or festive, a Kivistone candle holder stands out, filling its surroundings with a warm and cozy glow.',
    specs: ['Tealight & taper', 'Flame safe', 'Hand-finished'],
  },
  {
    slug: 'dish-plates',
    title: 'Dish Plates',
    seed: 'kivistone-plates',
    image: '/assets/products/plate.webp',
    feature: true,
    description:
      'Soapstone is a good conductor of heat and withstands high temperature without any damage. As a natural material it emits no harmful chemicals and does not change the taste of the food heated above it, perfect for sizzling plates and hot dishes.',
    short: 'Soapstone is a natural conductor of heat, so it withstands high temperatures without cracking or warping. As a completely natural material, it emits no harmful chemicals and never changes the taste of the food heated above it, making Kivistone dish plates perfect for sizzling plates and serving hot dishes straight from the oven or grill.',
    specs: ['Oven & grill safe', 'Holds heat', 'Food-safe stone'],
  },
  {
    slug: 'cups-and-coolers',
    title: 'Cups & Coolers',
    seed: 'kivistone-cups',
    image: '/assets/products/cups-and-coolers.webp',
    description:
      'Soapstone material is a good non-porous example. It can preserve and contain liquids neatly. Aside from that, soapstone is a good temperature conductor. When the soapstone Cooler is kept in the fridge, it holds the cold temperature and amazingly cools the liquid bottle placed on it, keeping it cold for long. Kivistone cups and coolers are good for wines, bottled and canned liquids.',
    short: 'Soapstone is naturally non-porous, so it holds and preserves liquids cleanly without absorbing odors or flavors. It’s also an excellent temperature conductor: chill a Kivistone cooler in the fridge and it holds the cold, amazingly keeping any bottle or can placed on it refreshingly cool for hours. Kivistone cups and coolers are ideal for wine, bottled drinks, and canned beverages alike.',
    specs: ['Freezer ready', 'Wine & spirits', 'No dilution'],
  },
  {
    slug: 'scent-warmers',
    title: 'Scent Warmers',
    seed: 'kivistone-scent',
    image: '/assets/products/scent-warmer.webp',
    description:
      'Enjoy the relaxing and vitalizing effect of aromatic oils. Light a candle, pour scented oil into the basin and loosen up: the stone spreads the heat gently, so the fragrance releases slowly rather than burning off.',
    short: 'Enjoy the relaxing, vitalizing effect of aromatic oils with a Kivistone scent warmer. The tranquility begins the moment the scent is released through the heated aroma oil, drifting gently around the room for a refreshing feeling. Place an aroma cup on the sauna heater’s stones for happy sauna spirits, or set a table warmer over a tealight, a candle holder with a cap where scented oils evaporate slowly. Aroma oils are also available on request as a separate order.',
    specs: ['Tealight powered', 'Deep oil basin', 'Even diffusion'],
  },
  {
    slug: 'miscellaneous',
    title: 'Miscellaneous',
    seed: 'kivistone-misc',
    image: '/assets/products/picture-frame.webp',
    description:
      'The rest of the Kivistone range: soap holders, picture frames, stone coasters, and aroma spirit cups. Different shapes and uses, all cut and hand-finished from the same Finnish soapstone.',
    short: 'Kivistone soapstone designs are limitless, ashtrays, coasters, soap holders, and picture frames are just where the range begins. Every piece is cut and hand-finished from the same Finnish soapstone as the rest of the collection. Have a design in mind that isn’t listed here? Send us your request and we’ll gladly take on the challenge of making it.',
    specs: ['Assorted styles', 'Hand-finished', 'Gift ready'],
  },
];

export const getCategory = (slug) => categories.find((c) => c.slug === slug);

export const featuredCategories = categories.filter((c) => c.feature);
export const standardCategories = categories.filter((c) => !c.feature);
