/* ============================================================
   CHICK BUCK — COMPLETE SCRIPT
   Preserves: Cart, WhatsApp, Products, Branches, i18n
   Adds: Theme system, Settings, Banners, Homepage Builder
   ============================================================ */

// ─── 1. UTILITIES ────────────────────────────────────────────
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => { clearTimeout(timeout); func(...args); };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
function throttle(func, limit = 100) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) { func(...args); inThrottle = true; setTimeout(() => inThrottle = false, limit); }
  };
}

// ─── 2. SUPABASE ─────────────────────────────────────────────
const SB_URL = 'https://fnqzyjwtkhvswczppbqu.supabase.co';
const SB_KEY = 'sb_publishable_rhDvNmXvmdHKVkYH1TumLA_VasvU1Uh';
const db = window.supabase.createClient(SB_URL, SB_KEY);

// ─── 3. STATIC DATA (preserved exactly) ─────────────────────
const DATA = {
  branches: {
    branch1: { name: "Ameerfawaz- ruba Jeddah", nameAr: "أمير فوز - ربوة جدة", phone: "05013-62558", whatsapp: "966501362558" },
    branch2: { name: "AI-Samer- Ajwad",         nameAr: "السامر - أجواد",       phone: "05388-65706", whatsapp: "966538865706" }
  },
  menus: {
    branch1: [
      
      { id: 'b1_p35', cat: 'BROASTED', name: 'Chicken Broast Spicy 4PC', badge: '4 PC', nameAr: 'بروست دجاج حراق', desc: 'Crispy spicy broasted chicken', descAr: 'دجاج بروست مقرمش وحار', price: 18, calories: 1198, rating: 4.9, img: 'IMAGE/chicken-broast-spicy.jpg' },
      { id: 'b1_p36', cat: 'BROASTED', name: 'Chicken Broast 4PC', badge: '4 PC', nameAr: 'بروست دجاج', desc: 'Crispy broasted chicken', descAr: 'دجاج بروست مقرمش', price: 18, calories: 1198, rating: 4.9, img: 'IMAGE/chicken-broast-spicy-2.png' },
      { id: 'b1_p79', cat: 'BROASTED', name: 'Chicken Broast Spicy 2PC', badge: '2 PC', nameAr: 'بروستد دجاج حار قطعتين', desc: 'Crispy spicy broasted chicken, 2 pieces', descAr: 'دجاج بروست مقرمش وحار، قطعتين', price: 11, calories: 1198, rating: 4.9, img: 'IMAGE/chicken-broast-spicy2.png' },
      { id: 'b1_p78', cat: 'BROASTED', name: 'Chicken Broast 2PC', badge: '2 PC', nameAr: 'بروستد دجاج قطعتين', desc: 'Crispy broasted chicken, 2 pieces', descAr: 'دجاج بروست مقرمش، قطعتين', price: 11, calories: 1198, rating: 4.9, img: 'IMAGE/chicken-broast2.png' },
      { id: 'b1_p37', cat: 'BROASTED', name: 'Chicken Nuggets Regular / Spicy', nameAr: 'مسحب دجاج عادي / حراق', desc: 'Crispy chicken nuggets', descAr: 'ناجتس دجاج مقرمش', prices: { Normal: 18, Spicy: 18 }, calories: 868, rating: 4.8, img: 'IMAGE/chicken-nuggets.jpg' },
      { id: 'b1_p38', cat: 'BROASTED', name: 'Fish Fillet Regular / Spicy', nameAr: 'فيليه سمك عادي / حراق', desc: 'Crispy fish fillet', descAr: 'فيليه سمك مقرمش', prices: { Normal: 15, Spicy: 15 }, calories: 870, rating: 4.7, img: 'IMAGE/fish-fillet.jpg' },
      { id: 'b1_p39', cat: 'BROASTED', name: 'Shrimp Broast', nameAr: 'بروست جمبري', desc: 'Crispy broasted shrimp', descAr: 'جمبري بروست مقرمش', price: 24, calories: 1190, rating: 4.9, img: 'IMAGE/shrimp-broast.jpg' },
      { id: 'b1_p40', cat: 'BROASTED', name: 'Chicken Strips', nameAr: 'ستريب دجاج', desc: 'Crispy chicken strips', descAr: 'ستريب دجاج مقرمش', prices: { Normal: 16, Spicy: 16 }, calories: 780, rating: 4.8, img: 'IMAGE/chicken-strips.jpg' },
      { id: 'b1_p41', cat: 'BROASTED', name: 'Chicken Bites', nameAr: 'دجاج بايتس', desc: 'Bite-sized crispy chicken', descAr: 'قطع دجاج صغيرة مقرمشة', price: 12, calories: 690, rating: 4.8, img: 'IMAGE/chicken-bites.jpg' },
      { id: 'b1_p42', cat: 'BROASTED', name: 'Chicken Popcorn (15 Pcs)', nameAr: 'دجاج بوبكورن (15 حبة)', desc: '15 pieces of crispy chicken popcorn', descAr: '15 قطعة من دجاج البوبكورن المقرمش', price: 9, calories: 624, rating: 4.7, img: 'IMAGE/chicken-popcorn.jpg' },
      { id: 'b1_p43', cat: 'LOADED', name: 'Chicken Loaded Fries', nameAr: 'دجاج لودد فرايز', desc: 'Loaded fries topped with crispy chicken', descAr: 'بطاطس محملة بالدجاج المقرمش', price: 15, calories: 824, rating: 4.8, img: 'IMAGE/chicken-loaded-fries.jpg' },
      { id: 'b1_p44', cat: 'LOADED', name: 'Shrimp Loaded Fries', nameAr: 'جمبري لودد فرايز', desc: 'Loaded fries topped with crispy shrimp', descAr: 'بطاطس محملة بالجمبري المقرمش', price: 24, calories: 1060, rating: 4.9, img: 'IMAGE/shrimp-loaded-fries.jpg' },
      { id: 'b1_p45', cat: 'LOADED', name: 'Seasoned Mozzarella Sticks', nameAr: 'أصابع الموزاريلا', desc: 'Crispy seasoned mozzarella sticks', descAr: 'أصابع موزاريلا متبلة ومقرمشة', price: 14, calories: 690, rating: 4.7, img: 'IMAGE/mozzarella-sticks.jpg' },
      { id: 'b1_p57', cats: ['SIDES','MEALS'], name: 'Kids Meal', nameAr: 'وجبة أطفال', desc: 'Special meal for kids', descAr: 'وجبة خاصة للأطفال', price: 16, calories: 690, rating: 4.7, badge: 'KIDS', img: 'IMAGE/kids-meal.jpg' },
      { id: 'b1_p1',  cat: 'SANDWICHES', name: 'Nuggets Sandwich', nameAr: 'ساندويتش ناجتس', desc: 'Crispy chicken nuggets sandwich', descAr: 'ساندويتش ناجتس دجاج مقرمش', prices: { Small: 9, Big: 13 }, calories: 330, rating: 4.7, img: 'IMAGE/nuggets-sandwich.jpg' },
      { id: 'b1_p2',  cats: ['SANDWICHES','MEALS'], name: 'Nuggets Sandwich Meal', nameAr: 'وجبة ساندويتش ناجتس', desc: 'Nuggets sandwich served as a complete meal', descAr: 'ساندويتش ناجتس يقدم كوجبة كاملة', prices: { Small: 15, Big: 19 }, calories: 810, rating: 4.8, img: 'IMAGE/nuggets-sandwich-meal.jpg' },
      { id: 'b1_p3',  cat: 'SANDWICHES', name: 'Tortilla Fish Sandwich', nameAr: 'ساندويتش سمك تورتيلا', desc: 'Crispy fish wrapped in soft tortilla', descAr: 'سمك مقرمش ملفوف في خبز التورتيلا', prices: { Small: 9, Big: 13 }, calories: 620, rating: 4.6, img: 'IMAGE/tortilla-fish-sandwich.jpg' },
      { id: 'b1_p4',  cats: ['SANDWICHES','MEALS'], name: 'Tortilla Fish Sandwich Meal', nameAr: 'وجبة ساندويتش سمك تورتيلا', desc: 'Tortilla fish sandwich served as a meal', descAr: 'ساندويتش سمك تورتيلا يقدم كوجبة', prices: { Small: 15, Big: 19 }, calories: 1100, rating: 4.7, img: 'IMAGE/tortilla-fish-sandwich-meal.jpg' },
      { id: 'b1_p5',  cat: 'SANDWICHES', name: 'Tortilla Shrimp Sandwich', nameAr: 'ساندويتش جمبري تورتيلا', desc: 'Crispy shrimp in soft tortilla bread', descAr: 'جمبري مقرمش في خبز التورتيلا', prices: { Small: 11, Big: 15 }, calories: 620, rating: 4.7, img: 'IMAGE/tortilla-shrimp-sandwich.jpg' },
      { id: 'b1_p6',  cats: ['SANDWICHES','MEALS'], name: 'Tortilla Shrimp Sandwich Meal', nameAr: 'وجبة ساندويتش جمبري تورتيلا', desc: 'Tortilla shrimp sandwich served as a meal', descAr: 'ساندويتش جمبري تورتيلا يقدم كوجبة', prices: { Small: 17, Big: 21 }, calories: 1100, rating: 4.8, img: 'IMAGE/tortilla-shrimp-sandwich-meal.jpg' },
      { id: 'b1_p7',  cat: 'SANDWICHES', name: 'Tortilla Zinger Sandwich', nameAr: 'ساندويتش زينجر تورتيلا', desc: 'Crispy spicy zinger in tortilla bread', descAr: 'زينجر مقرمش وحار في خبز التورتيلا', prices: { Small: 9, Big: 13 }, calories: 580, rating: 4.8, img: 'IMAGE/tortilla-zinger-sandwich.jpg' },
      { id: 'b1_p8',  cats: ['SANDWICHES','MEALS'], name: 'Tortilla Zinger Sandwich Meal', nameAr: 'وجبة ساندويتش زينجر تورتيلا', desc: 'Tortilla zinger sandwich served as a meal', descAr: 'ساندويتش زينجر تورتيلا يقدم كوجبة', prices: { Small: 15, Big: 19 }, calories: 1080, rating: 4.8, img: 'IMAGE/tortilla-zinger-sandwich-meal.jpg' },
      { id: 'b1_p9',  cat: 'SANDWICHES', name: 'Chick Buck Strip Sandwich', nameAr: 'ساندويتش تشيك بك ستريب', desc: 'Crispy chicken strip sandwich', descAr: 'ساندويتش ستريب دجاج مقرمش', prices: { Small: 9, Big: 13 }, calories: 430, rating: 4.8, img: 'IMAGE/chick-buck-strip-sandwich.jpg' },
      { id: 'b1_p10', cats: ['SANDWICHES','MEALS'], name: 'Chick Buck Strip Sandwich Meal', nameAr: 'وجبة ساندويتش تشيك بك ستريب', desc: 'Chicken strip sandwich served as a meal', descAr: 'ساندويتش ستريب دجاج يقدم كوجبة', prices: { Small: 15, Big: 19 }, calories: 850, rating: 4.8, img: 'IMAGE/chick-buck-strip-sandwich-meal.jpg' },
      { id: 'b1_p11', cat: 'SANDWICHES', name: 'CB Jumbo Fish Fillet Sandwich', nameAr: 'ساندويتش سي بي جامبو فيليه سمك', desc: 'Jumbo crispy fish fillet sandwich', descAr: 'ساندويتش فيليه سمك جامبو مقرمش', price: 13, calories: 600, rating: 4.7, img: 'IMAGE/cb-jumbo-fish-fillet-sandwich.jpg' },
      { id: 'b1_p12', cats: ['SANDWICHES','MEALS'], name: 'CB Jumbo Fish Fillet Sandwich Meal', nameAr: 'وجبة ساندويتش سي بي جامبو فيليه سمك', desc: 'Jumbo fish fillet sandwich meal', descAr: 'وجبة ساندويتش فيليه سمك جامبو', price: 19, calories: 1100, rating: 4.8, img: 'IMAGE/cb-jumbo-fish-fillet-sandwich-meal.jpg' },
      { id: 'b1_p13', cat: 'SANDWICHES', name: 'CB Jumbo Shrimp Sandwich', nameAr: 'ساندويتش سي بي جامبو جمبري', desc: 'Jumbo crispy shrimp sandwich', descAr: 'ساندويتش جمبري جامبو مقرمش', price: 15, calories: 800, rating: 4.8, img: 'IMAGE/cb-jumbo-shrimp-sandwich.jpg' },
      { id: 'b1_p14', cats: ['SANDWICHES','MEALS'], name: 'CB Jumbo Shrimp Sandwich Meal', nameAr: 'وجبة ساندويتش سي بي جامبو جمبري', desc: 'Jumbo shrimp sandwich meal', descAr: 'وجبة ساندويتش جمبري جامبو', price: 21, calories: 1280, rating: 4.8, img: 'IMAGE/cb-jumbo-shrimp-sandwich-meal.jpg' },
      { id: 'b1_p15', cat: 'SANDWICHES', name: 'CB Jumbo Zinger Sandwich', nameAr: 'ساندويتش سي بي جامبو زينجر', desc: 'Jumbo crispy zinger sandwich', descAr: 'ساندويتش زينجر جامبو مقرمش', price: 13, calories: 600, rating: 4.8, img: 'IMAGE/cb-jumbo-zinger-sandwich.jpg' },
      { id: 'b1_p16', cats: ['SANDWICHES','MEALS'], name: 'CB Jumbo Zinger Sandwich Meal', nameAr: 'وجبة ساندويتش سي بي جامبو زينجر', desc: 'Jumbo zinger sandwich meal', descAr: 'وجبة ساندويتش زينجر جامبو', price: 19, calories: 1080, rating: 4.8, img: 'IMAGE/cb-jumbo-zinger-sandwich-meal.jpg' },
      { id: 'b1_p17', cat: 'BURGERS', name: 'Chicken Burger', nameAr: 'برجر دجاج', desc: 'Crispy chicken burger with fresh vegetables', descAr: 'برجر دجاج مقرمش مع خضروات طازجة', price: 9, calories: 600, rating: 4.8, img: 'IMAGE/chicken-burger.jpg' },
      { id: 'b1_p18', cats: ['BURGERS','MEALS'], name: 'Chicken Burger Meal', nameAr: 'وجبة برجر دجاج', desc: 'Chicken burger served with fries and drink', descAr: 'برجر دجاج مع البطاطس والمشروب', price: 15, calories: 1080, rating: 4.8, img: 'IMAGE/chicken-burger-meal.jpg' },
      { id: 'b1_p19', cat: 'BURGERS', name: 'Chicken Burger Double', nameAr: 'برجر دجاج دبل', desc: 'Double crispy chicken burger', descAr: 'برجر دجاج دبل مقرمش', price: 14, calories: 800, rating: 4.9, img: 'IMAGE/chicken-burger-double.jpg' },
      { id: 'b1_p20', cats: ['BURGERS','MEALS'], name: 'Chicken Burger Double Meal', nameAr: 'وجبة برجر دجاج دبل', desc: 'Double chicken burger with fries and drink', descAr: 'برجر دجاج دبل مع البطاطس والمشروب', price: 20, calories: 1280, rating: 4.9, img: 'IMAGE/chicken-burger-double-meal.jpg' },
      { id: 'b1_p21', cat: 'BURGERS', name: 'Beef Burger', nameAr: 'برجر لحم', desc: 'Classic beef burger', descAr: 'برجر لحم كلاسيك', price: 9, calories: 635, rating: 4.7, img: 'IMAGE/beef-burger.jpg' },
      { id: 'b1_p22', cats: ['BURGERS','MEALS'], name: 'Beef Burger Meal', nameAr: 'وجبة برجر لحم', desc: 'Beef burger served with fries and drink', descAr: 'برجر لحم مع البطاطس والمشروب', price: 15, calories: 1200, rating: 4.8, img: 'IMAGE/beef-burger-meal.jpg' },
      { id: 'b1_p23', cat: 'BURGERS', name: 'Beef Burger Double', nameAr: 'برجر لحم دبل', desc: 'Double beef patty burger', descAr: 'برجر لحم بقطعتين', price: 15, calories: 825, rating: 4.8, img: 'IMAGE/beef-burger-double.jpg' },
      { id: 'b1_p24', cats: ['BURGERS','MEALS'], name: 'Beef Burger Double Meal', nameAr: 'وجبة برجر لحم دبل', desc: 'Double beef burger with fries and drink', descAr: 'برجر لحم دبل مع البطاطس والمشروب', price: 21, calories: 1400, rating: 4.9, img: 'IMAGE/beef-burger-double-meal.jpg' },
      { id: 'b1_p25', cat: 'BURGERS', name: 'Zinger Burger', nameAr: 'برجر زينجر', desc: 'Crispy spicy zinger burger', descAr: 'برجر زينجر دجاج مقرمش وحار', price: 11, calories: 600, rating: 4.8, img: 'IMAGE/zinger-burger.jpg' },
      { id: 'b1_p26', cats: ['BURGERS','MEALS'], name: 'Zinger Burger Meal', nameAr: 'وجبة برجر زينجر', desc: 'Zinger burger served with fries and drink', descAr: 'برجر زينجر مع البطاطس والمشروب', price: 17, calories: 1200, rating: 4.8, img: 'IMAGE/zinger-burger-meal.jpg' },
      { id: 'b1_p27', cat: 'BURGERS', name: 'Zinger Burger Double', nameAr: 'برجر زينجر دبل', desc: 'Double crispy zinger burger', descAr: 'برجر زينجر دبل مقرمش', price: 16, calories: 800, rating: 4.9, img: 'IMAGE/zinger-burger-double.jpg' },
      { id: 'b1_p28', cats: ['BURGERS','MEALS'], name: 'Zinger Burger Double Meal', nameAr: 'وجبة برجر زينجر دبل', desc: 'Double zinger burger with fries and drink', descAr: 'برجر زينجر دبل مع البطاطس والمشروب', price: 22, calories: 1400, rating: 4.9, img: 'IMAGE/zinger-burger-double-meal.jpg' },
      { id: 'b1_p56', cat: 'BURGERS', name: 'Chick Buck Strip', nameAr: 'تشيك بك ستريب', desc: 'Crispy chicken strip burger', descAr: 'برجر ستريب دجاج مقرمش', price: 9, calories: 430, rating: 4.8, img: 'IMAGE/chick-buck-strip.jpg' },
      { id: 'b1_p55', cats: ['BURGERS','MEALS'], name: 'Chick Buck Strip Meal', nameAr: 'وجبة تشيك بك ستريب', desc: 'Chicken strip burger served with fries and drink', descAr: 'برجر ستريب دجاج مع البطاطس والمشروب', price: 15, calories: 850, rating: 4.8, img: 'IMAGE/chick-buck-strip-meal.jpg' },
      { id: 'b1_p29', cat: 'BURGERS', name: 'Chick Buck Strip Double', nameAr: 'تشيك بك دبل ستريب', desc: 'Double chicken strip burger', descAr: 'برجر ستريب دجاج دبل', price: 14, calories: 600, rating: 4.8, img: 'IMAGE/chick-buck-strip-double.jpg' },
      { id: 'b1_p30', cats: ['BURGERS','MEALS'], name: 'Chick Buck Strip Double Meal', nameAr: 'وجبة تشيك بك دبل ستريب', desc: 'Double strip burger with fries and drink', descAr: 'دبل ستريب مع البطاطس والمشروب', price: 20, calories: 1080, rating: 4.8, img: 'IMAGE/chick-buck-strip-double-meal.jpg' },
      { id: 'b1_p31', cat: 'BURGERS', name: 'Chicken Burger Normal', nameAr: 'برجر دجاج عادي', desc: 'Classic chicken burger', descAr: 'برجر دجاج كلاسيك', price: 6, calories: 315, rating: 4.7, img: 'IMAGE/chicken-burger-normal.jpg' },
      { id: 'b1_p32', cat: 'BURGERS', name: 'Shrimp Burger', nameAr: 'برجر جمبري', desc: 'Crispy shrimp burger', descAr: 'برجر جمبري مقرمش', price: 12, calories: 630, rating: 4.8, img: 'IMAGE/shrimp-burger.jpg' },
      { id: 'b1_p33', cat: 'BURGERS', name: 'Fish Burger', nameAr: 'برجر سمك', desc: 'Crispy fish burger', descAr: 'برجر سمك مقرمش', price: 11, calories: 450, rating: 4.7, img: 'IMAGE/fish-burger.jpg' },
      { id: 'b1_p34', cats: ['BURGERS','MEALS'], name: 'Fish Burger Meal', nameAr: 'وجبة برجر سمك', desc: 'Fish burger served with fries and drink', descAr: 'برجر سمك مع البطاطس والمشروب', price: 17, calories: 930, rating: 4.8, img: 'IMAGE/fish-burger-meal.jpg' },
      { id: 'b1_p46', cat: 'CLUBS', name: 'Fish Club', nameAr: 'كلوب السمك', desc: 'Crispy fish club sandwich', descAr: 'ساندويتش فيش كلوب مقرمش', price: 18, calories: 760, rating: 4.8, img: 'IMAGE/fish-club.jpg' },
      { id: 'b1_p47', cat: 'CLUBS', name: 'Zinger Club', nameAr: 'زينجر كلوب', desc: 'Crispy zinger club sandwich', descAr: 'ساندويتش زينجر كلوب مقرمش', price: 14, calories: 680, rating: 4.8, img: 'IMAGE/zinger-club.jpg' },
      { id: 'b1_p48', cat: 'SIDES', name: 'Onion Ring', nameAr: 'حلقات بصل', desc: 'Crispy onion rings with sauce', descAr: 'حلقات بصل مقرمشة مع الصوص', price: 7, calories: 875, rating: 4.6, img: 'IMAGE/onion-ring.jpg' },
      { id: 'b1_p49', cat: 'SIDES', name: 'Twister', nameAr: 'تويستر', desc: 'Crispy twisted side with sauce', descAr: 'طبق تويستر مقرمش مع الصوص', price: 8, calories: 875, rating: 4.6, img: 'IMAGE/twister.jpg' },
      { id: 'b1_p50', cat: 'SIDES', name: 'Garlic Sauce', nameAr: 'صوص ثوم', desc: 'Creamy garlic dipping sauce', descAr: 'صوص ثوم كريمي', price: 1, calories: 92, rating: 4.5, img: 'IMAGE/garlic-sauce.jpeg' },
      { id: 'b1_p51', cat: 'SIDES', name: 'Sauce Cocktails', nameAr: 'صوص كوكتيل', desc: 'Creamy cocktail dipping sauce', descAr: 'صوص كوكتيل كريمي', price: 1, calories: 178, rating: 4.5, img: 'IMAGE/sauce-cocktails.jpeg' },
      { id: 'b1_p63', cat: 'SIDES', name: 'Cheese Sauce', nameAr: 'صوص الجبن', desc: 'Creamy and delicious cheese sauce', descAr: 'صوص جبن كريمي ولذيذ', price: 2, calories: 100, rating: 4.5, img: 'IMAGE/cheese-sauce.jpeg' },
      { id: 'b1_p52', cat: 'SIDES', name: 'French Fries', nameAr: 'بطاطس مقلية', desc: 'Crispy golden french fries', descAr: 'بطاطس مقلية ذهبية ومقرمشة', prices: { Small: 6, Medium: 12 }, calories: 330, rating: 4.7, img: 'IMAGE/french-fries.jpg' },
      { id: 'b1_p53', cat: 'SIDES', name: 'Coleslaw Salad', nameAr: 'سلطة ملفوف', desc: 'Fresh creamy coleslaw salad', descAr: 'سلطة ملفوف كريمية طازجة', price: 4, calories: 220, rating: 4.5, img: 'IMAGE/coleslaw.jpg' },
      { id: 'b1_p54', cat: 'SIDES', name: 'Humus', nameAr: 'حمص', desc: 'Creamy hummus dip', descAr: 'حمص كريمي', price: 4, calories: 124, rating: 4.5, img: 'IMAGE/humus.jpg' },
      { id: 'drink_p1',  cat: 'COLD DRINKS', name: 'Pepsi Can 320ML', badge: '320ML', nameAr: 'بيبسي', desc: 'Refreshing Pepsi soft drink', descAr: 'مشروب بيبسي غازي ومنعش', price: 2.5, rating: 4.7, img: 'IMAGE/pepsi-320ml.jpg' },
      { id: 'drink_p2',  cat: 'COLD DRINKS', name: 'Mirinda Orange Can 320ML', badge: '320ML', nameAr: 'ميرندا برتقال', desc: 'Refreshing orange flavored soft drink', descAr: 'مشروب غازي منعش بنكهة البرتقال', price: 2.5, rating: 4.6, img: 'IMAGE/mirinda-orange-320ml.jpg' },
      { id: 'drink_p3',  cat: 'COLD DRINKS', name: '7UP Can 320ML', badge: '320ML', nameAr: 'سفن أب', desc: 'Refreshing lemon and lime flavored soft drink', descAr: 'مشروب غازي منعش بنكهة الليمون واللايم', price: 2.5, rating: 4.6, img: 'IMAGE/7up-320ml.jpg' },
      { id: 'drink_p4',  cat: 'COLD DRINKS', name: 'Mountain Dew Can 320ML', badge: '320ML', nameAr: 'ماونتن ديو', desc: 'Bold and refreshing citrus soft drink', descAr: 'مشروب غازي منعش بنكهة الحمضيات', price: 2.5, rating: 4.7, img: 'IMAGE/mountain-dew-320ml.jpg' },
      { id: 'drink_p5',  cat: 'COLD DRINKS', name: 'Mirinda Citrus Can 320ML', badge: '320ML', nameAr: 'ميرندا حمضيات', desc: 'Refreshing citrus flavored soft drink', descAr: 'مشروب غازي منعش بنكهة الحمضيات', price: 2.5, rating: 4.6, img: 'IMAGE/mirinda-citrus-320ml.jpg' },
      { id: 'b1_p64',   cat: 'COLD DRINKS', name: 'Pepsi Diet Can 320ML', badge: '320ML', nameAr: 'بيبسي دايت', desc: 'Refreshing Pepsi cola with zero sugar', descAr: 'مشروب بيبسي غازي منعش خالي من السكر', price: 2, calories: 0, rating: 4.5, img: 'IMAGE/pepsi-diet.png' },
      { id: 'b1_p65',   cat: 'COLD DRINKS', name: '7UP Zero Sugar Can 320ML', badge: '320ML', nameAr: 'سفن أب زيرو سكر', desc: 'Refreshing lemon and lime drink with zero sugar', descAr: 'مشروب ليمون وليم خالي من السكر ومنعش', price: 2, calories: 0, rating: 4.5, img: 'IMAGE/7up-zero-sugar.png' },
      { id: 'drink_p6',  cat: 'COLD DRINKS', name: 'Pepsi Can 240ML', badge: '240ML', nameAr: 'علبة بيبسي', desc: 'Refreshing Pepsi soft drink in a 240ml can', descAr: 'مشروب بيبسي غازي ومنعش في علبة 240 مل', price: 2, rating: 4.7, img: 'IMAGE/pepsi-can-240ml.jpg' },
      { id: 'drink_p7',  cat: 'COLD DRINKS', name: 'Mirinda Orange Can 240ML', badge: '240ML', nameAr: 'علبة ميرندا برتقال', desc: 'Refreshing orange flavored soft drink in a 240ml can', descAr: 'مشروب غازي منعش بنكهة البرتقال في علبة 240 مل', price: 2, rating: 4.6, img: 'IMAGE/mirinda-orange-can-240ml.jpg' },
      { id: 'drink_p8',  cat: 'COLD DRINKS', name: '7UP Can 240ML', badge: '240ML', nameAr: 'علبة سفن أب', desc: 'Refreshing lemon and lime flavored drink in a 240ml can', descAr: 'مشروب منعش بنكهة الليمون واللايم في علبة 240 مل', price: 2, rating: 4.6, img: 'IMAGE/7up-can-240ml.jpg' },
      { id: 'drink_p9',  cat: 'COLD DRINKS', name: 'Mountain Dew Can 240ML', badge: '240ML', nameAr: 'علبة ماونتن ديو', desc: 'Bold and refreshing Mountain Dew in a 240ml can', descAr: 'مشروب ماونتن ديو منعش في علبة 240 مل', price: 2, rating: 4.7, img: 'IMAGE/mountain-dew-can-240ml.jpg' },
      { id: 'drink_p10', cat: 'COLD DRINKS', name: 'Mirinda Citrus Can 240ML', badge: '240ML', nameAr: 'علبة ميرندا حمضيات', desc: 'Refreshing citrus flavored drink in a 240ml can', descAr: 'مشروب منعش بنكهة الحمضيات في علبة 240 مل', price: 2, rating: 4.6, img: 'IMAGE/mirinda-citrus-can-240ml.jpg' },
      { id: 'drink_p11', cat: 'COLD DRINKS', name: 'Hopp Apple Drink', nameAr: 'مشروب هوب تفاح', desc: 'Refreshing apple flavored drink', descAr: 'مشروب منعش بنكهة التفاح', price: 2, rating: 4.5, img: 'IMAGE/hopp-apple-drink.jpg' },
      { id: 'b1_p61',   cat: 'COLD DRINKS', name: 'Hopp Orange Drink', nameAr: 'هوب مشروب برتقال', desc: 'Refreshing orange fruit drink', descAr: 'مشروب فواكه بالبرتقال ومنعش', price: 2, calories: 0, rating: 4.5, img: 'IMAGE/hopp-orange-drink.png' },
      { id: 'drink_p12', cat: 'COLD DRINKS', name: 'Pepsi 1 Liter', badge: '1L', nameAr: 'بيبسي 1 لتر', desc: 'Refreshing Pepsi soft drink in a 1 liter bottle', descAr: 'مشروب بيبسي غازي ومنعش في زجاجة 1 لتر', price: 5, rating: 4.7, img: 'IMAGE/pepsi-1-liter.jpg' },
      { id: 'drink_p13', cat: 'COLD DRINKS', name: 'Mirinda 1 Liter', badge: '1L', nameAr: 'ميرندا 1 لتر', desc: 'Refreshing Mirinda soft drink in a 1 liter bottle', descAr: 'مشروب ميرندا غازي ومنعش في زجاجة 1 لتر', price: 5, rating: 4.6, img: 'IMAGE/mirinda-1-liter.jpg' }
    ],
    branch2: [
    ]
  }
};

