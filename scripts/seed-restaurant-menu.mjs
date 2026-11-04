/**
 * Seeds / updates the "Ghar Ki Rasoi" restaurant menu in Firestore.
 *
 * Run:        npm run seed:menu
 * Preview:    npm run seed:menu -- --dry-run     (prints changes, writes nothing)
 *
 * Behaviour (safe to re-run):
 *  - Items are matched by a deterministic ID (restaurant-<category>-<item>).
 *  - Existing items: name/description/prices/category/order are updated to match
 *    this file. Their photo, featured flag and published flag are NOT touched.
 *  - New items are created (published, no photo, not featured).
 *  - Items this script created earlier that are no longer on the menu are deleted.
 *    Items you added by hand in /admin are never deleted.
 *  - Everything is vegetarian (pure veg restaurant).
 */
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const DRY = process.argv.includes("--dry-run");
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
if (!projectId || !clientEmail || !privateKey) {
  console.error("Missing FIREBASE_* variables. Run: npm run seed:menu");
  process.exit(1);
}
initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const db = getFirestore();

const slug = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// price = single price | half/full = Half|Full | note = text such as "MRP"
const MENU = {
  Breakfast: [
    { name: "Kulhad Tea", price: 25 },
    { name: "Coffee", price: 40 },
    { name: "Bun + Makhan", price: 40 },
    { name: "Chola Puri", price: 80, description: "4 pieces" },
    { name: "Chola Bhatura", price: 80, description: "2 pieces" },
    { name: "Aloo Sandwich", price: 40 },
    { name: "Paneer Sandwich", price: 60 },
    { name: "Besan Chilla", price: 50 },
    { name: "Veg Omelette", price: 70 },
  ],
  Paratha: [
    { name: "Aloo Paratha", price: 50 },
    { name: "Onion Paratha", price: 70 },
    { name: "Paneer Paratha", price: 80 },
    { name: "Gobhi Paratha", price: 70 },
    { name: "Muli Paratha", price: 70 },
    { name: "Mix Paratha", price: 100, description: "Aloo + Onion + Paneer" },
  ],
  Snacks: [
    { name: "Burger", price: 50 },
    { name: "French Fries", price: 120 },
    { name: "Maggi", price: 50 },
    { name: "Masala Maggi", price: 70 },
    { name: "Idli Sambhar", price: 80 },
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
  ],
  "Main Course": [
    { name: "Shahi Paneer", half: 160, full: 250 },
    { name: "Paneer Butter Masala", half: 140, full: 220 },
    { name: "Kadhai Paneer", half: 140, full: 220 },
    { name: "Paneer Do Pyaza", half: 140, full: 220 },
    { name: "Matar Paneer", half: 120, full: 200 },
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
    { name: "Kadhi Pakoda", half: 100, full: 150, description: "Thursday only" },
  ],
  Rice: [
    { name: "Plain Rice", half: 60, full: 100 },
    { name: "Jeera Rice", half: 80, full: 120 },
  ],
  Breads: [
    { name: "Tawa Roti", price: 8 },
    { name: "Tawa Roti (Butter)", price: 10 },
    { name: "Multigrain Roti", price: 30 },
    { name: "Paratha", price: 25 },
    { name: "Puri", price: 10 },
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
      description: "Dal, Rice, 4 Rotis, Raita, Salad, and Sabji. One thali per person; one refill of dal/sabji.",
    },
    {
      name: "Deluxe Thali",
      price: 160,
      description:
        "Dal Fry, Jeera Rice, 4 Butter Rotis, Raita, Salad, Paneer Sabji, Sabji, Gulab Jamun / Vanilla Icecream. One thali per person; one refill of dal/sabji.",
    },
  ],
  Sweets: [{ name: "Gulab Jamun", price: 25 }],
};

async function run() {
  console.log(DRY ? "DRY RUN - nothing will be written\n" : "Updating menu...\n");

  const [catSnap, itemSnap] = await Promise.all([
    db.collection("menuCategories").where("context", "==", "restaurant").get(),
    db.collection("menuItems").where("context", "==", "restaurant").get(),
  ]);
  const existingCats = new Set(catSnap.docs.map((d) => d.id));
  const existingItems = new Map(itemSnap.docs.map((d) => [d.id, d.data().name]));

  const ops = []; // { ref, data } | { ref, del: true }
  const wantCats = new Set();
  const wantItems = new Set();
  let created = 0, updated = 0;

  Object.keys(MENU).forEach((catName, catIdx) => {
    const catId = `restaurant-${slug(catName)}`;
    wantCats.add(catId);
    const catRef = db.collection("menuCategories").doc(catId);
    const catData = {
      name: catName, slug: slug(catName), context: "restaurant",
      displayOrder: catIdx, updatedAt: FieldValue.serverTimestamp(),
    };
    if (!existingCats.has(catId)) catData.published = true;
    ops.push({ ref: catRef, data: catData });

    MENU[catName].forEach((item, itemIdx) => {
      const id = `restaurant-${slug(catName)}-${slug(item.name)}`;
      wantItems.add(id);
      const data = {
        name: item.name,
        description: item.description ?? "",
        price: item.price ?? null,
        priceHalf: item.half ?? null,
        priceFull: item.full ?? null,
        priceNote: item.note ?? null,
        categoryId: catId,
        context: "restaurant",
        vegType: "veg",
        displayOrder: itemIdx,
        updatedAt: FieldValue.serverTimestamp(),
      };
      if (existingItems.has(id)) {
        updated++;
      } else {
        created++;
        Object.assign(data, { imageUrl: null, featured: false, published: true });
      }
      ops.push({ ref: db.collection("menuItems").doc(id), data });
    });
  });

  const staleItems = [...existingItems].filter(([id]) => id.startsWith("restaurant-") && !wantItems.has(id));
  const staleCats = [...existingCats].filter((id) => id.startsWith("restaurant-") && !wantCats.has(id));
  staleItems.forEach(([id]) => ops.push({ ref: db.collection("menuItems").doc(id), del: true }));
  staleCats.forEach((id) => ops.push({ ref: db.collection("menuCategories").doc(id), del: true }));

  console.log(`Items: ${created} new, ${updated} updated, ${staleItems.length} removed`);
  if (staleItems.length) console.log("Removed:", staleItems.map(([, n]) => n).join(", "));
  if (staleCats.length) console.log("Removed categories:", staleCats.join(", "));

  if (DRY) return console.log("\nDry run complete.");

  for (let i = 0; i < ops.length; i += 400) {
    const batch = db.batch();
    ops.slice(i, i + 400).forEach((op) =>
      op.del ? batch.delete(op.ref) : batch.set(op.ref, op.data, { merge: true })
    );
    await batch.commit();
  }
  console.log("\nDone. Review in /admin/restaurant/menu");
}

run().catch((e) => { console.error("Seed failed:", e); process.exit(1); });