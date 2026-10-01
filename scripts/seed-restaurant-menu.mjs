/**
 * scripts/seed-restaurant-menu.mjs
 * ------------------------------------------------------------------
 * Seeds the real "Ghar Ki Rasoi" restaurant menu (from the owner's
 * printed menu card) into Firestore `menuCategories` + `menuItems`.
 *
 * Every item is context: "restaurant" (prices shown publicly) and
 * vegType: "veg" — this is a 100% pure vegetarian restaurant, no
 * non-veg items exist on the source menu at all.
 *
 * SAFE TO RE-RUN: categories and items use deterministic IDs derived
 * from their name (e.g. "restaurant-breakfast", "restaurant-breakfast-
 * kulhad-tea"), and the script uses `set({ merge: true })` rather than
 * creating new documents each time. Re-running it with updated prices
 * will update the existing items in place rather than duplicating them
 * — exactly what "prices can be modified later" needs. Any price/name
 * you then change by hand in /admin will NOT be overwritten unless you
 * re-run this script again with new data.
 *
 * Usage (from the project root, after .env.local is filled in):
 *   node --env-file=.env.local scripts/seed-restaurant-menu.mjs
 * ------------------------------------------------------------------
 */
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY.\n" +
      "Run with: node --env-file=.env.local scripts/seed-restaurant-menu.mjs"
  );
  process.exit(1);
}

initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const db = getFirestore();

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ---------------------------------------------------------------------
// CATEGORIES (in menu order)
// ---------------------------------------------------------------------
const categories = [
  "Breakfast",
  "Main Course",
  "Breads",
  "Rice",
  "Beverages",
  "Snacks",
  "Combo Bowls",
  "Thali",
  "Sweets",
];

// ---------------------------------------------------------------------
// ITEMS — grouped by category, in the exact order/prices from the menu.
// `price`: single price. `half`/`full`: Half|Full pricing. `note`: free
// text instead of a number (e.g. "MRP").
// ---------------------------------------------------------------------
const itemsByCategory = {
  Breakfast: [
    { name: "Kulhad Tea", price: 20 },
    { name: "Coffee", price: 40 },
    { name: "Bun + Makhan", price: 40 },
    { name: "Aloo Paratha", price: 40 },
    { name: "Onion Paratha", price: 60 },
    { name: "Paneer Paratha", price: 70 },
    { name: "Mix Paratha", price: 70, description: "Aloo + Onion + Paneer" },
    { name: "Chola Puri", price: 80, description: "4 pieces" },
    { name: "Chola Bhatura", price: 80, description: "2 pieces" },
    { name: "Aloo Sandwich", price: 40 },
    { name: "Paneer Sandwich", price: 60 },
  ],
  "Main Course": [
    { name: "Paneer Butter Masala", half: 140, full: 220 },
    { name: "Kadhai Paneer", half: 140, full: 220 },
    { name: "Matar Paneer", half: 120, full: 200 },
    { name: "Paneer Do Pyaza", half: 140, full: 220 },
    { name: "Dal Fry", half: 80, full: 120 },
    { name: "Dal Tadka", half: 90, full: 150 },
    { name: "Plain Dal", half: 70, full: 100 },
    { name: "Chola", half: 70, full: 100 },
    { name: "Rajma", half: 70, full: 100 },
    { name: "Mix Veg", half: 90, full: 150 },
    { name: "Aloo Matar", half: 80, full: 120 },
    { name: "Aloo Jeera", half: 70, full: 100 },
    { name: "Raita", half: 70, full: 100 },
    { name: "Mix Vegetable Raita", half: 90, full: 130 },
    { name: "Kadhi Pakoda", half: 80, full: 150, description: "Thursday only" },
  ],
  Breads: [
    { name: "Tawa Roti", price: 8 },
    { name: "Tawa Roti (Butter)", price: 10 },
    { name: "Multigrain Roti", price: 25 },
    { name: "Paratha", price: 20 },
    { name: "Puri", price: 10 },
  ],
  Rice: [
    { name: "Plain Rice", half: 60, full: 100 },
    { name: "Jeera Rice", half: 80, full: 120 },
  ],
  Beverages: [
    { name: "Water Bottle", note: "MRP" },
    { name: "Cold Drinks", note: "MRP" },
    { name: "Sikanji", price: 40 },
    { name: "Soda Sikanji", price: 50 },
    { name: "Chhachh", price: 40 },
    { name: "Cold Coffee", price: 80 },
    { name: "Strawberry Shake", price: 80 },
    { name: "Mango Shake", price: 60 },
    { name: "Banana Shake", price: 50 },
    { name: "Sweet Lassi", price: 60 },
    { name: "Mango Lassi", price: 80 },
    { name: "Strawberry Lassi", price: 80 },
  ],
  Snacks: [
    { name: "Onion Pakoda", price: 120 },
    { name: "Aloo Pakoda", price: 100 },
    { name: "Maggi", price: 40 },
    { name: "Masala Maggi", price: 60 },
  ],
  "Combo Bowls": [
    { name: "Chole Rice Bowl", price: 99 },
    { name: "Rajma Rice Bowl", price: 99 },
    { name: "Arhar Dal Rice Bowl", price: 99 },
    { name: "Kadhi Rice Bowl", price: 99, description: "Thursday only" },
  ],
  Thali: [
    {
      name: "Normal Thali",
      price: 100,
      description: "Dal, Rice, 4 Rotis, Raita, Salad, and Sabji. For one person — one refill of dal/sabji included.",
    },
    {
      name: "Deluxe Thali",
      price: 160,
      description:
        "Dal Fry, Jeera Rice, 4 Butter Rotis, Raita, Salad, Paneer Sabji, Sabji, Gulab Jamun / Vanilla Icecream. For one person — one refill of dal/sabji included.",
    },
  ],
  Sweets: [{ name: "Gulab Jamun", price: 25 }],
};

async function run() {
  console.log("Seeding restaurant menu (Ghar Ki Rasoi)...\n");
  const batch = db.batch();
  let categoryOrder = 0;

  for (const categoryName of categories) {
    const categoryId = `restaurant-${slugify(categoryName)}`;
    const categoryRef = db.collection("menuCategories").doc(categoryId);
    batch.set(
      categoryRef,
      {
        name: categoryName,
        slug: slugify(categoryName),
        context: "restaurant",
        published: true,
        displayOrder: categoryOrder++,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const items = itemsByCategory[categoryName] ?? [];
    let itemOrder = 0;
    for (const item of items) {
      const itemId = `restaurant-${slugify(categoryName)}-${slugify(item.name)}`;
      const itemRef = db.collection("menuItems").doc(itemId);
      batch.set(
        itemRef,
        {
          name: item.name,
          description: item.description ?? "",
          price: item.price ?? null,
          priceHalf: item.half ?? null,
          priceFull: item.full ?? null,
          priceNote: item.note ?? null,
          categoryId,
          context: "restaurant",
          vegType: "veg", // 100% pure vegetarian restaurant — no non-veg items exist
          imageUrl: null,
          featured: false,
          published: true,
          displayOrder: itemOrder++,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }
    console.log(`  ${categoryName}: ${items.length} items`);
  }

  await batch.commit();
  console.log("\nDone. Visit /admin/restaurant/categories and /admin/restaurant/menu to review and edit.");
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
