# 🍗 Chick Buck - Premium Digital Menu

A high-performance, mobile-first digital menu and ordering web application for **Chick Buck**. Designed with a premium editorial aesthetic, this static web app allows customers to browse branch-specific menus, customize their orders, and seamlessly place orders via WhatsApp.

## ✨ Key Features

- **🎨 Premium UI/UX:** Bold Radical Red, Cream White, and Dark Red color palette with smooth animations and a custom video loader.
- ** Bilingual Support:** Full English and Arabic support with automatic RTL (Right-to-Left) layout switching.
- **📍 Multi-Branch System:** Independent menus, pricing, and WhatsApp routing for different restaurant branches.
- **️ Smart Categorization:** Products can appear in multiple categories (e.g., a "Burger Meal" appears in both *Burgers* and *Meals* tabs).
- **🛒 Advanced Cart System:** Persistent cart using LocalStorage, size selection (Normal/Spicy), and quantity management.
- **🛵 Flexible Order Types:** Choose between **Parcel (Pickup)** or **Delivery** (+5 SR fee). Delivery address fields are fully optional.
- **💬 WhatsApp Integration:** Automatically formats the order into a clean, structured text message and opens the WhatsApp API.
- ** High Performance:** Zero frameworks. Uses vanilla JS with debouncing, throttling, and GPU-accelerated CSS for buttery smooth 60fps animations.

## 🛠️ Tech Stack

- **HTML5** (Semantic structure)
- **CSS3** (Custom variables, Flexbox/Grid, Animations)
- **JavaScript (ES6+)** (State management, DOM manipulation, LocalStorage)
- **Google Fonts** (Playfair Display, Inter, Cairo, Cormorant Garamond)

## 📁 Project Structure

```text
chickbuck-menu/
├── index.html          # Main HTML structure
├── style.css           # All styling, animations, and responsive rules
├── script.js           # Application logic, menu data, and state management
├── README.md           # Project documentation
├── assets/
│   ├── chickbuck-logo.png      # Main logo
│   ├── chickbuck-logo1.png     # Mini header logo
│   └── loader-video.mp4        # 4-second intro video
└── IMAGE/
    ├── chicken-burger.jpg      # Product images
    ├── nuggets-sandwich.jpg
    └── ...
```

## 🚀 Getting Started

1. **Clone or Download** the project files.
2. **Add Images:** Ensure your product images are placed in the `IMAGE/` folder and logos/videos in the `assets/` folder.
3. **Run Locally:** 
   - Simply open `index.html` in any modern web browser.
   - For a better development experience, use the **Live Server** extension in VS Code.
4. **Deploy:** Upload the files to any static hosting provider (Netlify, Vercel, GitHub Pages, or cPanel).

## ⚙️ Customization Guide

### 1. Adding or Editing Products
Open `script.js` and find the `DATA.menus` object. 

**Single Category:**
```javascript
{ id: 'b1_p1', cat: 'BURGERS', name: 'Chicken Burger', price: 9, ... }
```

**Multiple Categories (e.g., appears in Burgers AND Meals):**
*Note: Use `cats` (plural) with square brackets `[]`.*
```javascript
{ id: 'b1_p2', cats: ['BURGERS', 'MEALS'], name: 'Chicken Burger Meal', price: 15, ... }
```

### 2. Setting Decimal Prices
If you need to set a price like **2.5 SR**, ensure you use a decimal point and update the formatting function if necessary.
```javascript
{ id: 'b1_p3', cat: 'SIDES', name: 'Sauce', price: 2.5, ... }
```

### 3. Adding Size Options (Normal / Spicy)
If a product has multiple sizes, use the `prices` object instead of `price`:
```javascript
{ 
  id: 'b1_p4', 
  cat: 'SANDWICHES', 
  name: 'Nuggets Sandwich', 
  prices: { Normal: 9, Spicy: 13 }, // This forces the user to choose a size
  ... 
}
```

### 4. Changing Colors
Open `style.css` and update the CSS variables at the top of the file:
```css
:root {
  --radical-red: #D71920;   /* Main Background / Accents */
  --dark-red: #7A0F14;      /* Borders / Hover States */
  --cream-white: #F5EBD9;   /* Cards / Modals / Text Backgrounds */
}
```

### 5. Adding a New Branch
In `script.js`, update the `DATA.branches` and `DATA.menus` objects:
```javascript
branches: {
  branch3: { name: "New Branch", nameAr: "الفرع الجديد", phone: "...", whatsapp: "..." }
},
menus: {
  branch3: [ /* Add your products here */ ]
}
```

## 📱 WhatsApp Order Format

When a user clicks "Send Order via WhatsApp", the app generates a message like this:

```text
🍗 *CHICK BUCK - NEW ORDER* 🍗

📍 *Branch:* Ameerfawaz- ruba Jeddah
 *Type:* Delivery (+5 SR)
👤 *Name:* John Doe
 *Phone:* 0501234567
🏢 *Building:* Al Yasmin Tower

━━━━━━━━━━━━━━━
*ORDER DETAILS:*
━━━━━━━━━━━━━━━

1. Chicken Burger Meal (Normal)
   2 × 15 SR = 30 SR

2. Nuggets Sandwich (Spicy)
   1 × 13 SR = 13 SR

━━━━━━━━━━━━━━━
🛵 *Delivery Fee:* 5 SR
💰 *TOTAL: 48 SR*
━━━━━━━━━━━━━━━
```

## 📄 License

This project is proprietary and built exclusively for **Chick Buck**. 
© 2026 Chick Buck. All Rights Reserved.