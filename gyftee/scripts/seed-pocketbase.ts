/**
 * Seed script: populates PocketBase with 60+ gifts across all 7 categories.
 * Prices are in USD but calibrated to Indian market purchasing power.
 *
 * Run with:
 *   $env:PB_ADMIN_EMAIL='your-admin@email.com'
 *   $env:PB_ADMIN_PASSWORD='yourpassword'
 *   npx tsx scripts/seed-pocketbase.ts
 *
 * Add --reset to delete existing gifts first.
 */

import PocketBase from 'pocketbase';

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? 'http://127.0.0.1:8090';
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Missing credentials.\nSet $env:PB_ADMIN_EMAIL and $env:PB_ADMIN_PASSWORD before running.');
  process.exit(1);
}

type GiftSeed = {
  name: string;
  description: string;
  category: string;
  tags: string[];
  price: number; // INR — Indian Rupees
  store_link: string;
};

const GIFTS: GiftSeed[] = [
  // ── Tech ──────────────────────────────────────────────────────────────────
  { name: 'Mechanical Keyboard', description: 'Tactile, clicky typing with RGB backlighting and hot-swappable switches. A desk upgrade that actually matters.', category: 'Tech', tags: ['keyboard', 'mechanical', 'rgb', 'desk', 'productivity', 'typing', 'gaming'], price: 2499, store_link: 'https://www.amazon.in/s?k=mechanical+keyboard' },
  { name: 'Wireless Earbuds', description: 'True wireless earbuds with active noise cancellation and 24hr battery life. Crystal clear calls, deep bass.', category: 'Tech', tags: ['earbuds', 'wireless', 'noise-cancelling', 'audio', 'music', 'commute'], price: 1999, store_link: 'https://www.amazon.in/s?k=wireless+earbuds' },
  { name: 'Smart LED Desk Lamp', description: 'Adaptive brightness and color temperature. Works with Alexa. Built-in wireless charging pad for your phone.', category: 'Tech', tags: ['lamp', 'desk', 'smart-home', 'led', 'wireless-charging', 'productivity'], price: 999, store_link: 'https://www.amazon.in/s?k=smart+led+desk+lamp' },
  { name: 'Portable SSD 512GB', description: 'Pocket-sized external SSD with USB-C. Backs up your entire photo library in minutes. Drop-resistant.', category: 'Tech', tags: ['storage', 'ssd', 'portable', 'usb-c', 'backup', 'photography'], price: 3999, store_link: 'https://www.amazon.in/s?k=portable+ssd+512gb' },
  { name: 'Wireless Charging Pad', description: 'Qi-certified fast wireless charging for iPhone and Android. Slim and minimalist.', category: 'Tech', tags: ['wireless-charging', 'desk', 'phone', 'fast-charge', 'minimalist'], price: 499, store_link: 'https://www.amazon.in/s?k=wireless+charging+pad' },
  { name: 'USB-C Hub 7-in-1', description: 'Expand your laptop ports. HDMI 4K, SD card, 3× USB-A, USB-C PD, and ethernet in one hub.', category: 'Tech', tags: ['hub', 'usb-c', 'laptop', 'hdmi', 'productivity', 'travel'], price: 999, store_link: 'https://www.amazon.in/s?k=usb+c+hub+7+in+1' },
  { name: 'Smart Plug 4-Pack', description: 'Control any outlet from your phone. Schedule, monitor energy usage, and automate your home.', category: 'Tech', tags: ['smart-home', 'automation', 'alexa', 'google-home', 'plug'], price: 799, store_link: 'https://www.amazon.in/s?k=smart+plug+4+pack' },
  { name: 'Fire TV Stick 4K', description: 'Stream Netflix, Prime, Hotstar, YouTube in 4K. Alexa voice remote included. Turns any TV smart.', category: 'Tech', tags: ['streaming', 'tv', 'smart-tv', 'alexa', 'entertainment', 'amazon'], price: 1499, store_link: 'https://www.amazon.in/s?k=fire+tv+stick+4k' },

  // ── Gaming ────────────────────────────────────────────────────────────────
  { name: 'Gaming Mouse', description: 'Lightweight gaming mouse with 6400 DPI sensor, programmable buttons, and RGB lighting.', category: 'Gaming', tags: ['mouse', 'gaming', 'rgb', 'wired', 'fps', 'esports', 'precise'], price: 999, store_link: 'https://www.amazon.in/s?k=gaming+mouse' },
  { name: 'Gaming Headset', description: '7.1 surround sound gaming headset with noise-cancelling mic. Hear every footstep clearly.', category: 'Gaming', tags: ['headset', 'gaming', 'surround-sound', 'microphone', 'fps', 'discord'], price: 1499, store_link: 'https://www.amazon.in/s?k=gaming+headset+surround' },
  { name: 'PS5 Controller', description: 'DualSense wireless controller with haptic feedback and adaptive triggers. Next-gen feel on every game.', category: 'Gaming', tags: ['ps5', 'controller', 'sony', 'gaming', 'console', 'wireless', 'haptic'], price: 5999, store_link: 'https://www.amazon.in/s?k=ps5+dualsense+controller' },
  { name: 'Gaming Chair Cushion', description: 'Memory foam lumbar and seat cushion set for long gaming sessions. Supports posture, reduces back pain.', category: 'Gaming', tags: ['gaming', 'chair', 'cushion', 'ergonomic', 'posture', 'comfort', 'desk'], price: 999, store_link: 'https://www.amazon.in/s?k=gaming+chair+cushion+lumbar' },
  { name: 'Retro Mini Console', description: 'Pre-loaded with 620 classic arcade games. Plug into any TV via HDMI — relive gaming nostalgia.', category: 'Gaming', tags: ['retro', 'arcade', 'nostalgia', 'console', 'classic', 'gaming', 'tv'], price: 799, store_link: 'https://www.amazon.in/s?k=retro+mini+console+arcade' },
  { name: 'Indian Board Games Set', description: 'Classic Indian games — Ludo, Snakes & Ladders, Chess, Carrom. Great for family game nights.', category: 'Gaming', tags: ['board-game', 'indian', 'family', 'ludo', 'chess', 'carrom', 'classic', 'party'], price: 599, store_link: 'https://www.amazon.in/s?k=indian+board+games+set' },
  { name: 'Mousepad XL', description: 'Extended gaming desk mat — covers your entire desk. Stitched edges, non-slip rubber base.', category: 'Gaming', tags: ['mousepad', 'gaming', 'desk', 'mat', 'extended', 'keyboard', 'setup'], price: 699, store_link: 'https://www.amazon.in/s?k=gaming+mousepad+xl+extended' },

  // ── Home ──────────────────────────────────────────────────────────────────
  { name: 'Himalayan Salt Lamp', description: 'Natural pink Himalayan crystal lamp with warm amber glow. Creates a cozy, soothing atmosphere.', category: 'Home', tags: ['lamp', 'cozy', 'ambient', 'natural', 'bedroom', 'wellness', 'decor', 'warm'], price: 499, store_link: 'https://www.amazon.in/s?k=himalayan+salt+lamp' },
  { name: 'Weighted Blanket', description: 'Weighted blanket with removable washable cover. Like a full-body hug that improves sleep quality.', category: 'Home', tags: ['blanket', 'sleep', 'cozy', 'weighted', 'bedroom', 'comfort'], price: 1499, store_link: 'https://www.amazon.in/s?k=weighted+blanket' },
  { name: 'Aromatherapy Diffuser', description: 'Ultrasonic essential oil diffuser with 7-color LED. Fills any room with calming scents for 10 hours.', category: 'Home', tags: ['aromatherapy', 'diffuser', 'essential-oil', 'wellness', 'bedroom', 'cozy', 'relaxation'], price: 599, store_link: 'https://www.amazon.in/s?k=aromatherapy+diffuser' },
  { name: 'Ceramic Plant Pots Set', description: 'Set of 3 minimalist white ceramic pots with bamboo trays. Perfect for succulents and small plants.', category: 'Home', tags: ['plants', 'decor', 'minimalist', 'ceramic', 'succulents', 'indoor', 'home'], price: 599, store_link: 'https://www.amazon.in/s?k=ceramic+plant+pots+set' },
  { name: 'Candle Making Kit', description: 'Everything you need to make 20+ soy wax candles at home. Includes 8 fragrance oils, wicks, and jars.', category: 'Home', tags: ['candle', 'diy', 'craft', 'soy-wax', 'home', 'fragrance', 'hobby'], price: 899, store_link: 'https://www.amazon.in/s?k=candle+making+kit' },
  { name: 'Diwali Decor Set', description: 'Brass diyas, colorful rangoli powder, and string lights. Light up your home for the festival of lights.', category: 'Home', tags: ['diwali', 'decor', 'diya', 'festival', 'lights', 'rangoli', 'indian', 'celebration'], price: 799, store_link: 'https://www.amazon.in/s?k=diwali+decoration+set' },
  { name: 'Brass Pooja Thali', description: 'Handcrafted brass pooja thali set with diya, incense holder, and bell. A thoughtful traditional gift.', category: 'Home', tags: ['pooja', 'brass', 'thali', 'traditional', 'indian', 'religious', 'handcraft', 'decor'], price: 799, store_link: 'https://www.amazon.in/s?k=brass+pooja+thali+set' },
  { name: 'Mini Projector', description: 'Pocket-sized HD projector. Stream up to 100" on any wall — bedroom, backyard, anywhere.', category: 'Home', tags: ['projector', 'movies', 'entertainment', 'bedroom', 'outdoor', 'streaming', 'cozy'], price: 2999, store_link: 'https://www.amazon.in/s?k=mini+projector+portable' },

  // ── Books ─────────────────────────────────────────────────────────────────
  { name: 'Atomic Habits', description: "James Clear's #1 bestseller on building good habits. Practical, science-backed, and life-changing.", category: 'Books', tags: ['habits', 'self-improvement', 'productivity', 'psychology', 'nonfiction', 'bestseller'], price: 299, store_link: 'https://www.amazon.in/s?k=atomic+habits' },
  { name: 'The Alchemist', description: "Paulo Coelho's timeless tale of following your dreams. One of the best-selling books of all time in India.", category: 'Books', tags: ['fiction', 'philosophy', 'dreams', 'journey', 'classic', 'coelho', 'inspiration'], price: 199, store_link: 'https://www.amazon.in/s?k=the+alchemist+paulo+coelho' },
  { name: 'Sapiens', description: "Yuval Noah Harari's sweeping history of humankind. Challenges everything you think you know.", category: 'Books', tags: ['history', 'humanity', 'nonfiction', 'philosophy', 'bestseller', 'science'], price: 299, store_link: 'https://www.amazon.in/s?k=sapiens+harari' },
  { name: 'Deep Work', description: "Cal Newport's guide to focusing without distraction — the superpower of the modern age.", category: 'Books', tags: ['productivity', 'focus', 'self-improvement', 'career', 'nonfiction'], price: 299, store_link: 'https://www.amazon.in/s?k=deep+work+cal+newport' },
  { name: 'The Psychology of Money', description: 'Morgan Housel on wealth, greed, and happiness. The personal finance book that feels like a conversation.', category: 'Books', tags: ['finance', 'money', 'investing', 'psychology', 'nonfiction', 'wealth', 'bestseller'], price: 299, store_link: 'https://www.amazon.in/s?k=psychology+of+money' },
  { name: 'Wings of Fire', description: "Dr. APJ Abdul Kalam's autobiography. An inspiring journey from humble beginnings to becoming India's Missile Man.", category: 'Books', tags: ['biography', 'indian', 'kalam', 'inspiration', 'science', 'aerospace', 'nonfiction'], price: 199, store_link: 'https://www.amazon.in/s?k=wings+of+fire+kalam' },
  { name: 'The Pragmatic Programmer', description: 'The classic software engineering book every developer should read. Timeless advice on elegant code.', category: 'Books', tags: ['programming', 'software', 'career', 'developer', 'coding', 'technical'], price: 499, store_link: 'https://www.amazon.in/s?k=the+pragmatic+programmer' },

  // ── Fashion ───────────────────────────────────────────────────────────────
  { name: 'Fastrack Watch', description: 'Trendy, affordable Fastrack analog watch. Bold dial, comfortable strap — the go-to gift for any age.', category: 'Fashion', tags: ['watch', 'fastrack', 'fashion', 'accessories', 'analog', 'everyday', 'trendy'], price: 1499, store_link: 'https://www.amazon.in/s?k=fastrack+watch' },
  { name: 'Kurti Set', description: 'Elegant printed cotton kurti with palazzo pants. Comfortable, versatile, and perfect for any occasion.', category: 'Fashion', tags: ['kurti', 'indian', 'ethnic', 'fashion', 'cotton', 'traditional', 'women', 'comfortable'], price: 1299, store_link: 'https://www.amazon.in/s?k=kurti+palazzo+set' },
  { name: 'Kolhapuri Chappals', description: 'Handcrafted leather Kolhapuri chappals. A timeless Indian footwear tradition that pairs with anything.', category: 'Fashion', tags: ['chappals', 'kolhapuri', 'leather', 'handcraft', 'indian', 'footwear', 'traditional'], price: 799, store_link: 'https://www.amazon.in/s?k=kolhapuri+chappals' },
  { name: 'Canvas Tote Bag', description: 'Heavy-duty canvas tote. Takes your aesthetic from grocery run to effortlessly put-together.', category: 'Fashion', tags: ['tote', 'canvas', 'bag', 'everyday', 'sustainable', 'minimal', 'fashion'], price: 399, store_link: 'https://www.amazon.in/s?k=canvas+tote+bag' },
  { name: 'Leather Card Wallet', description: 'Slim bifold wallet, genuine leather, holds 8 cards. Gets better with age.', category: 'Fashion', tags: ['wallet', 'leather', 'slim', 'minimalist', 'everyday', 'cards'], price: 799, store_link: 'https://www.amazon.in/s?k=slim+leather+card+wallet' },
  { name: 'Satin Sleep Mask', description: 'Mulberry silk sleep mask. Blocks 100% of light, gentle on skin — wake up actually rested.', category: 'Fashion', tags: ['sleep', 'silk', 'mask', 'wellness', 'bedroom', 'travel', 'beauty'], price: 299, store_link: 'https://www.amazon.in/s?k=silk+sleep+mask' },
  { name: 'Oversized Sunglasses', description: 'UV400 polarized lenses in a retro oversized frame. Makes every outfit look considered.', category: 'Fashion', tags: ['sunglasses', 'fashion', 'retro', 'polarized', 'outdoor', 'summer'], price: 499, store_link: 'https://www.amazon.in/s?k=oversized+polarized+sunglasses' },

  // ── Fitness ───────────────────────────────────────────────────────────────
  { name: 'Resistance Band Set', description: '5-piece resistance band set from light to heavy. Full-body home workouts without a gym.', category: 'Fitness', tags: ['resistance-bands', 'workout', 'home-gym', 'strength', 'portable', 'exercise'], price: 599, store_link: 'https://www.amazon.in/s?k=resistance+band+set' },
  { name: 'Yoga Mat', description: 'Extra-thick 6mm non-slip yoga mat with alignment lines. Eco-friendly TPE material, reversible.', category: 'Fitness', tags: ['yoga', 'mat', 'fitness', 'wellness', 'non-slip', 'stretching', 'pilates'], price: 799, store_link: 'https://www.amazon.in/s?k=yoga+mat+non+slip' },
  { name: 'Cricket Kit (Junior)', description: 'Lightweight cricket bat, ball, stumps, and gloves set. Perfect for neighbourhood matches.', category: 'Fitness', tags: ['cricket', 'indian', 'sport', 'bat', 'ball', 'outdoor', 'junior', 'game'], price: 1999, store_link: 'https://www.amazon.in/s?k=cricket+kit+junior' },
  { name: 'Jump Rope', description: 'Adjustable weighted jump rope. Burns 3x the calories of jogging at the same intensity.', category: 'Fitness', tags: ['jump-rope', 'cardio', 'fitness', 'workout', 'home-gym', 'hiit'], price: 399, store_link: 'https://www.amazon.in/s?k=weighted+jump+rope' },
  { name: 'Foam Roller', description: 'High-density foam roller for muscle recovery. Reduce soreness and increase flexibility.', category: 'Fitness', tags: ['foam-roller', 'recovery', 'massage', 'fitness', 'muscles', 'mobility'], price: 599, store_link: 'https://www.amazon.in/s?k=foam+roller' },
  { name: 'Dumbbell Pair 5kg', description: 'Fixed 5kg dumbbell pair with rubber coating. Ideal for home workouts and toning.', category: 'Fitness', tags: ['dumbbell', 'strength', 'home-gym', 'workout', 'weights', 'resistance'], price: 1499, store_link: 'https://www.amazon.in/s?k=dumbbell+pair+5kg' },
  { name: 'Smart Water Bottle', description: 'LED temperature display, glows to remind you to drink. Tracks daily hydration.', category: 'Fitness', tags: ['water-bottle', 'hydration', 'smart', 'wellness', 'fitness', 'health'], price: 699, store_link: 'https://www.amazon.in/s?k=smart+water+bottle' },
  { name: 'Pull-Up Bar', description: 'No-screw doorframe pull-up bar. Supports up to 120 kg, works on most door frames.', category: 'Fitness', tags: ['pull-up', 'home-gym', 'strength', 'doorframe', 'workout', 'upper-body'], price: 599, store_link: 'https://www.amazon.in/s?k=doorframe+pull+up+bar' },

  // ── Food ──────────────────────────────────────────────────────────────────
  { name: 'Premium Chai Kit', description: 'Assam CTC tea, whole spices (cardamom, ginger, cinnamon, cloves), and a clay kulhad set. The perfect chai ritual.', category: 'Food', tags: ['chai', 'tea', 'indian', 'spices', 'morning', 'kitchen', 'kulhad', 'ritual'], price: 599, store_link: 'https://www.amazon.in/s?k=premium+chai+kit' },
  { name: 'Indian Spice Hamper', description: 'Curated set of 10 artisanal Indian spice blends — biryani masala, sambar powder, chaat masala, and more.', category: 'Food', tags: ['spices', 'indian', 'masala', 'cooking', 'biryani', 'gourmet', 'hamper', 'kitchen'], price: 999, store_link: 'https://www.amazon.in/s?k=indian+spice+hamper+gift' },
  { name: 'Biryani Kit', description: 'Everything to cook restaurant-style biryani at home — whole spices, saffron, kewra water, and recipe card.', category: 'Food', tags: ['biryani', 'indian', 'cooking', 'rice', 'spices', 'saffron', 'kitchen', 'recipe'], price: 499, store_link: 'https://www.amazon.in/s?k=biryani+kit+spices' },
  { name: 'Matcha Starter Kit', description: 'Ceremonial grade matcha, bamboo whisk, ceramic bowl. Everything to make perfect matcha at home.', category: 'Food', tags: ['matcha', 'tea', 'japanese', 'morning', 'wellness', 'kitchen', 'ceremony'], price: 799, store_link: 'https://www.amazon.in/s?k=matcha+starter+kit' },
  { name: 'Premium Chocolate Box', description: "Assortment of 24 artisan dark chocolates. The gift that's never wrong.", category: 'Food', tags: ['chocolate', 'premium', 'dark-chocolate', 'foodie', 'gift', 'sweet'], price: 599, store_link: 'https://www.amazon.in/s?k=premium+chocolate+box' },
  { name: 'Pour-Over Coffee Set', description: 'Glass pour-over with a goose-neck kettle. The morning ritual that coffee snobs swear by.', category: 'Food', tags: ['coffee', 'pour-over', 'kitchen', 'morning', 'barista', 'ritual'], price: 1499, store_link: 'https://www.amazon.in/s?k=pour+over+coffee+set' },
  { name: 'Dry Fruit Gift Box', description: 'Assorted premium dry fruits — almonds, cashews, pistachios, walnuts. A classic Indian celebration gift.', category: 'Food', tags: ['dry-fruits', 'indian', 'healthy', 'nuts', 'gift', 'celebration', 'traditional', 'festive'], price: 999, store_link: 'https://www.amazon.in/s?k=premium+dry+fruit+gift+box' },
  { name: 'Pasta Making Kit', description: 'Hand-crank pasta machine with fresh pasta recipe book. Making pasta from scratch is therapeutic.', category: 'Food', tags: ['pasta', 'cooking', 'italian', 'diy', 'kitchen', 'foodie', 'homemade', 'hobby'], price: 1199, store_link: 'https://www.amazon.in/s?k=pasta+making+kit' },

  // ── More Tech ──────────────────────────────────────────────────────────────
  { name: 'Bluetooth Speaker', description: 'Compact 360° wireless speaker with 12hr battery. Waterproof, bass-heavy, pairs in 2 seconds.', category: 'Tech', tags: ['speaker', 'bluetooth', 'wireless', 'music', 'portable', 'outdoor', 'bass'], price: 1299, store_link: 'https://www.amazon.in/s?k=bluetooth+speaker+portable' },
  { name: 'Power Bank 20000mAh', description: 'Never run out of charge. 20000mAh with 65W fast charging — powers your laptop, phone, and earbuds.', category: 'Tech', tags: ['powerbank', 'charging', 'travel', 'portable', 'fast-charge', 'phone', 'laptop'], price: 1799, store_link: 'https://www.amazon.in/s?k=power+bank+20000mah+65w' },
  { name: 'Selfie Ring Light', description: 'LED ring light with phone holder and tripod. Perfect for reels, YouTube, video calls, and makeup.', category: 'Tech', tags: ['ring-light', 'photography', 'selfie', 'youtube', 'reels', 'led', 'content-creation'], price: 799, store_link: 'https://www.amazon.in/s?k=selfie+ring+light+tripod' },
  { name: 'Smart Watch', description: 'Feature-packed smartwatch with health monitoring, SpO2, sleep tracking, and 7-day battery.', category: 'Tech', tags: ['smartwatch', 'fitness', 'health', 'wearable', 'notifications', 'steps', 'sleep'], price: 2499, store_link: 'https://www.amazon.in/s?k=smart+watch+under+3000' },

  // ── More Gaming ────────────────────────────────────────────────────────────
  { name: 'Gaming Keyboard', description: 'Membrane gaming keyboard with rainbow RGB backlight and anti-ghosting. Feels great for every game.', category: 'Gaming', tags: ['keyboard', 'gaming', 'rgb', 'anti-ghosting', 'desk', 'setup'], price: 1299, store_link: 'https://www.amazon.in/s?k=gaming+keyboard+rgb' },
  { name: 'Gaming Controller Stand', description: 'Dual controller stand with USB hub. Keeps your desk clean and controllers charged and ready.', category: 'Gaming', tags: ['gaming', 'controller', 'stand', 'desk', 'organization', 'ps5', 'xbox'], price: 699, store_link: 'https://www.amazon.in/s?k=gaming+controller+stand' },
  { name: 'Playing Cards Set', description: 'Premium waterproof plastic playing cards with 2 decks. Perfect for Teen Patti, Rummy, and Poker nights.', category: 'Gaming', tags: ['cards', 'playing-cards', 'teen-patti', 'rummy', 'poker', 'party', 'game-night'], price: 399, store_link: 'https://www.amazon.in/s?k=premium+playing+cards+waterproof' },

  // ── More Home ──────────────────────────────────────────────────────────────
  { name: 'Bamboo Desk Organiser', description: 'Eco-friendly bamboo desk organiser with pen holder, phone stand, and compartments. Neat and minimal.', category: 'Home', tags: ['desk', 'organiser', 'bamboo', 'eco', 'minimalist', 'stationery', 'office'], price: 599, store_link: 'https://www.amazon.in/s?k=bamboo+desk+organiser' },
  { name: 'Wall Hanging Macrame', description: 'Handwoven cotton macrame wall hanging. Boho aesthetic that instantly elevates any bedroom wall.', category: 'Home', tags: ['macrame', 'wall-art', 'boho', 'handmade', 'bedroom', 'decor', 'cotton'], price: 699, store_link: 'https://www.amazon.in/s?k=macrame+wall+hanging' },
  { name: 'Scented Soy Candles Set', description: 'Set of 4 hand-poured soy wax candles in calming scents — lavender, vanilla, sandalwood, jasmine.', category: 'Home', tags: ['candle', 'soy', 'scented', 'lavender', 'relaxation', 'bedroom', 'gift', 'cozy'], price: 799, store_link: 'https://www.amazon.in/s?k=scented+soy+candles+set' },
  { name: 'Printed Cushion Covers', description: 'Set of 5 vibrant printed cushion covers in Indian motifs. Instantly transforms your sofa.', category: 'Home', tags: ['cushion', 'covers', 'indian', 'printed', 'sofa', 'decor', 'colourful'], price: 499, store_link: 'https://www.amazon.in/s?k=printed+cushion+covers+set' },

  // ── More Books ─────────────────────────────────────────────────────────────
  { name: 'Rich Dad Poor Dad', description: "Robert Kiyosaki's classic on financial literacy. The book that changed how a generation thinks about money.", category: 'Books', tags: ['finance', 'money', 'investing', 'financial-literacy', 'nonfiction', 'classic', 'wealth'], price: 299, store_link: 'https://www.amazon.in/s?k=rich+dad+poor+dad' },
  { name: 'Manto: Selected Stories', description: "Saadat Hasan Manto's razor-sharp Urdu short stories. Raw, unflinching, and deeply human.", category: 'Books', tags: ['fiction', 'indian', 'urdu', 'short-stories', 'literature', 'classic', 'manto'], price: 249, store_link: 'https://www.amazon.in/s?k=manto+selected+stories' },
  { name: 'Zero to One', description: "Peter Thiel's contrarian guide to building the future. Essential reading for anyone with startup ambitions.", category: 'Books', tags: ['startup', 'entrepreneurship', 'business', 'innovation', 'nonfiction', 'tech'], price: 399, store_link: 'https://www.amazon.in/s?k=zero+to+one+peter+thiel' },

  // ── More Fashion ──────────────────────────────────────────────────────────
  { name: 'Ethnic Kurta (Men)', description: 'Cotton straight-cut kurta in a classic block print. Pairs perfectly with jeans or churidar.', category: 'Fashion', tags: ['kurta', 'ethnic', 'men', 'cotton', 'indian', 'traditional', 'block-print', 'casual'], price: 899, store_link: 'https://www.amazon.in/s?k=men+ethnic+kurta+cotton' },
  { name: 'Juttis / Mojaris', description: 'Hand-embroidered Punjabi juttis with cushioned sole. Colourful, comfortable, and completely unique.', category: 'Fashion', tags: ['juttis', 'mojaris', 'punjabi', 'embroidered', 'indian', 'footwear', 'handmade', 'colourful'], price: 899, store_link: 'https://www.amazon.in/s?k=punjabi+juttis+women' },
  { name: 'Imitation Jewellery Set', description: 'Oxidised silver jhumkas and matching necklace set. Statement ethnic jewellery at an everyday price.', category: 'Fashion', tags: ['jewellery', 'jhumkas', 'oxidised', 'ethnic', 'indian', 'accessories', 'necklace', 'earrings'], price: 499, store_link: 'https://www.amazon.in/s?k=oxidised+jhumka+necklace+set' },

  // ── More Fitness ──────────────────────────────────────────────────────────
  { name: 'Badminton Set', description: 'Complete badminton set with 2 rackets, 3 shuttlecocks, and carry bag. Perfect for terrace and park play.', category: 'Fitness', tags: ['badminton', 'sport', 'outdoor', 'racket', 'indian', 'park', 'game'], price: 799, store_link: 'https://www.amazon.in/s?k=badminton+racket+set' },
  { name: 'Skipping Rope LED', description: 'LED skipping rope with digital calorie and jump counter. Glows in the dark for evening workouts.', category: 'Fitness', tags: ['skipping', 'jump-rope', 'led', 'cardio', 'fitness', 'counter', 'workout'], price: 499, store_link: 'https://www.amazon.in/s?k=led+skipping+rope+counter' },

  // ── More Food ──────────────────────────────────────────────────────────────
  { name: 'Makhana Trail Mix', description: 'Roasted fox nuts mixed with dry fruits and seeds. The healthiest snack you can gift someone.', category: 'Food', tags: ['makhana', 'healthy', 'snack', 'indian', 'fox-nuts', 'dry-fruits', 'trail-mix'], price: 499, store_link: 'https://www.amazon.in/s?k=roasted+makhana+trail+mix' },
  { name: 'Pickle Hamper', description: 'Set of 6 homestyle Indian pickles — mango, lemon, garlic, mixed veg. The gift every Indian family loves.', category: 'Food', tags: ['pickle', 'achar', 'indian', 'mango', 'homestyle', 'condiment', 'traditional', 'hamper'], price: 599, store_link: 'https://www.amazon.in/s?k=homestyle+pickle+hamper' },
  { name: 'Protein Bar Box', description: 'Box of 12 assorted high-protein bars. Clean ingredients, great flavours — gym-goers and students love these.', category: 'Food', tags: ['protein', 'fitness', 'snack', 'healthy', 'bars', 'gym', 'energy'], price: 799, store_link: 'https://www.amazon.in/s?k=protein+bars+box+assorted' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Seed runner
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const pb = new PocketBase(PB_URL);
  const isReset = process.argv.includes('--reset');

  console.log(`Connecting to PocketBase at ${PB_URL}...`);
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

  if (isReset) {
    console.log('--reset: deleting all existing gifts...');
    const existing = await pb.collection('gifts').getFullList();
    for (const gift of existing) {
      await pb.collection('gifts').delete(gift.id);
    }
    console.log(`Deleted ${existing.length} gifts.`);
  } else {
    const existing = await pb.collection('gifts').getList(1, 1);
    if (existing.totalItems > 0) {
      console.log(`⚠  ${existing.totalItems} gifts already exist. Pass --reset to replace them.`);
      const answer = await prompt('Add NEW records on top anyway? [y/N] ');
      if (answer.toLowerCase() !== 'y') { process.exit(0); }
    }
  }

  let created = 0, failed = 0;
  for (const gift of GIFTS) {
    try {
      await pb.collection('gifts').create(gift);
      console.log(`  ✓ ${gift.name} ($${gift.price} / ₹${Math.round(gift.price * 84)})`);
      created++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${gift.name}: ${msg}`);
      failed++;
    }
  }

  console.log(`\nDone. Created: ${created}, Failed: ${failed}`);
  console.log(`Price range: $${Math.min(...GIFTS.map(g=>g.price))}–$${Math.max(...GIFTS.map(g=>g.price))} (₹${Math.round(Math.min(...GIFTS.map(g=>g.price))*84)}–₹${Math.round(Math.max(...GIFTS.map(g=>g.price))*84)})`);
}

function prompt(question: string): Promise<string> {
  process.stdout.write(question);
  return new Promise((resolve) => {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.once('data', (data) => {
      process.stdin.pause();
      resolve(String(data).trim());
    });
  });
}

main().catch((err) => {
  console.error('Fatal:', err instanceof Error ? err.message : err);
  process.exit(1);
});