// Populate branch2 from branch1 (same structure, slightly different prices as before)
DATA.menus.branch2 = DATA.menus.branch1.map(p => ({...p}));

// ─── 4. CATEGORY DEFINITIONS ────────────────────────────────
const CATEGORY_META = {
  'BROASTED':    { icon: '🍗', label: 'Broasted',    labelAr: 'بروست' },
  'SANDWICHES':  { icon: '🥙', label: 'Sandwiches',  labelAr: 'ساندويتشات' },
  'BURGERS':     { icon: '🍔', label: 'Burgers',     labelAr: 'برجر' },
  'MEALS':       { icon: '🍱', label: 'Meals',       labelAr: 'وجبات' },
  'LOADED':      { icon: '🍟', label: 'Loaded',      labelAr: 'لودد' },
  'CLUBS':       { icon: '🥪', label: 'Clubs',       labelAr: 'كلوب' },
  'SIDES':       { icon: '🫙', label: 'Sides',       labelAr: 'إضافات' },
  'COLD DRINKS': { icon: '🥤', label: 'Cold Drinks', labelAr: 'مشروبات' }
};

// ─── 5. i18n ────────────────────────────────────────────────
const I18N = {
  en: {
    welcome: 'WELCOME TO', tagline: 'Fresh chicken made for every craving.',
    orderNow: 'ORDER NOW', exploreMenu: 'EXPLORE MENU',
    ourBranches: 'Find Us', chooseBranch: 'Choose your nearest branch to order',
    viewMenu: 'VIEW MENU',
    yourCart: 'Your Cart', items: 'items', viewCart: 'View Cart',
    orderingFrom: 'Ordering from', searchMenu: 'Search the menu...',
    catAll: 'All', catBroasted: 'Broasted', catSandwiches: 'Sandwiches',
    catBurgers: 'Burgers', catSides: 'Sides & Drinks', catMeals: 'Meals',
    catColddrinks: 'Cold Drinks', catLoaded: 'Loaded', catClubs: 'Clubs',
    showing: 'Showing', of: 'of',
    placeOrder: 'Place Order', addToCart: 'Add to Cart', chooseSize: 'Choose Size',
    yourOrder: 'Your Order', cartEmpty: 'Your cart is empty',
    total: 'Total', yourName: 'Your Name', phone: 'Phone',
    notes: 'Notes (optional)', sendWhatsApp: 'Send Order via WhatsApp',
    orderType: 'Order Type', parcel: 'Parcel (Pickup)', delivery: 'Delivery',
    buildingName: 'Building / Flat Name', floor: 'Floor', roomNumber: 'Room / Unit',
    quickLinks: 'Quick Links', contact: 'Contact', hours: 'Hours',
    menu: 'Menu', bestSellers: 'Best Sellers', specialOffers: 'Special Offers',
    orderBranch: 'Order from this branch'
  },
  ar: {
    welcome: 'مرحباً بك في', tagline: 'المذاق الفريد للمملكة العربية السعودية',
    orderNow: 'اطلب الآن', exploreMenu: 'استكشف القائمة',
    ourBranches: 'فروعنا', chooseBranch: 'اختر أقرب فرع لك للطلب',
    viewMenu: 'عرض القائمة',
    yourCart: 'سلة التسوق', items: 'عناصر', viewCart: 'عرض السلة',
    orderingFrom: 'الطلب من', searchMenu: 'ابحث في القائمة...',
    catAll: 'الكل', catMeals: 'وجبات', catColddrinks: 'المشروبات الباردة',
    catBroasted: 'بروست', catSandwiches: 'ساندويتشات',
    catBurgers: 'برجر', catSides: 'إضافات ومشروبات', catLoaded: 'محمّل', catClubs: 'كلوب',
    showing: 'عرض', of: 'من',
    placeOrder: 'إتمام الطلب', addToCart: 'أضف للسلة', chooseSize: 'اختر الحجم',
    yourOrder: 'طلبك', cartEmpty: 'سلتك فارغة',
    total: 'المجموع', yourName: 'الاسم', phone: 'رقم الجوال',
    notes: 'ملاحظات (اختياري)', sendWhatsApp: 'إرسال عبر واتساب',
    orderType: 'نوع الطلب', parcel: 'استلام من الفرع', delivery: 'توصيل',
    buildingName: 'اسم المبنى / الشقة', floor: 'الدور', roomNumber: 'الغرفة / الوحدة',
    quickLinks: 'روابط سريعة', contact: 'تواصل معنا', hours: 'أوقات العمل',
    menu: 'القائمة', bestSellers: 'الأكثر مبيعاً', specialOffers: 'عروض خاصة',
    orderBranch: 'اطلب من هذا الفرع'
  }
};

