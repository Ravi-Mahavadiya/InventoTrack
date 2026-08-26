import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../modules/categories/category.model.js";
import Product from "../modules/products/product.model.js";
import Transaction from "../modules/transactions/transaction.model.js";
import User from "../modules/users/user.model.js";

dotenv.config();

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/inventro_track";

async function runSeed() {
  console.log("Connecting to MongoDB database at:", mongoUri);
  try {
    await mongoose.connect(mongoUri);
    console.log("Database connected successfully.");

    // Clean existing data
    console.log("Cleaning existing Category, Product, and Transaction collections...");
    await Transaction.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log("Collections cleared.");

    // Find any user to assign transaction logs to
    const defaultUser = await User.findOne({});
    const userId = defaultUser ? defaultUser._id : null;
    if (userId) {
      console.log(`Transactions will be linked to user: ${defaultUser.name} (${defaultUser.email})`);
    } else {
      console.log("Warning: No user found. Transactions will be created without linked users.");
    }

    // 1. Seed Categories
    console.log("Seeding Categories...");
    const electronics = await Category.create({ name: "Electronics", description: "Tech gadgets, gear, and digital devices" });
    const furniture = await Category.create({ name: "Furniture", description: "Home and office workspace furniture" });
    const officeSupplies = await Category.create({ name: "Office Supplies", description: "Stationery, notebooks, and writing utilities" });
    const fitness = await Category.create({ name: "Fitness Gear", description: "Workout weights, resistance bands, and active items" });

    // 2. Seed Products
    console.log("Seeding Products...");
    // Electronics
    const mbp = await Product.create({
      name: "MacBook Pro 16\"",
      sku: "ELEC-MBP-16",
      category: electronics._id,
      description: "Apple M3 Pro chip, 18GB Unified Memory, 512GB SSD",
      quantity: 25,
      unitPrice: 2499.99,
      supplierName: "Apple Inc.",
      lowStockThreshold: 5
    });

    const keychron = await Product.create({
      name: "Keychron K2 Keyboard",
      sku: "ELEC-KEY-K2",
      category: electronics._id,
      description: "Wireless mechanical keyboard with Gateron brown switches",
      quantity: 4,
      unitPrice: 89.99,
      supplierName: "Keychron Co.",
      lowStockThreshold: 10 // Quantity (4) is below threshold (10) -> Low Stock!
    });

    const usbHub = await Product.create({
      name: "Anker USB-C Hub 8-in-1",
      sku: "ELEC-HUB-01",
      category: electronics._id,
      description: "Dual HDMI, 100W Power Delivery, SD/TF Card slots",
      quantity: 0,
      unitPrice: 39.99,
      supplierName: "Anker Innovations",
      lowStockThreshold: 10 // Quantity (0) is 0 -> Out of Stock!
    });

    // Furniture
    const chair = await Product.create({
      name: "Ergonomic Office Chair",
      sku: "FURN-CHAIR-02",
      category: furniture._id,
      description: "Breathable mesh back with adjustable lumber support",
      quantity: 15,
      unitPrice: 189.50,
      supplierName: "Steelcase",
      lowStockThreshold: 5
    });

    const desk = await Product.create({
      name: "Standing Desk Dual-Motor",
      sku: "FURN-DESK-01",
      category: furniture._id,
      description: "Height adjustable wood top desk, pre-set memory controller",
      quantity: 8,
      unitPrice: 499.00,
      supplierName: "Fully Workspace",
      lowStockThreshold: 10 // Quantity (8) is below threshold (10) -> Low Stock!
    });

    // Office Supplies
    const pens = await Product.create({
      name: "Gel Ink Pens (12-pack)",
      sku: "OFFC-PEN-12",
      category: officeSupplies._id,
      description: "0.5mm extra fine needle point, quick-dry black ink",
      quantity: 120,
      unitPrice: 12.99,
      supplierName: "Pilot Pen Corp",
      lowStockThreshold: 20
    });

    const notebook = await Product.create({
      name: "A5 Dotted Notebook",
      sku: "OFFC-NOTE-A5",
      category: officeSupplies._id,
      description: "160 pages dotted grids, 120gsm ink-proof paper",
      quantity: 50,
      unitPrice: 9.50,
      supplierName: "Moleskine",
      lowStockThreshold: 15
    });

    // 3. Seed Stock Management Transactions
    console.log("Seeding Stock Transactions history...");

    // Keychron Keyboard Transactions
    await Transaction.create([
      {
        product: keychron._id,
        type: "INCREASE",
        quantity: 10,
        previousQuantity: 0,
        newQuantity: 10,
        reason: "Initial purchase order stocking",
        user: userId
      },
      {
        product: keychron._id,
        type: "DECREASE",
        quantity: 6,
        previousQuantity: 10,
        newQuantity: 4,
        reason: "Customer sale order #11054",
        user: userId
      }
    ]);

    // MacBook Pro Transactions
    await Transaction.create({
      product: mbp._id,
      type: "INCREASE",
      quantity: 25,
      previousQuantity: 0,
      newQuantity: 25,
      reason: "Supplier direct delivery",
      user: userId
    });

    // Anker Hub Transactions (went to 5, then reduced to 0)
    await Transaction.create([
      {
        product: usbHub._id,
        type: "INCREASE",
        quantity: 5,
        previousQuantity: 0,
        newQuantity: 5,
        reason: "Trial inventory import",
        user: userId
      },
      {
        product: usbHub._id,
        type: "DECREASE",
        quantity: 5,
        previousQuantity: 5,
        newQuantity: 0,
        reason: "Defective units batch recall",
        user: userId
      }
    ]);

    // Standing Desk Transactions
    await Transaction.create([
      {
        product: desk._id,
        type: "INCREASE",
        quantity: 12,
        previousQuantity: 0,
        newQuantity: 12,
        reason: "Warehouse transfer",
        user: userId
      },
      {
        product: desk._id,
        type: "DECREASE",
        quantity: 4,
        previousQuantity: 12,
        newQuantity: 8,
        reason: "Bulk workstation setup order #205",
        user: userId
      }
    ]);

    console.log("Dummy seed data inserted successfully!");
  } catch (err) {
    console.error("Seeding operation failed:", err);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

runSeed();
