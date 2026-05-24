// GSR Homeocare — MongoDB seed script
// Run: mongosh "YOUR_MONGODB_URI" --file gsr_homeocare_mongodb.js

const ORG_ID = "6a126d53e091a2b24b63a82c";
const DB_NAME = "gsr_homeocare_db";

use(DB_NAME);

db.products.deleteMany({ organizationId: ORG_ID });

db.products.insertMany([
  {
    organizationId: ORG_ID,
    name: "Arnica Montana 30C",
    price: 249.0,
    description: "Homeopathic remedy for bruises, muscle soreness, and minor injuries.",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400"
  },
  {
    organizationId: ORG_ID,
    name: "Physiotherapy Massage Oil",
    price: 399.0,
    description: "Natural herbal oil for pain relief and muscle relaxation.",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400"
  },
  {
    organizationId: ORG_ID,
    name: "Immunity Booster Drops",
    price: 199.0,
    description: "Daily homeopathic drops to support natural immunity.",
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400"
  }
]);

print("MongoDB seeded for organization: " + ORG_ID);
