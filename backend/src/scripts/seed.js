import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../modules/categories/category.model.js";
import Product from "../modules/products/product.model.js";
import Transaction from "../modules/transactions/transaction.model.js";
import User from "../modules/users/user.model.js";
import Role from "../modules/roles/role.model.js";
import Permission from "../modules/permissions/permission.model.js";
import RolePermission from "../modules/roles/rolePermission.model.js";
import { hashPassword } from "../utils/password.js";

dotenv.config();

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/inventro_track";

async function runSeed() {
  console.log("Connecting to MongoDB database at:", mongoUri);
  try {
    await mongoose.connect(mongoUri);
    console.log("Database connected successfully.");

    // Clean existing data
    console.log("Cleaning existing collections...");
    await Transaction.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await RolePermission.deleteMany({});
    await Permission.deleteMany({});
    await User.deleteMany({});
    await Role.deleteMany({});
    console.log("Collections cleared.");

    // 1. Seed Roles
    console.log("Seeding Roles...");
    const adminRole = await Role.create({ name: "ADMIN" });
    const managerRole = await Role.create({ name: "INVENTORY_MANAGER" });
    const staffRole = await Role.create({ name: "STAFF" });

    // 2. Seed Permissions
    console.log("Seeding Permissions...");
    const modules = ["PRODUCT", "CATEGORY", "STOCK_TRANSACTION", "USER"];
    const permissionDocs = {};

    for (const mod of modules) {
      permissionDocs[mod] = {
        ADMIN: await Permission.create({
          module: mod,
          can_create: mod !== "STOCK_TRANSACTION",
          can_view: mod !== "STOCK_TRANSACTION",
          can_edit: true, // Admin can edit all, including STOCK_TRANSACTION
          can_delete: mod !== "STOCK_TRANSACTION"
        }),
        INVENTORY_MANAGER: await Permission.create({
          module: mod,
          can_create: false,
          can_view: mod === "PRODUCT",
          can_edit: mod === "STOCK_TRANSACTION",
          can_delete: false
        }),
        STAFF: await Permission.create({
          module: mod,
          can_create: mod === "PRODUCT" || mod === "CATEGORY",
          can_view: mod === "PRODUCT" || mod === "CATEGORY",
          can_edit: mod === "PRODUCT" || mod === "CATEGORY",
          can_delete: mod === "PRODUCT" || mod === "CATEGORY"
        })
      };
    }

    // 3. Seed Role-Permissions mappings
    console.log("Establishing Role-Permission relationships...");
    for (const mod of modules) {
      // Admin mappings
      await RolePermission.create({
        role: adminRole._id,
        permission: permissionDocs[mod].ADMIN._id
      });
      // Manager mappings
      await RolePermission.create({
        role: managerRole._id,
        permission: permissionDocs[mod].INVENTORY_MANAGER._id
      });
      // Staff mappings
      await RolePermission.create({
        role: staffRole._id,
        permission: permissionDocs[mod].STAFF._id
      });
    }

    // 4. Seed Default Users with correct hashed passwords
    console.log("Seeding default users...");
    const adminPass = await hashPassword("AdminPass123!");
    const managerPass = await hashPassword("ManagerPass123!");
    const staffPass = await hashPassword("StaffPass123!");

    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@inventotrack.com",
      password: adminPass,
      role: adminRole._id
    });

    const managerUser = await User.create({
      name: "Inventory Manager",
      email: "manager@inventotrack.com",
      password: managerPass,
      role: managerRole._id
    });

    const staffUser = await User.create({
      name: "Staff User",
      email: "staff@inventotrack.com",
      password: staffPass,
      role: staffRole._id
    });

    console.log("Default accounts created:");
    console.log(" - Admin: admin@inventotrack.com / AdminPass123!");
    console.log(" - Manager: manager@inventotrack.com / ManagerPass123!");
    console.log(" - Staff: staff@inventotrack.com / StaffPass123!");

    // 5. Seed Categories
    console.log("Seeding Categories...");
    const electronics = await Category.create({ name: "Electronics", description: "Tech gadgets, gear, and digital devices" });
    const furniture = await Category.create({ name: "Furniture", description: "Home and office workspace furniture" });
    const officeSupplies = await Category.create({ name: "Office Supplies", description: "Stationery, notebooks, and writing utilities" });
    const fitness = await Category.create({ name: "Fitness Gear", description: "Workout weights, resistance bands, and active items" });

    // 6. Seed Products
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
      lowStockThreshold: 10
    });

    const usbHub = await Product.create({
      name: "Anker USB-C Hub 8-in-1",
      sku: "ELEC-HUB-01",
      category: electronics._id,
      description: "Dual HDMI, 100W Power Delivery, SD/TF Card slots",
      quantity: 0,
      unitPrice: 39.99,
      supplierName: "Anker Innovations",
      lowStockThreshold: 10
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
      lowStockThreshold: 10
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

    // 7. Seed Stock Management Transactions
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
        user: adminUser._id
      },
      {
        product: keychron._id,
        type: "DECREASE",
        quantity: 6,
        previousQuantity: 10,
        newQuantity: 4,
        reason: "Customer sale order #11054",
        user: adminUser._id
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
      user: adminUser._id
    });

    // Anker Hub Transactions
    await Transaction.create([
      {
        product: usbHub._id,
        type: "INCREASE",
        quantity: 5,
        previousQuantity: 0,
        newQuantity: 5,
        reason: "Trial inventory import",
        user: adminUser._id
      },
      {
        product: usbHub._id,
        type: "DECREASE",
        quantity: 5,
        previousQuantity: 5,
        newQuantity: 0,
        reason: "Defective units batch recall",
        user: adminUser._id
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
        user: adminUser._id
      },
      {
        product: desk._id,
        type: "DECREASE",
        quantity: 4,
        previousQuantity: 12,
        newQuantity: 8,
        reason: "Bulk workstation setup order #205",
        user: adminUser._id
      }
    ]);

    console.log("Database seeded successfully with RBAC roles, default users, and sample inventory!");
  } catch (err) {
    console.error("Seeding operation failed:", err);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

runSeed();