// ─── 6. STATE ────────────────────────────────────────────────
const state = {
  lang: localStorage.getItem('cb_lang') || 'en',
  branch: null,
  currentProducts: [],
  cart: JSON.parse(localStorage.getItem('cb_cart') || '[]'),
  favorites: JSON.parse(localStorage.getItem('cb_favs') || '[]'),
  activeCat: 'all',
  search: '',
  currentProduct: null,
  currentQty: 1,
  currentSize: null,
  orderType: 'parcel',
  settings: null,
  banners: [],
  homepageSections: [],
  bannerCurrentIndex: 0,
  bannerTimer: null
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
function t(key) { return I18N[state.lang][key] || key; }
function saveState() {
  localStorage.setItem('cb_cart', JSON.stringify(state.cart));
  localStorage.setItem('cb_favs', JSON.stringify(state.favorites));
  localStorage.setItem('cb_lang', state.lang);
}
function getProductPrice(p, size) {
  if (!p) return 0;
  if (p.prices && typeof p.prices === 'object') {
    if (size && p.prices[size]) return p.prices[size];
    const firstSize = Object.keys(p.prices)[0];
    return firstSize ? p.prices[firstSize] : 0;
  }
  return p.price || 0;
}
function formatPrice(p) {
  if (p === null || p === undefined || isNaN(p)) return '0.00';
  return parseFloat(p).toFixed(2);
}

// ─── 7. THEME SYSTEM ─────────────────────────────────────────
function applyTheme(settings) {
  if (!settings) return;
  const vars = [
    ['--primary',       settings.theme_primary],
    ['--secondary',     settings.theme_secondary],
    ['--accent',        settings.theme_accent],
    ['--background',    settings.theme_background],
    ['--surface',       settings.theme_surface],
    ['--text',          settings.theme_text],
    ['--heading',       settings.theme_heading],
    ['--button',        settings.theme_button],
    ['--button-text',   settings.theme_button_text],
    ['--header-bg',     settings.theme_header],
    ['--footer-bg',     settings.theme_footer],
    ['--border',        settings.theme_border],
    ['--success',       settings.theme_success],
    ['--warning',       settings.theme_warning],
    ['--error',         settings.theme_error],
  ].filter(([, v]) => v);

  const css = ':root{' + vars.map(([k, v]) => `${k}:${v}`).join(';') + '}';
  const styleEl = document.getElementById('themeStyle');
  if (styleEl) styleEl.textContent = css;

  // Also update theme-color meta
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme && settings.theme_primary) metaTheme.setAttribute('content', settings.theme_primary);
}

