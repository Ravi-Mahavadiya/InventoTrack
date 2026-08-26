import mongoose from "mongoose";
import * as productService from "../modules/products/product.service.js";
import * as categoryService from "../modules/categories/category.service.js";
import Product from "../modules/products/product.model.js";
import Category from "../modules/categories/category.model.js";
import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/inventro_track_test";

describe("Product Service & CSV Operations", () => {
  let categoryId;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    // Clean collections
    await Product.deleteMany({});
    await Category.deleteMany({});

    // Setup initial test category
    const cat = await Category.create({ name: "Electronics", description: "Gadgets and devices" });
    categoryId = cat._id;
  });

  afterAll(async () => {
    // Clean up collections and close connection
    await Product.deleteMany({});
    await Category.deleteMany({});
    await mongoose.connection.close();
  });

  test("should successfully create a new product", async () => {
    const productData = {
      name: "Wireless Headphones",
      sku: "ELEC-HDPH-001",
      category: categoryId.toString(),
      description: "Noise cancelling over-ear headphones",
      quantity: 50,
      unitPrice: 99.99,
      supplierName: "Logitech",
      lowStockThreshold: 10,
    };

    const product = await productService.createProduct(productData);
    expect(product).toBeDefined();
    expect(product.name).toBe("Wireless Headphones");
    expect(product.sku).toBe("ELEC-HDPH-001");
    expect(product.status).toBe("In Stock");
  });

  test("should fail to create a product with duplicate SKU", async () => {
    const productData = {
      name: "Wireless Earbuds",
      sku: "ELEC-HDPH-001", // Duplicate SKU
      category: categoryId.toString(),
      quantity: 20,
      unitPrice: 49.99,
      supplierName: "Logitech",
    };

    await expect(productService.createProduct(productData)).rejects.toThrow(
      "already exists"
    );
  });

  test("should fail to create a product with negative unit price", async () => {
    const productData = {
      name: "Incorrect Price Product",
      sku: "ELEC-INVR-002",
      category: categoryId.toString(),
      quantity: 20,
      unitPrice: -5.0, // Invalid price
      supplierName: "Logitech",
    };

    // Mongoose schema validation will catch negative price
    await expect(Product.create(productData)).rejects.toThrow();
  });

  test("should generate valid CSV text for export", async () => {
    const csvContent = await productService.generateCSV();
    expect(csvContent).toContain("Name,SKU,Category,Description,Quantity,UnitPrice,SupplierName");
    expect(csvContent).toContain("Wireless Headphones");
    expect(csvContent).toContain("ELEC-HDPH-001");
  });

  test("should successfully import products from CSV string (upsert & auto-create categories)", async () => {
    const csvData = `Name,SKU,Category,Description,Quantity,UnitPrice,SupplierName
Wireless Headphones,ELEC-HDPH-001,Electronics,Noise cancelling over-ear,60,99.99,Logitech
Home Speaker,HOME-SPKR-002,Smart Home,Google Home Smart Speaker,15,129.99,Google`;

    const report = await productService.parseAndImportCSV(csvData);
    expect(report.successCount).toBe(2);
    expect(report.failedCount).toBe(0);
    expect(report.errors).toHaveLength(0);

    // Verify Speaker was created
    const speaker = await Product.findOne({ sku: "HOME-SPKR-002" }).populate("category");
    expect(speaker).toBeDefined();
    expect(speaker.name).toBe("Home Speaker");
    expect(speaker.category.name).toBe("Smart Home"); // Created dynamically

    // Verify Headphones quantity was updated (upserted) from 50 to 60
    const headphones = await Product.findOne({ sku: "ELEC-HDPH-001" });
    expect(headphones.quantity).toBe(60);
  });

  test("should capture validation errors during CSV import", async () => {
    const csvData = `Name,SKU,Category,Description,Quantity,UnitPrice,SupplierName
,ELEC-ERR-003,Electronics,Missing Name,10,19.99,Logitech
Invalid Price Product,ELEC-ERR-004,Electronics,Invalid price,10,-19.99,Logitech`;

    const report = await productService.parseAndImportCSV(csvData);
    expect(report.successCount).toBe(0);
    expect(report.failedCount).toBe(2);
    expect(report.errors).toHaveLength(2);
    expect(report.errors[0]).toContain("Name is required");
    expect(report.errors[1]).toContain("Unit price must be a positive number");
  });
});
