/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

loadDotEnv();

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'staff'], default: 'staff' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sku: { type: String, unique: true, required: true },
    avgCostPrice: { type: Number, required: true },
    currentQty: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);

async function seed() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is required');
  }

  await mongoose.connect(mongoUri);

  const adminExists = await User.findOne({ username: 'admin' });
  if (!adminExists) {
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    await User.create({ username: 'admin', passwordHash, role: 'admin' });
    console.log('Seeded admin user: admin / Admin@123');
  }

  const products = [
    { name: 'Classic Tee', sku: 'TEE-001', avgCostPrice: 10, currentQty: 100, lowStockThreshold: 10 },
    { name: 'Denim Pants', sku: 'DENIM-001', avgCostPrice: 22, currentQty: 50, lowStockThreshold: 7 },
    { name: 'Sport Shoes', sku: 'SHOE-001', avgCostPrice: 35, currentQty: 30, lowStockThreshold: 5 },
  ];

  for (const product of products) {
    const exists = await Product.findOne({ sku: product.sku });
    if (!exists) {
      await Product.create(product);
    }
  }

  console.log('Seed complete.');
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});

function loadDotEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const eqIdx = trimmed.indexOf('=');
    if (eqIdx <= 0) {
      continue;
    }

    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}