// ─── 8. LOAD SITE SETTINGS ───────────────────────────────────
async function loadSiteSettings() {
  let settings = null;
  try {
    const { data, error } = await db.from('site_settings').select('*').eq('id', 'global').single();
    if (!error && data) {
      settings = data;
      localStorage.setItem('cb_site_settings', JSON.stringify(data));
    }
  } catch(e) {
    console.warn('site_settings not loaded from DB:', e.message);
  }

  if (!settings) {
    const cached = localStorage.getItem('cb_site_settings');
    if (cached) try { settings = JSON.parse(cached); } catch(e){}
  }

  if (settings) {
    state.settings = settings;
    applyTheme(settings);
    applySiteSettings(settings);
  }
}

function applySiteSettings(s) {
  if (!s) return;
  // Title
  if (s.site_name) {
    document.title = `${s.site_name} — ${s.brand_desc || 'The Unique Taste Of Saudi Arabia'}`;
    const titleEl = document.getElementById('siteTitle');
    if (titleEl) titleEl.textContent = document.title;
  }
  // Favicon
  if (s.favicon_url) {
    const favicon = document.getElementById('siteFavicon');
    if (favicon) favicon.href = s.favicon_url;
  }
  // Logo
  const logoEls = ['headerLogoImg', 'heroLogo', 'menuLogoImg', 'footerLogoImg'];
  logoEls.forEach(id => {
    const el = document.getElementById(id);
    if (el && s.logo_url) el.src = s.logo_url;
  });
  // Footer
  if (s.footer_desc) {
    const fd = document.getElementById('footerBrandDesc');
    if (fd) fd.textContent = s.footer_desc;
  }
  if (s.footer_copy) {
    const fc = document.getElementById('footerCopy');
    if (fc) fc.textContent = s.footer_copy;
  }
  if (s.site_name) {
    const fb = document.getElementById('footerBrandName');
    if (fb) fb.textContent = s.site_name.toUpperCase();
  }
  // Contact
  if (s.phone) { const el = document.getElementById('footerPhone'); if(el) el.textContent = s.phone; }
  if (s.email) { const el = document.getElementById('footerEmail'); if(el) el.textContent = s.email; }
  if (s.address) { const el = document.getElementById('footerAddress'); if(el) el.textContent = s.address; }
  if (s.business_hours) { const el = document.getElementById('footerHours'); if(el) el.textContent = s.business_hours; }
  if (s.delivery_info) { const el = document.getElementById('footerDelivery'); if(el) el.textContent = s.delivery_info; }
  // Social links
  if (s.instagram) { const el = document.getElementById('footerInstagram'); if(el) el.href = s.instagram; }
  if (s.facebook)  { const el = document.getElementById('footerFacebook');  if(el) el.href = s.facebook; }
  if (s.tiktok)    { const el = document.getElementById('footerTiktok');    if(el) el.href = s.tiktok; }
  if (s.snapchat)  { const el = document.getElementById('footerSnapchat');  if(el) el.href = s.snapchat; }

  // Announcement bar
  renderAnnouncementBar(s);
}

// ─── 9. ANNOUNCEMENT BAR ─────────────────────────────────────
function renderAnnouncementBar(s) {
  const bar = document.getElementById('announcementBar');
  if (!bar) return;
  if (!s || !s.announcement_enabled) { bar.classList.add('hidden'); return; }
  const now = new Date();
  if (s.announcement_start && new Date(s.announcement_start) > now) { bar.classList.add('hidden'); return; }
  if (s.announcement_end   && new Date(s.announcement_end)   < now) { bar.classList.add('hidden'); return; }

  bar.style.background = s.announcement_bg || 'var(--primary)';
  bar.style.color       = s.announcement_color || '#ffffff';
  bar.textContent = s.announcement_text || '';
  if (s.announcement_link) {
    bar.innerHTML = `<a href="${s.announcement_link}" style="color:inherit">${s.announcement_text}</a>`;
  }
  bar.classList.remove('hidden');
}

// ─── 10. LOAD BANNERS ────────────────────────────────────────
async function loadBanners() {
  let banners = [];
  try {
    const { data, error } = await db.from('banners')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (!error && data && data.length > 0) {
      banners = data;
      localStorage.setItem('cb_banners', JSON.stringify(data));
    }
  } catch(e) {
    console.warn('Could not load banners from DB:', e.message);
  }

  if (banners.length === 0) {
    const cached = localStorage.getItem('cb_banners');
    if (cached) try { banners = JSON.parse(cached); } catch(e){}
  }

  state.banners = (banners || []).filter(b => {
    if (b.start_date && new Date(b.start_date) > new Date()) return false;
    if (b.end_date   && new Date(b.end_date)   < new Date()) return false;
    return true;
  });
}

// ─── 11. LOAD HOMEPAGE SECTIONS ──────────────────────────────
async function loadHomepageSections() {
  let sections = [];
  try {
    const { data, error } = await db.from('homepage_sections')
      .select('*')
      .order('display_order', { ascending: true });
    if (!error && data && data.length > 0) {
      sections = data;
      localStorage.setItem('cb_homepage_sections', JSON.stringify(data));
    }
  } catch(e) {
    console.warn('Could not load homepage sections from DB:', e.message);
  }

  if (sections.length === 0) {
    const cached = localStorage.getItem('cb_homepage_sections');
    if (cached) try { sections = JSON.parse(cached); } catch(e){}
  }

  state.homepageSections = (sections && sections.length > 0) ? sections : getDefaultSections();
}

// ─── 11B. LOAD DYNAMIC PRODUCTS ──────────────────────────────
async function loadProductsFromDB() {
  let dbProducts = [];
  try {
    const { data, error } = await db.from('products').select('*');
    if (!error && data && data.length > 0) {
      dbProducts = data;
      localStorage.setItem('cb_custom_products', JSON.stringify(data));
    }
  } catch(e) {
    console.warn('Could not load dynamic products from DB:', e.message);
  }

  if (dbProducts.length === 0) {
    const cached = localStorage.getItem('cb_custom_products');
    if (cached) try { dbProducts = JSON.parse(cached); } catch(e){}
  }

  if (dbProducts.length > 0) {
    dbProducts.forEach(p => {
      const branches = p.branch_id === 'all' ? ['branch1', 'branch2'] : [p.branch_id || 'branch1'];
      branches.forEach(bKey => {
        if (!DATA.menus[bKey]) DATA.menus[bKey] = [];
        const formatted = {
          id: p.id,
          cat: p.cat || 'BROASTED',
          cats: p.cats || (p.cat ? [p.cat] : ['BROASTED']),
          name: p.name,
          nameAr: p.name_ar || p.name,
          desc: p.description || '',
          descAr: p.description_ar || p.description || '',
          price: p.price,
          prices: p.prices,
          calories: p.calories,
          rating: p.rating || 4.8,
          badge: p.badge,
          img: p.img || 'IMAGE/chicken-broast-spicy.jpg'
        };
        const idx = DATA.menus[bKey].findIndex(item => item.id === p.id);
        if (idx >= 0) DATA.menus[bKey][idx] = { ...DATA.menus[bKey][idx], ...formatted };
        else DATA.menus[bKey].unshift(formatted);
      });
    });
  }
}

function getDefaultSections() {
  return [
    { id: 'hero',        is_enabled: true, display_order: 1,  config: {} },
    { id: 'banners',     is_enabled: true, display_order: 2,  config: { autoplay: true, interval: 5000 } },
    { id: 'categories',  is_enabled: true, display_order: 3,  config: {} },
    { id: 'bestsellers', is_enabled: true, display_order: 4,  config: { title: 'Best Sellers' } },
    { id: 'offers',      is_enabled: true, display_order: 5,  config: { title: 'Special Offers' } },
    { id: 'combos',      is_enabled: true, display_order: 6,  config: {} },
    { id: 'promo',       is_enabled: true, display_order: 7,  config: {} },
    { id: 'reviews',     is_enabled: true, display_order: 8,  config: {} },
    { id: 'branches',    is_enabled: true, display_order: 9,  config: {} },
    { id: 'cta',         is_enabled: true, display_order: 10, config: {} },
    { id: 'footer',      is_enabled: true, display_order: 11, config: {} }
  ];
}

// ─── 12. RENDER HOMEPAGE ─────────────────────────────────────
function renderHomepage() {
  const container = document.getElementById('homepageSections');
  if (!container) return;
  container.innerHTML = '';

  const sections = state.homepageSections.filter(s => s.is_enabled);
  const allMenuProducts = Object.values(DATA.menus).flat();

  sections.forEach(section => {
    let html = '';
    switch(section.id) {
      case 'hero':        html = renderHeroSection(section.config); break;
      case 'banners':     html = renderBannersSection(section.config); break;
      case 'categories':  html = renderCategoriesSection(section.config); break;
      case 'bestsellers': html = renderProductsSection('bestsellers', section.config, allMenuProducts); break;
      case 'offers':      html = renderProductsSection('offers', section.config, allMenuProducts); break;
      case 'combos':      html = renderProductsSection('combos', section.config, allMenuProducts); break;
      case 'featured':    html = renderProductsSection('featured', section.config, allMenuProducts); break;
      case 'promo':       html = renderPromoSection(section.config); break;
      case 'reviews':     html = renderReviewsSection(section.config); break;
      case 'branches':    html = renderBranchesSectionHTML(section.config); break;
      case 'cta':         html = renderCTASection(section.config); break;
      case 'footer':      html = renderFooterSectionHTML(section.config); break;
    }
    if (html) {
      const div = document.createElement('div');
      div.innerHTML = html;
      container.appendChild(div.firstElementChild);
    }
  });

  // Populate dynamic sub-content & site settings
  renderBranchesSection();
  if (state.settings) applySiteSettings(state.settings);

  // Init carousel after rendering
  initBannerCarousel();
  // Trigger scroll animations
  initScrollReveal();
}

// ─── 13. SECTION RENDERERS ───────────────────────────────────
function renderHeroSection(config) {
  const lang = state.lang;
  return `
  <section class="hero-section" id="heroSection" data-section="hero">
    <div class="hero-bg-image" id="heroBgImage"></div>

    <!-- Header inside hero -->
    <header class="site-header" id="siteHeader">
      <div class="header-logo">
        <img src="assets/chickbuck-logo.png" alt="Chick Buck" id="headerLogoImg" onerror="this.style.display='none'">
      </div>
      <div class="header-actions">
        <button class="lang-toggle" id="langToggle" onclick="toggleLanguage()" aria-label="Toggle language">
          <span class="lang-en">عربي</span>
          <span class="lang-ar">EN</span>
        </button>
      </div>
    </header>

    <div class="hero-content" id="heroContent">
      <p class="hero-eyebrow" id="heroEyebrow" data-i18n="welcome">${t('welcome')}</p>

      <img src="assets/chickbuck-logo.png" alt="Chick Buck" class="hero-logo" id="heroLogo"
           onerror="this.style.display='none'">

      <h1 class="hero-title" id="heroTitle">
        <span>CRISPY. JUICY.</span>
        <span class="highlight" id="heroHighlight">IRRESISTIBLE.</span>
      </h1>

      <p class="hero-subtitle" id="heroSubtitle" data-i18n="tagline">
        ${t('tagline')}
      </p>

      <div class="hero-actions" id="heroActions">
        <button class="btn-hero-primary" id="heroOrderBtn" onclick="scrollToBranches()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/>
          </svg>
          <span data-i18n="orderNow">${t('orderNow')}</span>
        </button>
        <button class="btn-hero-secondary" onclick="scrollToSection('categoriesSection')">
          <span data-i18n="exploreMenu">${t('exploreMenu')}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Scroll hint -->
    <div class="hero-scroll-hint" aria-hidden="true">
      <span>SCROLL</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M12 5v14M5 12l7 7 7-7"/>
      </svg>
    </div>
  </section>`;
}

function renderBranchesSectionHTML(config) {
  return `
  <section class="branches-section" id="branchesSection" data-section="branches">
    <div style="max-width: var(--max-width); margin: 0 auto;">
      <div class="section-header reveal">
        <p class="section-eyebrow" id="branchesEyebrow">Our Locations</p>
        <h2 class="section-title" id="branchesTitle" data-i18n="ourBranches">${t('ourBranches')}</h2>
        <p class="section-subtitle" id="branchesSubtitle" data-i18n="chooseBranch">${t('chooseBranch')}</p>
      </div>
      <div class="branches-grid stagger" id="branchesGrid">
        <!-- Injected by JS -->
      </div>
    </div>
  </section>`;
}

