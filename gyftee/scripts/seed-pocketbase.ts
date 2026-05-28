/**
 * Seed script: populates PocketBase with 50+ gifts across all 7 categories.
 *
 * Run with:
 *   $env:PB_ADMIN_EMAIL='your-admin@email.com'
 *   $env:PB_ADMIN_PASSWORD='yourpassword'
 *   npx tsx scripts/seed-pocketbase.ts
 */

import PocketBase from 'pocketbase';

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? 'http://127.0.0.1:8090';
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(
    'Missing credentials.\n' +
    'Set $env:PB_ADMIN_EMAIL and $env:PB_ADMIN_PASSWORD before running.'
  );
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Gift data — 50+ items, 7 categories, varied tags and price points.
// Tags are used by the ML service for TF-IDF vectorization — be descriptive.
// ─────────────────────────────────────────────────────────────────────────────

type GiftSeed = {
  name: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  store_link: string;
};

const GIFTS: GiftSeed[] = [
  // ── Tech ──────────────────────────────────────────────────────────────────
  {
    name: 'Mechanical Keyboard',
    description:
      'A tactile, clicky typing experience that makes every keystroke feel satisfying. RGB backlighting, hot-swappable switches, aluminum frame.',
    category: 'Tech',
    tags: ['keyboard', 'mechanical', 'rgb', 'desk', 'productivity', 'typing', 'gaming', 'clicky'],
    price: 129,
    store_link: 'https://www.amazon.com/s?k=mechanical+keyboard',
  },
  {
    name: 'Noise-Cancelling Headphones',
    description:
      'Premium over-ear headphones with industry-leading active noise cancellation. Up to 30 hours of battery life, crystal-clear audio.',
    category: 'Tech',
    tags: ['headphones', 'audio', 'noise-cancelling', 'wireless', 'music', 'focus', 'commute', 'premium'],
    price: 299,
    store_link: 'https://www.amazon.com/s?k=noise+cancelling+headphones',
  },
  {
    name: 'Smart LED Desk Lamp',
    description:
      'Adaptive brightness and color temperature. Works with Alexa and Google Home. Built-in wireless charging pad.',
    category: 'Tech',
    tags: ['lamp', 'desk', 'smart-home', 'led', 'wireless-charging', 'productivity', 'rgb'],
    price: 59,
    store_link: 'https://www.amazon.com/s?k=smart+led+desk+lamp',
  },
  {
    name: 'Portable SSD 1TB',
    description:
      'Pocket-sized external SSD with USB-C. 1050 MB/s read speeds — backs up your entire photo library in minutes.',
    category: 'Tech',
    tags: ['storage', 'ssd', 'portable', 'usb-c', 'backup', 'photography', 'fast'],
    price: 89,
    store_link: 'https://www.amazon.com/s?k=portable+ssd+1tb',
  },
  {
    name: 'Wireless Charging Pad',
    description:
      'Qi-certified 15W fast wireless charging for iPhone and Android. Slim, minimalist design for your nightstand or desk.',
    category: 'Tech',
    tags: ['wireless-charging', 'desk', 'minimalist', 'phone', 'fast-charge', 'nightstand'],
    price: 25,
    store_link: 'https://www.amazon.com/s?k=wireless+charging+pad',
  },
  {
    name: 'Stream Deck Mini',
    description:
      'Programmable LCD shortcut keypad for streamers, editors, and power users. Automate anything with custom key profiles.',
    category: 'Tech',
    tags: ['streaming', 'productivity', 'desk', 'automation', 'gaming', 'content-creation'],
    price: 79,
    store_link: 'https://www.amazon.com/s?k=elgato+stream+deck+mini',
  },
  {
    name: 'USB-C Hub 7-in-1',
    description:
      'Expand your laptop ports instantly. HDMI 4K, SD card, 3× USB-A, USB-C PD, and ethernet in one sleek hub.',
    category: 'Tech',
    tags: ['hub', 'usb-c', 'laptop', 'hdmi', 'productivity', 'travel', 'desk'],
    price: 45,
    store_link: 'https://www.amazon.com/s?k=usb+c+hub+7+in+1',
  },
  {
    name: 'Smart Plug (4-Pack)',
    description:
      'Control any outlet from your phone. Schedule, monitor energy usage, and automate your home.',
    category: 'Tech',
    tags: ['smart-home', 'automation', 'alexa', 'google-home', 'energy', 'plug'],
    price: 29,
    store_link: 'https://www.amazon.com/s?k=smart+plug+4+pack',
  },

  // ── Gaming ────────────────────────────────────────────────────────────────
  {
    name: 'Gaming Mouse',
    description:
      'Ultra-lightweight gaming mouse with 25,600 DPI optical sensor. Programmable buttons, RGB lighting, and near-zero latency wireless.',
    category: 'Gaming',
    tags: ['mouse', 'gaming', 'rgb', 'wireless', 'fps', 'esports', 'precise'],
    price: 79,
    store_link: 'https://www.amazon.com/s?k=gaming+mouse+wireless',
  },
  {
    name: 'Gaming Controller Stand',
    description:
      'Dual controller charging stand with USB hub. Keeps your desk clean and controllers ready to go.',
    category: 'Gaming',
    tags: ['gaming', 'controller', 'desk', 'organization', 'charging', 'console'],
    price: 29,
    store_link: 'https://www.amazon.com/s?k=gaming+controller+stand+charging',
  },
  {
    name: 'Gaming Headset',
    description:
      '7.1 surround sound gaming headset with noise-cancelling mic. Hear every footstep, communicate clearly.',
    category: 'Gaming',
    tags: ['headset', 'gaming', 'surround-sound', 'microphone', 'fps', 'discord', 'esports'],
    price: 99,
    store_link: 'https://www.amazon.com/s?k=gaming+headset+7.1+surround',
  },
  {
    name: 'Artisan Keycaps Set',
    description:
      'Handcrafted resin keycaps with unique designs. Customise your mechanical keyboard with limited-edition artisan caps.',
    category: 'Gaming',
    tags: ['keyboard', 'keycaps', 'artisan', 'mechanical', 'custom', 'desk', 'collector'],
    price: 45,
    store_link: 'https://www.etsy.com/search?q=artisan+keycaps',
  },
  {
    name: 'Retro Mini Console',
    description:
      'Pre-loaded with 620 classic arcade games. Plug into any TV via HDMI and relive the golden age of gaming.',
    category: 'Gaming',
    tags: ['retro', 'arcade', 'nostalgia', 'console', 'classic', 'gaming', 'tv'],
    price: 39,
    store_link: 'https://www.amazon.com/s?k=retro+mini+console+arcade',
  },
  {
    name: 'Mouse Bungee',
    description:
      'Keeps your mouse cable perfectly taut and tangle-free. Weighted base, flexible arm, clean desk aesthetic.',
    category: 'Gaming',
    tags: ['gaming', 'desk', 'mouse', 'cable-management', 'organization', 'esports'],
    price: 19,
    store_link: 'https://www.amazon.com/s?k=mouse+bungee',
  },

  // ── Home ──────────────────────────────────────────────────────────────────
  {
    name: 'Himalayan Salt Lamp',
    description:
      'Natural pink Himalayan crystal lamp with warm amber glow. Creates a cozy, soothing atmosphere.',
    category: 'Home',
    tags: ['lamp', 'cozy', 'ambient', 'natural', 'bedroom', 'wellness', 'decor', 'warm'],
    price: 22,
    store_link: 'https://www.amazon.com/s?k=himalayan+salt+lamp',
  },
  {
    name: 'Pour-Over Coffee Set',
    description:
      'Chemex-style borosilicate glass pour-over with a goose-neck kettle. The ritual that makes mornings worth waking up for.',
    category: 'Home',
    tags: ['coffee', 'pour-over', 'kitchen', 'morning', 'ritual', 'pour', 'barista'],
    price: 65,
    store_link: 'https://www.amazon.com/s?k=pour+over+coffee+set',
  },
  {
    name: 'Weighted Blanket',
    description:
      '15-lb weighted blanket with removable washable cover. Like a full-body hug that improves sleep quality.',
    category: 'Home',
    tags: ['blanket', 'sleep', 'cozy', 'weighted', 'anxiety', 'bedroom', 'comfort'],
    price: 59,
    store_link: 'https://www.amazon.com/s?k=weighted+blanket+15lb',
  },
  {
    name: 'Aromatherapy Diffuser',
    description:
      'Ultrasonic essential oil diffuser with 7-color LED light. Fills any room with calming scents for up to 10 hours.',
    category: 'Home',
    tags: ['aromatherapy', 'diffuser', 'essential-oil', 'wellness', 'bedroom', 'cozy', 'relaxation'],
    price: 29,
    store_link: 'https://www.amazon.com/s?k=aromatherapy+diffuser',
  },
  {
    name: 'Ceramic Plant Pots Set',
    description:
      'Set of 3 minimalist white ceramic pots with bamboo trays. Perfect for succulents and small indoor plants.',
    category: 'Home',
    tags: ['plants', 'decor', 'minimalist', 'ceramic', 'succulents', 'indoor', 'home'],
    price: 32,
    store_link: 'https://www.amazon.com/s?k=ceramic+plant+pots+minimalist',
  },
  {
    name: 'Linen Throw Pillow Covers',
    description:
      'Set of 4 stonewashed linen pillow covers in earthy tones. Instantly elevates any couch or bed.',
    category: 'Home',
    tags: ['pillow', 'linen', 'decor', 'cozy', 'neutral', 'bedroom', 'couch', 'aesthetic'],
    price: 36,
    store_link: 'https://www.amazon.com/s?k=linen+throw+pillow+covers',
  },
  {
    name: 'Candle Making Kit',
    description:
      'Everything you need to make 20+ soy wax candles at home. Includes 8 fragrance oils, wicks, jars, and dye.',
    category: 'Home',
    tags: ['candle', 'diy', 'craft', 'soy-wax', 'home', 'fragrance', 'hobby'],
    price: 40,
    store_link: 'https://www.amazon.com/s?k=candle+making+kit',
  },
  {
    name: 'Mini Projector',
    description:
      'Pocket-sized HD projector. Stream Netflix or YouTube up to 100" anywhere — bedroom ceiling, backyard, campervan.',
    category: 'Home',
    tags: ['projector', 'movies', 'entertainment', 'bedroom', 'outdoor', 'streaming', 'cozy'],
    price: 89,
    store_link: 'https://www.amazon.com/s?k=mini+projector+portable',
  },

  // ── Books ─────────────────────────────────────────────────────────────────
  {
    name: 'Atomic Habits',
    description:
      "James Clear's #1 bestseller on building good habits and breaking bad ones. Practical, science-backed, and genuinely life-changing.",
    category: 'Books',
    tags: ['habits', 'self-improvement', 'productivity', 'psychology', 'nonfiction', 'bestseller'],
    price: 14,
    store_link: 'https://www.amazon.com/s?k=atomic+habits+james+clear',
  },
  {
    name: 'The Pragmatic Programmer',
    description:
      'The classic software engineering book every developer should read. Timeless advice on building maintainable, elegant code.',
    category: 'Books',
    tags: ['programming', 'software', 'career', 'developer', 'coding', 'technical', 'nonfiction'],
    price: 30,
    store_link: 'https://www.amazon.com/s?k=the+pragmatic+programmer',
  },
  {
    name: 'Sapiens',
    description:
      "Yuval Noah Harari's sweeping history of humankind. Challenges everything you think you know about how we got here.",
    category: 'Books',
    tags: ['history', 'humanity', 'nonfiction', 'philosophy', 'bestseller', 'science', 'anthropology'],
    price: 15,
    store_link: 'https://www.amazon.com/s?k=sapiens+harari',
  },
  {
    name: 'Deep Work',
    description:
      "Cal Newport's guide to developing the ability to focus without distraction — the superpower of the modern age.",
    category: 'Books',
    tags: ['productivity', 'focus', 'self-improvement', 'career', 'nonfiction', 'deep-work'],
    price: 14,
    store_link: 'https://www.amazon.com/s?k=deep+work+cal+newport',
  },
  {
    name: 'Designing Data-Intensive Applications',
    description:
      'The definitive guide to building reliable, scalable, distributed systems. A must-read for backend engineers.',
    category: 'Books',
    tags: ['programming', 'databases', 'distributed-systems', 'backend', 'technical', 'engineering'],
    price: 50,
    store_link: 'https://www.amazon.com/s?k=designing+data+intensive+applications',
  },
  {
    name: 'The Creative Act',
    description:
      "Rick Rubin's meditative guide to creativity. Not just for musicians — for anyone who makes anything.",
    category: 'Books',
    tags: ['creativity', 'art', 'philosophy', 'music', 'nonfiction', 'inspiration', 'mindset'],
    price: 22,
    store_link: 'https://www.amazon.com/s?k=the+creative+act+rick+rubin',
  },
  {
    name: 'Illustrated Edition: Dune',
    description:
      "Frank Herbert's sci-fi masterpiece with stunning full-page illustrations. A collector's edition worth displaying.",
    category: 'Books',
    tags: ['scifi', 'fiction', 'illustrated', 'collector', 'dune', 'classic', 'fantasy'],
    price: 35,
    store_link: 'https://www.amazon.com/s?k=dune+illustrated+edition',
  },

  // ── Fashion ───────────────────────────────────────────────────────────────
  {
    name: 'Minimalist Watch',
    description:
      'Swiss-made quartz movement in a clean, thin case. The watch that goes with everything.',
    category: 'Fashion',
    tags: ['watch', 'minimalist', 'fashion', 'accessories', 'swiss', 'everyday', 'clean'],
    price: 120,
    store_link: 'https://www.amazon.com/s?k=minimalist+watch+mens+womens',
  },
  {
    name: 'Cashmere Beanie',
    description:
      '100% Mongolian cashmere. Incredibly soft, warm, and understated. One of those gifts people wear every single day.',
    category: 'Fashion',
    tags: ['beanie', 'cashmere', 'winter', 'cozy', 'soft', 'fashion', 'everyday', 'hat'],
    price: 45,
    store_link: 'https://www.amazon.com/s?k=cashmere+beanie',
  },
  {
    name: 'Canvas Tote Bag',
    description:
      'Heavy-duty waxed canvas tote. Takes your aesthetic from "grocery run" to "effortlessly put-together".',
    category: 'Fashion',
    tags: ['tote', 'canvas', 'bag', 'everyday', 'fashion', 'sustainable', 'minimal'],
    price: 35,
    store_link: 'https://www.amazon.com/s?k=waxed+canvas+tote+bag',
  },
  {
    name: 'Leather Card Wallet',
    description:
      'Slim bifold wallet, full-grain leather, holds up to 8 cards. Gets better with age.',
    category: 'Fashion',
    tags: ['wallet', 'leather', 'slim', 'minimalist', 'fashion', 'everyday', 'cards'],
    price: 55,
    store_link: 'https://www.amazon.com/s?k=slim+leather+card+wallet',
  },
  {
    name: 'Satin Sleep Mask',
    description:
      'Adjustable mulberry silk sleep mask. Blocks 100% of light, gentle on skin — wake up actually rested.',
    category: 'Fashion',
    tags: ['sleep', 'silk', 'mask', 'wellness', 'bedroom', 'travel', 'beauty'],
    price: 18,
    store_link: 'https://www.amazon.com/s?k=silk+sleep+mask',
  },
  {
    name: 'Oversized Sunglasses',
    description:
      'UV400 polarized lenses in a retro oversized frame. The sunglasses that make every outfit look considered.',
    category: 'Fashion',
    tags: ['sunglasses', 'fashion', 'retro', 'polarized', 'outdoor', 'aesthetic', 'summer'],
    price: 28,
    store_link: 'https://www.amazon.com/s?k=oversized+polarized+sunglasses',
  },
  {
    name: 'Bamboo Socks Set',
    description:
      'Set of 7 pairs of bamboo fiber socks — softer and more breathable than cotton, with subtle patterns.',
    category: 'Fashion',
    tags: ['socks', 'bamboo', 'sustainable', 'everyday', 'comfortable', 'fashion', 'casual'],
    price: 24,
    store_link: 'https://www.amazon.com/s?k=bamboo+socks+set',
  },

  // ── Fitness ───────────────────────────────────────────────────────────────
  {
    name: 'Resistance Band Set',
    description:
      '5-piece resistance band set from 10–50 lbs. Full-body home workouts without a gym. Compact, durable, stackable.',
    category: 'Fitness',
    tags: ['resistance-bands', 'workout', 'home-gym', 'strength', 'portable', 'exercise'],
    price: 28,
    store_link: 'https://www.amazon.com/s?k=resistance+band+set',
  },
  {
    name: 'Yoga Mat',
    description:
      'Extra-thick 6mm non-slip yoga mat with alignment lines. Eco-friendly TPE material, reversible design.',
    category: 'Fitness',
    tags: ['yoga', 'mat', 'fitness', 'wellness', 'non-slip', 'eco-friendly', 'stretching', 'pilates'],
    price: 42,
    store_link: 'https://www.amazon.com/s?k=yoga+mat+non+slip',
  },
  {
    name: 'Jump Rope (Weighted)',
    description:
      'Adjustable weighted jump rope with memory foam handles. Burns 3x the calories of jogging at the same intensity.',
    category: 'Fitness',
    tags: ['jump-rope', 'cardio', 'fitness', 'workout', 'home-gym', 'portable', 'hiit'],
    price: 25,
    store_link: 'https://www.amazon.com/s?k=weighted+jump+rope',
  },
  {
    name: 'Foam Roller',
    description:
      'High-density foam roller for muscle recovery. Deep tissue massage to reduce DOMS and increase flexibility.',
    category: 'Fitness',
    tags: ['foam-roller', 'recovery', 'massage', 'fitness', 'muscles', 'mobility', 'yoga'],
    price: 22,
    store_link: 'https://www.amazon.com/s?k=foam+roller+high+density',
  },
  {
    name: 'Adjustable Dumbbell (Single)',
    description:
      'Replaces 15 dumbbells in one. Adjusts from 5–52.5 lbs in 2.5 lb increments. The home gym essential.',
    category: 'Fitness',
    tags: ['dumbbell', 'strength', 'home-gym', 'adjustable', 'workout', 'weights', 'resistance'],
    price: 149,
    store_link: 'https://www.amazon.com/s?k=adjustable+dumbbell+bowflex',
  },
  {
    name: 'Smart Water Bottle',
    description:
      'LED temperature display, glows to remind you to drink. Tracks daily hydration and syncs to your phone.',
    category: 'Fitness',
    tags: ['water-bottle', 'hydration', 'smart', 'wellness', 'fitness', 'health', 'daily'],
    price: 35,
    store_link: 'https://www.amazon.com/s?k=smart+water+bottle+hydration+tracker',
  },
  {
    name: 'Pull-Up Bar (Doorframe)',
    description:
      'No-screw doorframe pull-up bar. Supports up to 300 lbs, works on most standard door frames.',
    category: 'Fitness',
    tags: ['pull-up', 'home-gym', 'strength', 'doorframe', 'workout', 'upper-body'],
    price: 30,
    store_link: 'https://www.amazon.com/s?k=doorframe+pull+up+bar',
  },

  // ── Food ──────────────────────────────────────────────────────────────────
  {
    name: 'Global Spice Box',
    description:
      '12 rare spices from around the world — Aleppo pepper, Urfa biber, Sicilian sea salt and more. For the adventurous home cook.',
    category: 'Food',
    tags: ['spices', 'cooking', 'international', 'gourmet', 'kitchen', 'foodie', 'chef'],
    price: 42,
    store_link: 'https://www.amazon.com/s?k=global+spice+box+set',
  },
  {
    name: 'Artisanal Hot Sauce Set',
    description:
      '6-bottle set of small-batch hot sauces from fermented, smoky to tropical. A heat journey in a box.',
    category: 'Food',
    tags: ['hot-sauce', 'spicy', 'condiment', 'foodie', 'cooking', 'fermented', 'gift-set'],
    price: 38,
    store_link: 'https://www.amazon.com/s?k=artisanal+hot+sauce+set',
  },
  {
    name: 'Single-Origin Coffee Sampler',
    description:
      'Whole-bean coffees from Ethiopia, Colombia, and Guatemala. Each bag tells the story of its farm.',
    category: 'Food',
    tags: ['coffee', 'single-origin', 'specialty', 'morning', 'beans', 'foodie', 'artisan'],
    price: 35,
    store_link: 'https://www.amazon.com/s?k=single+origin+coffee+sampler',
  },
  {
    name: 'Matcha Starter Kit',
    description:
      'Ceremonial grade matcha, bamboo whisk, ceramic bowl, and sifter. Everything to make perfect matcha at home.',
    category: 'Food',
    tags: ['matcha', 'tea', 'japanese', 'ceremony', 'morning', 'wellness', 'kitchen'],
    price: 45,
    store_link: 'https://www.amazon.com/s?k=matcha+starter+kit+ceremonial',
  },
  {
    name: 'Pasta Making Kit',
    description:
      'Hand-crank pasta machine with fresh pasta recipe book. Making pasta from scratch is genuinely therapeutic.',
    category: 'Food',
    tags: ['pasta', 'cooking', 'italian', 'diy', 'kitchen', 'foodie', 'homemade', 'hobby'],
    price: 55,
    store_link: 'https://www.amazon.com/s?k=pasta+making+kit',
  },
  {
    name: 'Craft Cocktail Kit',
    description:
      'Includes muddler, jigger, bar spoon, Hawthorne strainer, and a recipe booklet of 30 classic cocktails.',
    category: 'Food',
    tags: ['cocktail', 'bartending', 'drinks', 'bar', 'entertainment', 'kit', 'party', 'mixology'],
    price: 38,
    store_link: 'https://www.amazon.com/s?k=craft+cocktail+kit+set',
  },
  {
    name: 'Premium Chocolate Box',
    description:
      "Assortment of 24 single-origin dark chocolates from 5 different countries. The gift that's never wrong.",
    category: 'Food',
    tags: ['chocolate', 'premium', 'dark-chocolate', 'foodie', 'gift', 'luxury', 'sweet'],
    price: 32,
    store_link: 'https://www.amazon.com/s?k=premium+dark+chocolate+assortment',
  },
  {
    name: 'Fermentation Crock',
    description:
      'Traditional German 2L stoneware fermentation crock with water-seal lid. Make sauerkraut, kimchi, and pickles at home.',
    category: 'Food',
    tags: ['fermentation', 'cooking', 'diy', 'healthy', 'kimchi', 'sauerkraut', 'gut-health', 'foodie'],
    price: 48,
    store_link: 'https://www.amazon.com/s?k=fermentation+crock+stoneware',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Seed runner
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const pb = new PocketBase(PB_URL);

  console.log(`Connecting to PocketBase at ${PB_URL}...`);
  // PocketBase v0.22.x admin auth endpoint (pre-superusers refactor)
  const authRes = await fetch(`${PB_URL}/api/admins/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!authRes.ok) {
    const body = await authRes.text();
    throw new Error(`Admin auth failed (${authRes.status}): ${body}`);
  }
  const { token, admin } = await authRes.json();
  pb.authStore.save(token, admin);
  console.log('Authenticated as admin.');

  // Check existing count to avoid duplicates
  const existing = await pb.collection('gifts').getList(1, 1);
  if (existing.totalItems > 0) {
    console.log(`⚠  gifts collection already has ${existing.totalItems} records.`);
    const answer = process.argv.includes('--force')
      ? 'y'
      : await prompt('Re-seed anyway? This adds NEW records on top. [y/N] ');
    if (answer.toLowerCase() !== 'y') {
      console.log('Aborted. Pass --force to skip this prompt.');
      process.exit(0);
    }
  }

  let created = 0;
  let failed = 0;

  for (const gift of GIFTS) {
    try {
      await pb.collection('gifts').create({
        name: gift.name,
        description: gift.description,
        category: gift.category,
        tags: gift.tags,
        price: gift.price,
        store_link: gift.store_link,
      });
      console.log(`  ✓ ${gift.name}`);
      created++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${gift.name}: ${msg}`);
      failed++;
    }
  }

  console.log(`\nDone. Created: ${created}, Failed: ${failed}`);
}

function prompt(question: string): Promise<string> {
  process.stdout.write(question);
  return new Promise((resolve) => {
    let answer = '';
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.once('data', (data) => {
      answer = String(data).trim();
      process.stdin.pause();
      resolve(answer);
    });
  });
}

main().catch((err) => {
  console.error('Fatal:', err instanceof Error ? err.message : err);
  process.exit(1);
});