function renderFooterSectionHTML(config) {
  return `
  <footer class="home-footer" id="siteFooter" data-section="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <img src="assets/chickbuck-logo.png" alt="Chick Buck" id="footerLogoImg" onerror="this.style.display='none'">
        <p class="footer-brand-name" id="footerBrandName">CHICK BUCK</p>
        <p class="footer-brand-desc" id="footerBrandDesc">The Unique Taste Of Saudi Arabia</p>
        <div class="footer-socials" id="footerSocials">
          <a href="https://www.instagram.com/chick_buck_ksa" class="footer-social-btn" id="footerInstagram" aria-label="Instagram" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>
          </a>
          <a href="#" class="footer-social-btn" id="footerFacebook" aria-label="Facebook" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12c0 5 3.7 9.1 8.4 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7C18.3 21.1 22 17 22 12z"/></svg>
          </a>
          <a href="https://www.tiktok.com/@chick_buck_ksa" class="footer-social-btn" id="footerTiktok" aria-label="TikTok" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.6 6.3c-1.4-.9-2.3-2.5-2.3-4.3h-3.2v13.4c0 1.6-1.3 2.9-2.9 2.9s-2.9-1.3-2.9-2.9 1.3-2.9 2.9-2.9c.3 0 .6 0 .9.1V9.3c-.3 0-.6-.1-.9-.1-3.4 0-6.2 2.8-6.2 6.2s2.8 6.2 6.2 6.2 6.2-2.8 6.2-6.2V9c1.4 1 3.1 1.6 4.9 1.6V7.4c-1 0-1.9-.4-2.7-1.1z"/></svg>
          </a>
          <a href="https://www.snapchat.com/add/chickbuckksa" class="footer-social-btn" id="footerSnapchat" aria-label="Snapchat" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C7 2 5 5.6 5 9v.5c-.5.2-1 .3-1.5.3-.5 0-.8.3-.8.7 0 .6.5 1 1.3 1.1.1 0 .3.1.5.2.2.1.3.3.3.5 0 .4-.3.9-.8 1.5-.7.8-1.6 1.5-2.3 1.8-.3.1-.5.3-.5.6 0 .5.8.8 1.5.9 0 .3.1.7.2 1 .1.3.4.4.7.4.2 0 .5-.1.8-.2.4-.2.7-.3 1-.3.2 0 .4.1.6.3.7.6 1.7 1.2 3.5 1.2 0 0 2.1.1 3.5-1.2.2-.2.4-.3.6-.3.3 0 .6.1 1 .3.3.1.6.2.8.2.3 0 .6-.1.7-.4.1-.3.2-.7.2-1 .7-.1 1.5-.4 1.5-.9 0-.3-.2-.5-.5-.6-.7-.3-1.6-1-2.3-1.8-.5-.6-.8-1.1-.8-1.5 0-.2.1-.4.3-.5.2-.1.4-.2.5-.2.8-.1 1.3-.5 1.3-1.1 0-.4-.3-.7-.8-.7-.5 0-1-.1-1.5-.3V9c0-3.4-2-7-7-7z"/></svg>
          </a>
        </div>
      </div>
      <div class="footer-col">
        <h4 data-i18n="quickLinks">${t('quickLinks')}</h4>
        <ul>
          <li onclick="scrollToBranches()" data-i18n="orderNow">${t('orderNow')}</li>
          <li onclick="scrollToSection('categoriesSection')" data-i18n="menu">${t('menu')}</li>
          <li onclick="scrollToSection('branchesSection')" data-i18n="ourBranches">${t('ourBranches')}</li>
        </ul>
      </div>
      <div class="footer-col">
        <h4 data-i18n="contact">${t('contact')}</h4>
        <ul>
          <li id="footerPhone">05013-62558</li>
          <li id="footerEmail"></li>
          <li id="footerAddress"></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4 data-i18n="hours">${t('hours')}</h4>
        <ul>
          <li id="footerHours">Daily 10:00 AM – 2:00 AM</li>
          <li id="footerDelivery">Delivery +5 SR</li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom" style="padding: 0 24px;">
      <p class="footer-copy" id="footerCopy">© 2026 CHICK BUCK · The Unique Taste Of Saudi Arabia</p>
      <div class="footer-bottom-links">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms</a>
      </div>
    </div>
  </footer>`;
}

function renderBannersSection(config) {
  if (!state.banners || state.banners.length === 0) {
    // Show default promotional slides
    const defaultBanners = [
      { title: 'CRISPY CHICKEN COMBO', subtitle: 'Limited Time Offer', description: 'Get our signature crispy chicken at an unbeatable price', discount: '20% OFF', cta_text: 'ORDER NOW', cta_action: 'menu', bg_color: '#250506' },
      { title: 'BROASTED PERFECTION', subtitle: 'Fresh Every Day', description: 'Crispy, juicy broasted chicken made fresh for every craving', discount: 'FROM 11 SR', cta_text: 'EXPLORE MENU', cta_action: 'menu', bg_color: '#1A0A09' }
    ];
    state.banners = defaultBanners;
  }

  const isMobile = window.innerWidth <= 640;
  const slidesHtml = state.banners.map((b, i) => {
    const imgUrl = (isMobile && b.mobile_img) ? b.mobile_img : (b.desktop_img || '');
    const bgStyle = imgUrl ? `background-image: url('${imgUrl}');` : '';
    const bgColor = b.bg_color || '#250506';

    return `
    <div class="banner-slide" style="background:${bgColor};" data-index="${i}">
      ${imgUrl ? `<div class="banner-slide-bg" style="${bgStyle}"></div>` : ''}
      <div class="banner-overlay"></div>
      <div class="banner-content">
        ${b.discount ? `<span class="banner-discount">${b.discount}</span>` : ''}
        <h2 class="banner-title">${b.title || ''}</h2>
        ${b.subtitle ? `<p class="banner-subtitle">${b.subtitle}</p>` : ''}
        ${b.description ? `<p class="banner-desc">${b.description}</p>` : ''}
        ${b.coupon_code ? `<div class="banner-coupon">🏷 ${b.coupon_code}</div>` : ''}
        <button class="banner-cta" onclick="handleBannerCTA('${b.cta_action || 'menu'}', '${b.link_value || ''}')">
          ${b.cta_text || 'ORDER NOW'}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>`;
  }).join('');

  const dotsHtml = state.banners.map((_, i) =>
    `<button class="banner-dot ${i === 0 ? 'active' : ''}" data-index="${i}" onclick="goToBannerSlide(${i})"></button>`
  ).join('');

  return `
  <section class="banner-section" data-section="banners">
    <div class="banner-carousel" id="bannerCarousel">
      <div class="banner-track" id="bannerTrack">
        ${slidesHtml}
      </div>
      ${state.banners.length > 1 ? `
      <button class="banner-nav banner-nav-prev" onclick="prevBannerSlide()" aria-label="Previous">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button class="banner-nav banner-nav-next" onclick="nextBannerSlide()" aria-label="Next">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M9 18l6-6-6-6"/></svg>
      </button>
      <div class="banner-dots">${dotsHtml}</div>
      ` : ''}
    </div>
  </section>`;
}

function renderCategoriesSection(config) {
  const catEntries = Object.entries(CATEGORY_META);
  const lang = state.lang;

  const cardsHtml = catEntries.map(([key, meta]) => `
    <button class="category-card" onclick="showMenuWithCategory('${key}')">
      <span class="category-icon">${meta.icon}</span>
      <span class="category-name">${lang === 'ar' ? meta.labelAr : meta.label}</span>
    </button>
  `).join('');

  const title = (config && config.title) || (lang === 'ar' ? 'الفئات' : 'Our Menu');

  return `
  <section class="categories-section section-full" id="categoriesSection" data-section="categories">
    <div style="max-width: var(--max-width); margin: 0 auto;">
      <div class="section-header reveal">
        <p class="section-eyebrow">What We Serve</p>
        <h2 class="section-title">${title}</h2>
        <p class="section-subtitle">Explore our full selection of crispy, juicy favourites</p>
      </div>
      <div class="categories-grid stagger">${cardsHtml}</div>
    </div>
  </section>`;
}

function renderProductsSection(type, config, allProducts) {
  const lang = state.lang;
  let products = [];
  let title = '', subtitle = '', eyebrow = '';

  // Sample products based on section type
  const allFlat = DATA.menus.branch1;

  if (type === 'bestsellers') {
    products = allFlat.filter(p => p.rating >= 4.9).slice(0, 8);
    title    = (config && config.title) || (lang === 'ar' ? 'الأكثر مبيعاً' : 'Best Sellers');
    subtitle = (config && config.subtitle) || (lang === 'ar' ? 'أكثر الأصناف طلبا' : 'Our most loved items');
    eyebrow  = '⭐ Top Picks';
  } else if (type === 'offers') {
    products = allFlat.filter(p => ['BROASTED','BURGERS'].includes(p.cat || '')).slice(0, 8);
    title    = (config && config.title) || (lang === 'ar' ? 'عروض خاصة' : 'Special Offers');
    subtitle = (config && config.subtitle) || 'Exclusive deals just for you';
    eyebrow  = '🔥 Limited Time';
  } else if (type === 'combos') {
    products = allFlat.filter(p => (p.cats || [p.cat]).includes('MEALS')).slice(0, 8);
    title    = (config && config.title) || (lang === 'ar' ? 'كومبو' : 'Popular Combos');
    subtitle = (config && config.subtitle) || 'Complete meals, great value';
    eyebrow  = '🍱 Combo Meals';
  } else if (type === 'featured') {
    products = allFlat.filter(p => p.badge === 'BEST SELLER' || p.rating >= 4.8).slice(0, 8);
    title    = (config && config.title) || (lang === 'ar' ? 'اختيارات الشيف' : 'Chef Picks');
    subtitle = (config && config.subtitle) || 'Handpicked favourites';
    eyebrow  = '👨‍🍳 Featured';
  }

  if (products.length === 0) return '';

  const cardsHtml = products.map(p => {
    const name   = lang === 'ar' ? (p.nameAr || p.name) : p.name;
    const desc   = lang === 'ar' ? (p.descAr || p.desc) : p.desc;
    const price  = getProductPrice(p);
    const badge  = p.badge || (p.rating >= 4.9 ? 'BEST SELLER' : '');
    const badgeClass = badge === 'BEST SELLER' ? 'gold' : '';
    const isFav  = state.favorites.includes(p.id);

    return `
    <article class="h-product-card" onclick="showBranchSelectModal('${p.id}')">
      <div class="h-product-card-img-wrap">
        <img src="${p.img}" alt="${name}" loading="lazy" onerror="this.src='';this.style.display='none';">
        ${badge ? `<span class="h-product-badge ${badgeClass}">${badge}</span>` : ''}
        <button class="h-product-fav ${isFav ? 'active' : ''}" onclick="event.stopPropagation();toggleFavHome('${p.id}')" aria-label="Favourite">
          ${isFav ? '♥' : '♡'}
        </button>
      </div>
      <div class="h-product-body">
        <div class="h-product-rating">
          ★ ${p.rating}
          ${p.calories ? `<span style="color:var(--text-muted);font-weight:400;margin-left:4px">· 🔥 ${p.calories} cal</span>` : ''}
        </div>
        <h3 class="h-product-name">${name}</h3>
        <p class="h-product-desc">${desc || ''}</p>
        <div class="h-product-bottom">
          <div>
            <div class="h-product-price">${formatPrice(price)} <span>SR</span></div>
            ${p.prices ? `<div style="font-size:11px;color:var(--text-muted)">Choose size</div>` : ''}
          </div>
        </div>
      </div>
    </article>`;
  }).join('');

  return `
  <section class="section-full" style="background:var(--background);" data-section="${type}">
    <div style="max-width: var(--max-width); margin: 0 auto; padding: 0 24px;">
      <div class="section-header reveal">
        <p class="section-eyebrow">${eyebrow}</p>
        <h2 class="section-title">${title}</h2>
        <p class="section-subtitle">${subtitle}</p>
      </div>
      <div class="products-horizontal stagger">${cardsHtml}</div>
      <div style="text-align:center; margin-top: 40px;">
        <button class="btn-hero-primary" style="display:inline-flex;" onclick="scrollToBranches()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          View Full Menu
        </button>
      </div>
    </div>
  </section>`;
}

function renderPromoSection(config) {
  const title = (config && config.title) || 'Why Chick Buck?';
  const subtitle = (config && config.subtitle) || 'We use only the finest ingredients';
  return `
  <section class="promo-section" data-section="promo">
    <div class="promo-inner reveal">
      <p class="promo-eyebrow">Our Promise</p>
      <h2 class="promo-title">${title}</h2>
      <p class="promo-text">${subtitle}</p>
      <div class="promo-features">
        <div class="promo-feature"><div class="promo-feature-icon">🔥</div><span>Cooked Fresh Daily</span></div>
        <div class="promo-feature"><div class="promo-feature-icon">🌿</div><span>Premium Ingredients</span></div>
        <div class="promo-feature"><div class="promo-feature-icon">⚡</div><span>Fast Service</span></div>
        <div class="promo-feature"><div class="promo-feature-icon">🛵</div><span>Quick Delivery</span></div>
      </div>
      <button class="btn-hero-primary" onclick="scrollToBranches()">Order Now</button>
    </div>
  </section>`;
}

function renderReviewsSection(config) {
  const title = (config && config.title) || 'What Our Customers Say';
  const reviews = [
    { name: 'Ahmed M.', rating: 5, text: 'Best broasted chicken in Jeddah! The spicy version is incredible. Order every week without fail.', date: '2 days ago' },
    { name: 'Sarah K.', rating: 5, text: 'The zinger burger is absolutely amazing. Crispy, juicy and perfectly seasoned. Highly recommended!', date: '1 week ago' },
    { name: 'Mohammed A.', rating: 5, text: 'Quick delivery and the food was still hot. The combo meals are great value. Will definitely order again!', date: '3 days ago' }
  ];
  const cardsHtml = reviews.map(r => `
    <div class="review-card">
      <div class="review-stars">${'★'.repeat(r.rating)}</div>
      <p class="review-text">"${r.text}"</p>
      <div class="review-author">
        <div class="review-avatar">${r.name.charAt(0)}</div>
        <div>
          <div class="review-name">${r.name}</div>
          <div class="review-meta">${r.date} · Verified Customer</div>
        </div>
      </div>
    </div>
  `).join('');
  return `
  <section class="reviews-section" data-section="reviews">
    <div style="max-width: var(--max-width); margin: 0 auto;">
      <div class="section-header reveal">
        <p class="section-eyebrow">⭐ Reviews</p>
        <h2 class="section-title">${title}</h2>
      </div>
      <div class="reviews-grid stagger">${cardsHtml}</div>
    </div>
  </section>`;
}

function renderCTASection(config) {
  const title    = (config && config.title) || 'Order via WhatsApp';
  const subtitle = (config && config.subtitle) || 'Fast, easy, delicious — straight to your door';
  return `
  <section class="cta-section" data-section="cta">
    <div class="cta-inner reveal">
      <div class="cta-icon">💬</div>
      <h2 class="cta-title">${title}</h2>
      <p class="cta-text">${subtitle}</p>
      <button class="btn-whatsapp" onclick="scrollToBranches()">
        <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-1-.3-.1-.5-.1-.7.1l-1 1.2c-.2.2-.3.3-.6.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.4c.1-.1.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.5-.4-.5-.7-.5h-.6c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .1.2 2.1 3.2 5.1 4.5 1.9.8 2.6.9 3.5.7.6-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>
        Order on WhatsApp
      </button>
    </div>
  </section>`;
}

// ─── 14. BRANCHES SECTION ────────────────────────────────────
function renderBranchesSection() {
  const grid = document.getElementById('branchesGrid');
  if (!grid) return;
  const lang = state.lang;

  grid.innerHTML = Object.entries(DATA.branches).map(([id, b], i) => `
    <button class="branch-card-hp" onclick="showMenu('${id}')">
      <div class="branch-num">0${i + 1}</div>
      <h3 class="branch-hp-name">${lang === 'ar' ? b.nameAr : b.name}</h3>
      <p class="branch-hp-phone">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
        ${b.phone}
      </p>
      <button class="branch-hp-btn">
        ${t('orderBranch')}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </button>
  `).join('');
}

// ─── 15. BANNER CAROUSEL ─────────────────────────────────────
function initBannerCarousel() {
  const track = document.getElementById('bannerTrack');
  if (!track || state.banners.length <= 1) return;

  state.bannerCurrentIndex = 0;
  updateBannerPosition();
  startBannerAutoplay();
}

function updateBannerPosition() {
  const track = document.getElementById('bannerTrack');
  if (!track) return;
  track.style.transform = `translateX(-${state.bannerCurrentIndex * 100}%)`;

  // Update dots
  $$('.banner-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === state.bannerCurrentIndex);
  });
}

function goToBannerSlide(index) {
  state.bannerCurrentIndex = index;
  updateBannerPosition();
  restartBannerAutoplay();
}

function nextBannerSlide() {
  state.bannerCurrentIndex = (state.bannerCurrentIndex + 1) % state.banners.length;
  updateBannerPosition();
  restartBannerAutoplay();
}

function prevBannerSlide() {
  state.bannerCurrentIndex = (state.bannerCurrentIndex - 1 + state.banners.length) % state.banners.length;
  updateBannerPosition();
  restartBannerAutoplay();
}

function startBannerAutoplay() {
  if (state.bannerTimer) clearInterval(state.bannerTimer);
  const section = state.homepageSections.find(s => s.id === 'banners');
  const interval = (section && section.config && section.config.interval) || 5000;
  state.bannerTimer = setInterval(() => nextBannerSlide(), interval);
}

function restartBannerAutoplay() {
  if (state.bannerTimer) clearInterval(state.bannerTimer);
  startBannerAutoplay();
}

function handleBannerCTA(action, value) {
  if (action === 'menu' || action === 'order') scrollToBranches();
  else if (action === 'category' && value) showMenuWithCategory(value);
  else if (action === 'url' && value) window.open(value, '_blank');
  else scrollToBranches();
}

// ─── 16. SCROLL HELPERS ──────────────────────────────────────
function scrollToBranches() {
  const el = document.getElementById('branchesSection');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── 17. HOME → MENU PRODUCT QUICK ADD ───────────────────────
function quickAddFromHome(productId, branchId) {
  const branch = branchId || 'branch1';
  const products = DATA.menus[branch] || DATA.menus.branch1;
  const p = products.find(x => x.id === productId);
  if (!p) return;

  if (!state.branch) state.branch = branch;
  if (!state.currentProducts || state.currentProducts.length === 0) {
    state.currentProducts = products;
  }

  if (p.prices && Object.keys(p.prices).length > 1) {
    // Need to show menu to select size
    showMenu(branch).then(() => openProductModal(productId));
  } else {
    addToCart(p, 1, p.prices ? Object.keys(p.prices)[0] : null);
    // Show confirmation
    showAddedToast(state.lang === 'ar' ? (p.nameAr || p.name) : p.name);
  }
}

function showMenuWithCategory(cat) {
  showMenu('branch1').then(() => {
    state.activeCat = cat;
    $$('.cat-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.cat === cat);
    });
    renderProducts();
  });
}

function showBranchSelectModal(productId) {
  // Find the product from all branch menus
  let product = null;
  for (const bKey of Object.keys(DATA.menus)) {
    product = DATA.menus[bKey].find(p => p.id === productId);
    if (product) break;
  }
  if (!product) return;

  const lang = state.lang;
  const name  = lang === 'ar' ? (product.nameAr || product.name) : product.name;
  const price = getProductPrice(product);

  // Populate modal
  const imgEl = $('#bsmProductImg');
  if (imgEl) { imgEl.src = product.img; imgEl.alt = name; imgEl.onerror = () => imgEl.style.display = 'none'; }
  const nameEl = $('#bsmProductName'); if (nameEl) nameEl.textContent = name;
  const priceEl = $('#bsmProductPrice'); if (priceEl) priceEl.textContent = `${formatPrice(price)} SR`;
  const titleEl = $('#bsmTitle'); if (titleEl) titleEl.textContent = lang === 'ar' ? 'اختر الفرع' : 'Select a Branch';
  const subEl = $('#bsmSubtitle'); if (subEl) subEl.textContent = lang === 'ar' ? 'اختر أقرب فرع للطلب' : 'Choose your nearest branch to order';

  // Build branch buttons
  const branchesEl = $('#bsmBranches');
  if (branchesEl) {
    branchesEl.innerHTML = Object.entries(DATA.branches).map(([bId, b]) => `
      <button class="bsm-branch-btn" onclick="selectBranchFromModal('${bId}','${productId}')">
        <div class="bsm-branch-info">
          <div class="bsm-branch-name">${lang === 'ar' ? b.nameAr : b.name}</div>
          <div class="bsm-branch-phone">${b.phone}</div>
        </div>
        <div class="bsm-branch-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
      </button>
    `).join('');
  }

  const modal = $('#branchSelectModal');
  if (modal) { modal.style.display = 'flex'; void modal.offsetWidth; requestAnimationFrame(() => modal.classList.add('active')); }
}

function closeBranchSelectModal() {
  const modal = $('#branchSelectModal');
  if (modal) { modal.classList.remove('active'); setTimeout(() => { if (!modal.classList.contains('active')) modal.style.display = 'none'; }, 400); }
}

function selectBranchFromModal(branchId, productId) {
  closeBranchSelectModal();
  showMenu(branchId).then(() => {
    const p = state.currentProducts.find(x => x.id === productId);
    if (p) {
      if (p.prices && Object.keys(p.prices).length > 1) openProductModal(productId);
      else quickAdd(productId);
    }
  });
}

function showAddedToast(name) {
  let toast = document.getElementById('addToastMsg');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'addToastMsg';
    toast.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--primary);color:#fff;padding:12px 24px;border-radius:40px;font-size:13px;font-weight:700;z-index:9999;pointer-events:none;transition:all 0.3s;white-space:nowrap;box-shadow:0 4px 20px rgba(196,50,58,0.4)`;
    document.body.appendChild(toast);
  }
  toast.textContent = `✓ ${name} added to cart`;
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 2000);
}

function toggleFavHome(id) {
  const idx = state.favorites.indexOf(id);
  if (idx >= 0) state.favorites.splice(idx, 1);
  else state.favorites.push(id);
  saveState();
  // Re-render homepage sections to update fav buttons
  renderHomepage();
  if (state.currentProducts.length > 0) renderProducts();
}

// ─── 18. MENU SYSTEM (PRESERVED + ENHANCED) ──────────────────
async function showMenu(branchId) {
  state.branch = branchId;
  state.activeCat = 'all';

  let dbProducts = [];
  const hardcodedProducts = DATA.menus[branchId] || DATA.menus.branch1;

  try {
    const { data, error } = await db.from('products').select('*').eq('branch_id', branchId);
    if (!error && data && data.length > 0) {
      dbProducts = data.map(p => ({
        id: p.id, cat: p.cat, cats: p.cats || [p.cat],
        name: p.name, nameAr: p.name_ar,
        desc: p.description, descAr: p.description_ar,
        price: p.price || 0, prices: p.prices,
        calories: p.calories, rating: p.rating || 4.5,
        badge: p.badge, img: p.img
      }));
    }
  } catch(e) {
    console.warn('DB products failed:', e.message);
  }

  // Merge (DB first, then hardcoded as fallback)
  const seenIds = new Set();
  state.currentProducts = [
    ...dbProducts.filter(p => { if(seenIds.has(p.id)) return false; seenIds.add(p.id); return true; }),
    ...hardcodedProducts.filter(p => { if(seenIds.has(p.id)) return false; seenIds.add(p.id); return true; })
  ];

  $('#homeView').classList.remove('active');
  $('#menuView').classList.add('active');

  const b = DATA.branches[branchId];
  $('#bicName').textContent = state.lang === 'ar' ? b.nameAr : b.name;
  $('#bicPhoneNum').textContent = b.phone;
  $('#bicPhone').href = `tel:${b.phone.replace('-', '')}`;

  // Stop banner autoplay
  if (state.bannerTimer) { clearInterval(state.bannerTimer); state.bannerTimer = null; }

  window.scrollTo(0, 0);
  buildCategoryTabs();
  renderProducts();
  updateCartUI();

  history.pushState({ view: 'menu', branch: branchId }, '', `?branch=${branchId}`);
  return Promise.resolve();
}

function buildCategoryTabs() {
  const tabs = document.getElementById('categoryTabs');
  if (!tabs) return;

  // Get unique categories from current products
  const cats = new Set();
  state.currentProducts.forEach(p => {
    const productCats = p.cats || [p.cat];
    productCats.forEach(c => { if(c) cats.add(c); });
  });

  tabs.innerHTML = '';

  // Create "All" tab with event listener
  const allBtn = document.createElement('button');
  allBtn.className = 'cat-tab active';
  allBtn.dataset.cat = 'all';
  allBtn.textContent = t('catAll');
  allBtn.addEventListener('click', () => {
    $$('.cat-tab').forEach(t => t.classList.remove('active'));
    allBtn.classList.add('active');
    state.activeCat = 'all';
    renderProducts();
  });
  tabs.appendChild(allBtn);

  cats.forEach(cat => {
    const meta = CATEGORY_META[cat];
    const label = meta ? (state.lang === 'ar' ? meta.labelAr : meta.label) : cat;
    const btn = document.createElement('button');
    btn.className = 'cat-tab';
    btn.dataset.cat = cat;
    btn.textContent = label;
    btn.addEventListener('click', () => {
      $$('.cat-tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      state.activeCat = cat;
      renderProducts();
    });
    tabs.appendChild(btn);
  });
}


function showHome() {
  $('#menuView').classList.remove('active');
  $('#homeView').classList.add('active');
  state.branch = null;
  state.currentProducts = [];
  window.scrollTo(0, 0);
  history.replaceState({ view: 'home' }, '', window.location.pathname);
  // Restart banner
  if (state.banners.length > 1) startBannerAutoplay();
}

function renderProducts() {
  const grid = $('#productsGrid');
  if (!grid) return;
  const products = state.currentProducts;
  const filtered = products.filter(p => {
    const productCats = p.cats || [p.cat];
    const matchesCat = state.activeCat === 'all' || productCats.includes(state.activeCat);
    const search = state.search.toLowerCase();
    const matchesSearch = !search ||
      (p.name || '').toLowerCase().includes(search) ||
      (p.nameAr || '').includes(state.search);
    return matchesCat && matchesSearch;
  });

  const shownCount = document.getElementById('shownCount');
  const totalCount = document.getElementById('totalCount');
  if (shownCount) shownCount.textContent = filtered.length;
  if (totalCount) totalCount.textContent = products.length;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">No items found</div>
        <div class="empty-state-text">Try a different search or category</div>
      </div>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = filtered.map(p => {
    const isFav = state.favorites.includes(p.id);
    const price = getProductPrice(p) || 0;
    const name  = state.lang === 'ar' ? (p.nameAr || p.name) : p.name;
    const desc  = state.lang === 'ar' ? (p.descAr || p.desc) : p.desc;
    const hasSizes = p.prices && Object.keys(p.prices).length > 1;
    const badgeHtml = p.badge
      ? `<span class="pc-badge ${p.badge === 'BEST SELLER' ? 'best' : 'new'}">${p.badge}</span>`
      : '';

    return `
      <article class="product-card ${hasSizes ? 'has-sizes' : ''}" data-id="${p.id}">
        <div class="pc-image-wrap">
          <img src="${p.img}" alt="${name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
          <div class="pc-fallback">🍗</div>
          ${badgeHtml}
          <button class="pc-fav ${isFav ? 'active' : ''}" data-fav="${p.id}"
            onclick="event.stopPropagation();toggleFav('${p.id}')">${isFav ? '♥' : '♡'}</button>
        </div>
        <div class="pc-body">
          <div class="pc-name-row">
            <h3 class="pc-name">${name}</h3>
            <div class="pc-rating">★ ${p.rating}</div>
          </div>
          <p class="pc-desc">${desc || ''}</p>
          <div class="pc-bottom">
            <div class="pc-price">
              ${formatPrice(price)} <span class="sr-label">SR</span>
              ${hasSizes ? `<span class="size-hint">${state.lang === 'ar' ? 'اختر الحجم' : 'Choose size'}</span>` : ''}
            </div>
            <button class="pc-add-btn" onclick="event.stopPropagation();quickAdd('${p.id}')" aria-label="Add">+</button>
          </div>
        </div>
      </article>`;
  }).join('');

  while (tempDiv.firstChild) fragment.appendChild(tempDiv.firstChild);
  grid.innerHTML = '';
  grid.appendChild(fragment);

  $$('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.pc-fav') || e.target.closest('.pc-add-btn')) return;
      const id = card.dataset.id;
      const p = state.currentProducts.find(x => x.id === id);
      if (p) {
        if (p.prices && Object.keys(p.prices).length > 1) openProductModal(id);
        else quickAdd(id);
      }
    });
  });
}

function quickAdd(id) {
  const p = state.currentProducts.find(x => x.id === id);
  if (!p) return;
  if (p.prices && Object.keys(p.prices).length > 1) openProductModal(id);
  else addToCart(p, 1, p.prices ? Object.keys(p.prices)[0] : null);
}

function toggleFav(id) {
  const idx = state.favorites.indexOf(id);
  if (idx >= 0) state.favorites.splice(idx, 1);
  else state.favorites.push(id);
  saveState();
  renderProducts();
}

// ─── 19. PRODUCT MODAL ───────────────────────────────────────
function openProductModal(id) {
  const p = state.currentProducts.find(x => x.id === id);
  if (!p) return;

  state.currentProduct = p;
  state.currentQty = 1;
  state.currentSize = p.prices ? Object.keys(p.prices)[0] : null;

  const name = state.lang === 'ar' ? (p.nameAr || p.name) : p.name;
  const desc = state.lang === 'ar' ? (p.descAr || p.desc) : p.desc;

  const pmImage = $('#pmImage');
  if (pmImage) { pmImage.src = p.img; pmImage.onerror = () => pmImage.style.display = 'none'; }
  const pmName = $('#pmName'); if (pmName) pmName.textContent = name;
  const pmDesc = $('#pmDesc'); if (pmDesc) pmDesc.textContent = desc || '';
  const pmCalories = $('#pmCalories'); if (pmCalories) pmCalories.textContent = p.calories ? `🔥 ${p.calories} cal` : '';
  const pmRating = $('#pmRating'); if (pmRating) pmRating.textContent = p.rating;

  const fullStars = Math.floor(p.rating || 0);
  const pmStars = $('#pmStars'); if (pmStars) pmStars.textContent = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);

  const badge = $('#pmBadge');
  if (badge) {
    if (p.badge) {
      badge.textContent = p.badge;
      badge.className = 'pm-badge ' + (p.badge === 'BEST SELLER' ? 'best' : '');
      badge.style.display = 'block';
    } else { badge.style.display = 'none'; }
  }

  const pmSizes = $('#pmSizes');
  if (p.prices && Object.keys(p.prices).length > 1) {
    if (pmSizes) pmSizes.style.display = 'block';
    const pmSizeOptions = $('#pmSizeOptions');
    if (pmSizeOptions) {
      pmSizeOptions.innerHTML = Object.keys(p.prices).map((s, i) => `
        <button class="pm-size-opt ${i === 0 ? 'active' : ''}" data-size="${s}">
          <div class="pm-size-opt-name">${s}</div>
          <div class="pm-size-opt-price">${p.prices[s]} SR</div>
        </button>
      `).join('');

      $$('#pmSizeOptions .pm-size-opt').forEach(btn => {
        btn.addEventListener('click', () => {
          $$('#pmSizeOptions .pm-size-opt').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.currentSize = btn.dataset.size;
          updateModalPrice();
        });
      });
    }
  } else {
    if (pmSizes) pmSizes.style.display = 'none';
  }

  const pmQty = $('#pmQty'); if (pmQty) pmQty.textContent = state.currentQty;
  updateModalPrice();

  const modal = $('#productModal');
  if (modal) modal.classList.add('active');
}

function closeProductModal() {
  const modal = $('#productModal');
  if (modal) modal.classList.remove('active');
}

function updateModalPrice() {
  if (!state.currentProduct) return;
  const total = getProductPrice(state.currentProduct, state.currentSize) * state.currentQty;
  const pmPrice = $('#pmPrice');
  if (pmPrice) pmPrice.innerHTML = `${formatPrice(total)} <span class="sr-label">SR</span>`;
}

// ─── 20. CART ────────────────────────────────────────────────
const debouncedUpdateCartUI = debounce(updateCartUI, 100);
const debouncedRenderProducts = debounce(renderProducts, 150);

function addToCart(product, qty, size) {
  const key = product.id + (size ? '_' + size : '');
  const existing = state.cart.find(i => i.key === key);
  const price = getProductPrice(product, size);
  if (existing) existing.qty += qty;
  else state.cart.push({ key, id: product.id, name: product.name, nameAr: product.nameAr, img: product.img, size, price, qty });
  saveState();
  debouncedUpdateCartUI();
  debouncedRenderProducts();
  pulseBadge();
}

function updateCartQty(key, delta) {
  const item = state.cart.find(i => i.key === key);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) state.cart = state.cart.filter(i => i.key !== key);
  saveState();
  debouncedUpdateCartUI();
  renderCart();
  debouncedRenderProducts();
}

function removeFromCart(key) {
  state.cart = state.cart.filter(i => i.key !== key);
  saveState();
  debouncedUpdateCartUI();
  renderCart();
  debouncedRenderProducts();
}

function getCartSubtotal() { return state.cart.reduce((s, i) => s + i.price * i.qty, 0); }
function getCartCount()    { return state.cart.reduce((s, i) => s + i.qty, 0); }

function updateCartUI() {
  const count = getCartCount();
  const total = getCartSubtotal() + (state.orderType === 'delivery' ? 5 : 0);
  const topBadge = $('#topCartBadge'); if (topBadge) topBadge.textContent = count;
  const topCount = $('#topCartCount'); if (topCount) topCount.textContent = count;
  const topTotal = $('#topCartTotal'); if (topTotal) topTotal.textContent = formatPrice(total);
  const bobCount = $('#bobCount'); if (bobCount) bobCount.textContent = count;
  const bobTotal = $('#bobTotal'); if (bobTotal) bobTotal.textContent = formatPrice(total);
  const cmTotal  = $('#cmTotal');  if (cmTotal)  cmTotal.textContent  = formatPrice(total);
  const placeBtn = $('#placeOrderBtn'); if (placeBtn) placeBtn.disabled = count === 0;
  const bottomBar = $('#bottomOrderBar'); if (bottomBar) bottomBar.classList.toggle('visible', count > 0);
}

function pulseBadge() {
  const b = $('#topCartBadge'); if (!b) return;
  b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse');
}

function renderCart() {
  const container = $('#cartItems');
  if (!container) return;
  if (state.cart.length === 0) {
    container.innerHTML = `
      <div class="cm-empty">
        <div class="cm-empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="50" height="50">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/>
          </svg>
        </div>
        <p>${t('cartEmpty')}</p>
      </div>`;
    return;
  }
  container.innerHTML = state.cart.map(item => {
    const name = state.lang === 'ar' ? (item.nameAr || item.name) : item.name;
    const sizeLabel = item.size ? ` · ${item.size}` : '';
    return `
      <div class="cart-item">
        <div class="ci-img">
          <img src="${item.img}" alt="${name}" onerror="this.style.display='none'">
        </div>
        <div class="ci-info">
          <div class="ci-name">${name}</div>
          <div class="ci-size">${formatPrice(item.price)} SR${sizeLabel}</div>
          <div class="ci-bottom">
            <div class="ci-qty">
              <button onclick="updateCartQty('${item.key}', -1)">−</button>
              <span>${item.qty}</span>
              <button onclick="updateCartQty('${item.key}', 1)">+</button>
            </div>
            <div class="ci-price">${formatPrice(item.price * item.qty)} SR</div>
            <button class="ci-remove" onclick="removeFromCart('${item.key}')" aria-label="Remove">✕</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function clearCart() {
  state.cart = [];
  saveState();
  ['custName','custPhone','custNotes','custBuilding','custFloor','custRoom'].forEach(id => {
    const el = $(`#${id}`); if (el) el.value = '';
  });
  state.orderType = 'parcel';
  $$('input[name="orderType"]').forEach(r => r.checked = r.value === 'parcel');
  $$('.order-type-option').forEach(opt => opt.classList.remove('active'));
  const defaultOpt = $('.order-type-option[data-type="parcel"]');
  if (defaultOpt) defaultOpt.classList.add('active');
  const dd = $('#deliveryDetails'); if (dd) dd.style.display = 'none';
  updateCartUI(); renderCart(); renderProducts();
  const cartModal = $('#cartModal'); if (cartModal) cartModal.classList.remove('active');
  alert(state.lang === 'ar' ? 'تم إرسال طلبك بنجاح! شكراً لك.' : 'Order sent successfully! Thank you.');
}

// ─── 21. WHATSAPP ORDER ──────────────────────────────────────
function generateOrderNumber() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  return `CB-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;
}

async function sendWhatsApp() {
  if (state.cart.length === 0) return;
  const nameEl = $('#custName'), phoneEl = $('#custPhone');
  const name  = nameEl ? nameEl.value.trim() : '';
  const phone = phoneEl ? phoneEl.value.trim() : '';
  const notes = $('#custNotes') ? $('#custNotes').value.trim() : '';

  if (!name || !phone) {
    alert(state.lang === 'ar' ? 'يرجى إدخال الاسم ورقم الجوال' : 'Please enter your name and phone');
    return;
  }

  const branch = DATA.branches[state.branch] || DATA.branches.branch1;
  const subtotal = getCartSubtotal();
  const deliveryFee = state.orderType === 'delivery' ? 5 : 0;
  const total = subtotal + deliveryFee;
  const orderNumber = generateOrderNumber();

  const orderData = {
    order_number: orderNumber,
    branch_id: state.branch || 'branch1',
    branch_name: state.lang === 'ar' ? branch.nameAr : branch.name,
    order_type: state.orderType,
    customer_name: name, customer_phone: phone,
    notes, subtotal, delivery_fee: deliveryFee, total, status: 'New', language: state.lang
  };

  if (state.orderType === 'delivery') {
    orderData.building = $('#custBuilding')?.value.trim() || '';
    orderData.floor    = $('#custFloor')?.value.trim() || '';
    orderData.room     = $('#custRoom')?.value.trim() || '';
  }

  const orderItemsData = state.cart.map(item => ({
    product_id: item.id, product_name: item.name, product_name_ar: item.nameAr,
    size: item.size || null, unit_price: item.price, quantity: item.qty, item_total: item.price * item.qty
  }));

  const btn = $('#sendWhatsAppBtn');
  const originalHtml = btn.innerHTML;
  btn.innerHTML = state.lang === 'ar' ? 'جاري الحفظ...' : 'Saving...';
  btn.classList.add('loading');
  btn.disabled = true;

  try {
    const { data: orderResult, error: orderError } = await db.from('orders').insert(orderData).select().single();
    if (orderError) throw orderError;

    const { error: itemsError } = await db.from('order_items').insert(
      orderItemsData.map(i => ({ ...i, order_id: orderResult.id }))
    );
    if (itemsError) throw itemsError;

    // Build WhatsApp message
    const typeText = state.orderType === 'delivery'
      ? (state.lang === 'ar' ? 'توصيل' : 'Delivery')
      : (state.lang === 'ar' ? 'استلام من الفرع' : 'Parcel/Pickup');

    let msg = `🍗 *CHICK BUCK - NEW ORDER* 🍗\n\n`;
    msg += `🔖 *Order #:* ${orderNumber}\n`;
    msg += `📍 *Branch:* ${orderData.branch_name}\n`;
    msg += `📦 *Type:* ${typeText}\n`;
    msg += `👤 *Name:* ${name}\n`;
    msg += `📞 *Phone:* ${phone}\n`;
    if (state.orderType === 'delivery') {
      if (orderData.building) msg += `🏢 *Building:* ${orderData.building}\n`;
      if (orderData.floor)    msg += `🏢 *Floor:* ${orderData.floor}\n`;
      if (orderData.room)     msg += `🚪 *Room/Unit:* ${orderData.room}\n`;
    }
    if (notes) msg += `📝 *Notes:* ${notes}\n`;
    msg += `\n━━━━━━━━━━━━━━━\n*ORDER DETAILS:*\n━━━━━━━━━━━━━━━\n\n`;

    state.cart.forEach(item => {
      const itemName = state.lang === 'ar' ? (item.nameAr || item.name) : item.name;
      msg += ` - ${itemName}${item.size ? ` (${item.size})` : ''}\n`;
      msg += `   ${item.qty} × ${formatPrice(item.price)} SR = ${formatPrice(item.price * item.qty)} SR\n\n`;
    });

    msg += `━━━━━━━━━━━━━━━\n`;
    if (deliveryFee > 0) msg += `🛵 *Delivery Fee:* ${deliveryFee} SR\n`;
    msg += `💰 *TOTAL: ${formatPrice(total)} SR*\n`;
    msg += `━━━━━━━━━━━━━━━\n\n`;
    msg += state.lang === 'ar' ? 'شكراً لطلبك من تشيك باك! 🙏' : 'Thank you for ordering from Chick Buck! 🙏';

    const waUrl = `https://wa.me/${branch.whatsapp}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');

    setTimeout(() => {
      clearCart();
      btn.innerHTML = originalHtml;
      btn.classList.remove('loading');
      btn.disabled = false;
    }, 1000);

  } catch(error) {
    console.error('Order error:', error);
    alert(state.lang === 'ar'
      ? 'فشل حفظ الطلب. يرجى التحقق من الإنترنت والمحاولة مرة أخرى.'
      : 'Failed to save order. Please check your internet and try again.');
    btn.innerHTML = originalHtml;
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}

// ─── 22. i18n ────────────────────────────────────────────────
function applyLanguage() {
  document.documentElement.lang = state.lang;
  document.body.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
  $$('[data-i18n]').forEach(el => {
    if (I18N[state.lang][el.dataset.i18n]) el.textContent = I18N[state.lang][el.dataset.i18n];
  });
  $$('[data-i18n-placeholder]').forEach(el => {
    if (I18N[state.lang][el.dataset.i18nPlaceholder]) el.placeholder = I18N[state.lang][el.dataset.i18nPlaceholder];
  });
  renderHomepage();
  renderProducts();
  renderCart();
  renderBranchesSection();
}
function toggleLanguage() { state.lang = state.lang === 'en' ? 'ar' : 'en'; saveState(); applyLanguage(); }

// ─── 23. SCROLL REVEAL ───────────────────────────────────────
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal, .stagger').forEach(el => observer.observe(el));
}

// ─── 24. INITIALIZATION ──────────────────────────────────────
async function init() {
  // Apply language first
  applyLanguage();

  // Load remote config in parallel
  await Promise.all([
    loadSiteSettings(),
    loadBanners(),
    loadHomepageSections(),
    loadProductsFromDB()
  ]);

  // Render homepage sections
  renderHomepage();
  renderBranchesSection();

  // Check URL params (branch deep link)
  const urlParams = new URLSearchParams(window.location.search);
  const branchParam = urlParams.get('branch');
  if (branchParam && DATA.menus[branchParam]) {
    showMenu(branchParam);
  }

  // Event listeners
  const langToggle = $('#langToggle');
  if (langToggle) langToggle.addEventListener('click', debounce(toggleLanguage, 200));
  const langToggleMenu = $('#langToggleMenu');
  if (langToggleMenu) langToggleMenu.addEventListener('click', debounce(toggleLanguage, 200));

  const backBtn = $('#backBtn');
  if (backBtn) backBtn.addEventListener('click', debounce(showHome, 200));

  const searchInput = $('#searchInput');
  if (searchInput) searchInput.addEventListener('input', throttle((e) => {
    state.search = e.target.value; renderProducts();
  }, 150));

  const productModalClose = $('#productModalClose');
  if (productModalClose) productModalClose.addEventListener('click', debounce(closeProductModal, 200));

  const productModal = $('#productModal');
  if (productModal) productModal.addEventListener('click', (e) => {
    if (e.target === productModal) closeProductModal();
  });

  const pmQtyPlus = $('#pmQtyPlus');
  if (pmQtyPlus) pmQtyPlus.addEventListener('click', debounce(() => {
    state.currentQty++;
    const pmQty = $('#pmQty'); if (pmQty) pmQty.textContent = state.currentQty;
    updateModalPrice();
  }, 100));

  const pmQtyMinus = $('#pmQtyMinus');
  if (pmQtyMinus) pmQtyMinus.addEventListener('click', debounce(() => {
    if (state.currentQty > 1) {
      state.currentQty--;
      const pmQty = $('#pmQty'); if (pmQty) pmQty.textContent = state.currentQty;
      updateModalPrice();
    }
  }, 100));

  const pmAddBtn = $('#pmAddBtn');
  if (pmAddBtn) pmAddBtn.addEventListener('click', debounce(() => {
    addToCart(state.currentProduct, state.currentQty, state.currentSize);
    closeProductModal();
  }, 200));

  const viewCartBtn = $('#viewCartBtn');
  if (viewCartBtn) viewCartBtn.addEventListener('click', debounce(() => {
    renderCart();
    const modal = $('#cartModal');
    if (modal) { modal.style.display = 'flex'; void modal.offsetWidth; requestAnimationFrame(() => modal.classList.add('active')); }
  }, 200));

  const cartModalClose = $('#cartModalClose');
  if (cartModalClose) cartModalClose.addEventListener('click', debounce(() => {
    const modal = $('#cartModal');
    if (modal) { modal.classList.remove('active'); setTimeout(() => { if (!modal.classList.contains('active')) modal.style.display = 'none'; }, 400); }
  }, 200));

  const cartModal = $('#cartModal');
  if (cartModal) cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) {
      cartModal.classList.remove('active');
      setTimeout(() => { if (!cartModal.classList.contains('active')) cartModal.style.display = 'none'; }, 400);
    }
  });

  const placeOrderBtn = $('#placeOrderBtn');
  if (placeOrderBtn) placeOrderBtn.addEventListener('click', debounce(() => {
    renderCart();
    const modal = $('#cartModal');
    if (modal) { modal.style.display = 'flex'; void modal.offsetWidth; requestAnimationFrame(() => modal.classList.add('active')); }
  }, 200));

  $$('input[name="orderType"]').forEach(radio => radio.addEventListener('change', debounce((e) => {
    state.orderType = e.target.value;
    $$('.order-type-option').forEach(opt => opt.classList.remove('active'));
    const activeOpt = $(`.order-type-option[data-type="${state.orderType}"]`);
    if (activeOpt) activeOpt.classList.add('active');
    const dd = $('#deliveryDetails'); if (dd) dd.style.display = state.orderType === 'delivery' ? 'block' : 'none';
    updateCartUI();
  }, 200)));

  const sendWhatsAppBtn = $('#sendWhatsAppBtn');
  if (sendWhatsAppBtn) sendWhatsAppBtn.addEventListener('click', debounce(sendWhatsApp, 300));

  // Branch select modal close
  const branchSelectClose = $('#branchSelectClose');
  if (branchSelectClose) branchSelectClose.addEventListener('click', debounce(closeBranchSelectModal, 200));
  const branchSelectModal = $('#branchSelectModal');
  if (branchSelectModal) branchSelectModal.addEventListener('click', (e) => {
    if (e.target === branchSelectModal) closeBranchSelectModal();
  });

  updateCartUI();


  // Browser back/forward
  window.addEventListener('popstate', (event) => {
    if (event.state && event.state.view === 'home') showHome();
    else if (event.state && event.state.view === 'menu' && event.state.branch) showMenu(event.state.branch);
  });
}

// ─── 25. PAGE LOADER ─────────────────────────────────────────
window.addEventListener('load', () => {
  const loader = $('#pageLoader');
  if (!loader) return;
  const video = loader.querySelector('.loader-video');
  if (video) {
    video.addEventListener('ended', () => {
      loader.classList.add('loader-hidden');
      setTimeout(() => loader.remove(), 500);
    });
  }
  setTimeout(() => {
    if (loader && !loader.classList.contains('loader-hidden')) {
      loader.classList.add('loader-hidden');
      setTimeout(() => { if(loader.parentNode) loader.remove(); }, 500);
    }
  }, 5000);
});

// ─── 26. GLOBAL EXPORTS ──────────────────────────────────────
window.toggleFav = toggleFav;
window.quickAdd  = quickAdd;
window.updateCartQty   = updateCartQty;
window.removeFromCart  = removeFromCart;
window.showMenu        = showMenu;
window.showHome        = showHome;
window.scrollToBranches = scrollToBranches;
window.scrollToSection  = scrollToSection;
window.goToBannerSlide  = goToBannerSlide;
window.nextBannerSlide  = nextBannerSlide;
window.prevBannerSlide  = prevBannerSlide;
window.handleBannerCTA  = handleBannerCTA;
window.quickAddFromHome = quickAddFromHome;
window.showMenuWithCategory = showMenuWithCategory;
window.toggleLanguage = toggleLanguage;
window.toggleFavHome    = toggleFavHome;
window.showBranchSelectModal  = showBranchSelectModal;
window.closeBranchSelectModal = closeBranchSelectModal;
window.selectBranchFromModal  = selectBranchFromModal;

document.addEventListener('DOMContentLoaded', init);