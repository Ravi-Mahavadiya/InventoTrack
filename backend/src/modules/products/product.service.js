import Product, { computeStockStatus } from "./product.model.js";
import Category from "../categories/category.model.js";
import QRCode from "qrcode";
import ExcelJS from "exceljs";

export const getProducts = async (query = {}) => {
  const {
    search,
    category,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = query;

  const filter = {};

  // Search by name or SKU
  if (search) {
    const searchRegex = new RegExp(search.trim(), "i");
    filter.$or = [{ name: searchRegex }, { sku: searchRegex }];
  }

  // Filter by Category
  if (category) {
    filter.category = category;
  }

  // Filter by Status
  if (status) {
    filter.status = status;
  }

  // Sorting setup
  const allowedSortFields = ["name", "quantity", "unitPrice", "createdAt", "status"];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const order = sortOrder === "asc" ? 1 : -1;
  const sortOptions = { [sortField]: order };

  // Pagination setup
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (pageNum - 1) * limitNum;

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate("category", "name slug")
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum);

  return {
    products,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

export const getProductById = async (id) => {
  const product = await Product.findById(id).populate("category", "name description slug");
  if (!product) {
    throw Object.assign(new Error("Product not found"), { status: 404 });
  }
  return product;
};

export const createProduct = async (data) => {
  const formattedSku = data.sku.trim().toUpperCase();

  // Check unique SKU
  const existingSku = await Product.findOne({ sku: formattedSku });
  if (existingSku) {
    throw Object.assign(new Error(`Product with SKU '${formattedSku}' already exists`), { status: 409 });
  }

  // Verify category exists
  const categoryExists = await Category.findById(data.category);
  if (!categoryExists) {
    throw Object.assign(new Error("Selected category does not exist"), { status: 400 });
  }

  const threshold = data.lowStockThreshold !== undefined ? data.lowStockThreshold : 10;
  const status = computeStockStatus(data.quantity, threshold);

  const product = await Product.create({
    ...data,
    sku: formattedSku,
    status,
  });

  return await product.populate("category", "name slug");
};

export const updateProduct = async (id, data) => {
  const product = await Product.findById(id);
  if (!product) {
    throw Object.assign(new Error("Product not found"), { status: 404 });
  }

  if (data.sku) {
    const formattedSku = data.sku.trim().toUpperCase();
    if (formattedSku !== product.sku) {
      const existingSku = await Product.findOne({ sku: formattedSku });
      if (existingSku) {
        throw Object.assign(new Error(`Product with SKU '${formattedSku}' already exists`), { status: 409 });
      }
      product.sku = formattedSku;
    }
  }

  if (data.category && data.category !== product.category.toString()) {
    const categoryExists = await Category.findById(data.category);
    if (!categoryExists) {
      throw Object.assign(new Error("Selected category does not exist"), { status: 400 });
    }
    product.category = data.category;
  }

  if (data.name !== undefined) product.name = data.name.trim();
  if (data.description !== undefined) product.description = data.description;
  if (data.unitPrice !== undefined) product.unitPrice = data.unitPrice;
  if (data.supplierName !== undefined) product.supplierName = data.supplierName;
  if (data.lowStockThreshold !== undefined) product.lowStockThreshold = data.lowStockThreshold;

  if (data.quantity !== undefined) {
    product.quantity = data.quantity;
  }

  // Re-calculate status
  product.status = computeStockStatus(product.quantity, product.lowStockThreshold);

  await product.save();
  return await product.populate("category", "name slug");
};

export const deleteProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    throw Object.assign(new Error("Product not found"), { status: 404 });
  }

  await Product.findByIdAndDelete(id);
  return { message: "Product deleted successfully" };
};

// Excel Export Workbook Generator
export const generateExcel = async () => {
  const products = await Product.find().populate("category", "name");
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Inventory");

  // Define columns
  worksheet.columns = [
    { header: "Name", key: "name", width: 25 },
    { header: "SKU", key: "sku", width: 15 },
    { header: "Category", key: "category", width: 18 },
    { header: "Description", key: "description", width: 30 },
    { header: "Quantity", key: "quantity", width: 12 },
    { header: "Unit Price", key: "unitPrice", width: 15 },
    { header: "Supplier Name", key: "supplierName", width: 22 }
  ];

  // Populating rows
  for (const p of products) {
    worksheet.addRow({
      name: p.name,
      sku: p.sku,
      category: p.category?.name || "Uncategorized",
      description: p.description || "",
      quantity: p.quantity,
      unitPrice: p.unitPrice,
      supplierName: p.supplierName || ""
    });
  }

  // Format headers (Row 1)
  const headerRow = worksheet.getRow(1);
  headerRow.height = 25;
  headerRow.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4F46E5" } // Theme Indigo color
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };

  // Explicitly lock the header row
  headerRow.eachCell((cell) => {
    cell.protection = { locked: true };
  });

  // Protect the sheet with a default password, enabling cell selections
  await worksheet.protect("inventra_secret", {
    selectLockedCells: true,
    selectUnlockedCells: true
  });

  // Unlock all other data cells
  for (let i = 2; i <= products.length + 1; i++) {
    const row = worksheet.getRow(i);
    row.eachCell((cell) => {
      cell.protection = { locked: false };
    });
  }

  // Set number format for Unit Price column (Column 6)
  worksheet.getColumn(6).numFmt = "$#,##0.00";

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

// CSV Importer / Parser
export const parseAndImportCSV = async (csvText) => {
  const lines = csvText.split(/\r?\n/);
  if (lines.length === 0 || !lines[0].trim()) {
    throw Object.assign(new Error("Empty CSV content"), { status: 400 });
  }

  // Parse CSV Line Helper supporting commas and quotes
  const parseCSVLine = (line) => {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === "\"") {
        if (inQuotes && line[i + 1] === "\"") {
          current += "\"";
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
  const nameIdx = headers.indexOf("name");
  const skuIdx = headers.indexOf("sku");
  const categoryIdx = headers.indexOf("category");
  const descIdx = headers.indexOf("description");
  const qtyIdx = headers.indexOf("quantity");
  const priceIdx = headers.indexOf("unitprice");
  const supplierIdx = headers.indexOf("suppliername");

  if (nameIdx === -1 || skuIdx === -1) {
    throw Object.assign(new Error("CSV must contain 'Name' and 'SKU' columns"), { status: 400 });
  }

  let successCount = 0;
  let failedCount = 0;
  const errors = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // skip empty lines

    const cells = parseCSVLine(line);
    const rowNum = i + 1;

    try {
      const name = cells[nameIdx];
      const sku = cells[skuIdx]?.toUpperCase();
      const catName = categoryIdx !== -1 ? cells[categoryIdx] : "";
      const description = descIdx !== -1 ? cells[descIdx] : "";
      const quantityStr = qtyIdx !== -1 ? cells[qtyIdx] : "0";
      const priceStr = priceIdx !== -1 ? cells[priceIdx] : "0";
      const supplierName = supplierIdx !== -1 ? cells[supplierIdx] : "";

      // Validations
      if (!name) {
        throw new Error(`Row ${rowNum}: Name is required`);
      }
      if (!sku) {
        throw new Error(`Row ${rowNum}: SKU is required`);
      }

      const quantity = parseInt(quantityStr, 10);
      if (isNaN(quantity) || quantity < 0) {
        throw new Error(`Row ${rowNum}: Quantity must be a positive integer`);
      }

      const unitPrice = parseFloat(priceStr);
      if (isNaN(unitPrice) || unitPrice < 0) {
        throw new Error(`Row ${rowNum}: Unit price must be a positive number`);
      }

      // Find or Create Category
      let categoryId = null;
      if (catName) {
        let category = await Category.findOne({ name: new RegExp(`^${catName.trim()}$`, "i") });
        if (!category) {
          category = await Category.create({ name: catName.trim() });
        }
        categoryId = category._id;
      } else {
        // Fallback default category
        let defaultCategory = await Category.findOne({ name: "Uncategorized" });
        if (!defaultCategory) {
          defaultCategory = await Category.create({ name: "Uncategorized", description: "Default classification" });
        }
        categoryId = defaultCategory._id;
      }

      // Upsert Product by SKU
      const threshold = 10;
      const status = computeStockStatus(quantity, threshold);
      const productData = {
        name,
        sku,
        category: categoryId,
        description,
        quantity,
        unitPrice,
        supplierName,
        status,
        lowStockThreshold: threshold
      };

      const existingProduct = await Product.findOne({ sku });
      if (existingProduct) {
        await Product.findByIdAndUpdate(existingProduct._id, productData);
      } else {
        await Product.create(productData);
      }

      successCount++;
    } catch (err) {
      failedCount++;
      errors.push(err.message);
    }
  }

  return { successCount, failedCount, errors };
};

export const generateProductQRCode = async (id) => {
  const product = await Product.findById(id).populate("category");
  if (!product) {
    throw Object.assign(new Error("Product not found"), { status: 404 });
  }

  const priceText = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(product.unitPrice);
  const text = `SKU: ${product.sku}\nNAME: ${product.name}\nPRICE: ${priceText}`;

  const dataUrl = await QRCode.toDataURL(text, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: 250,
  });
  return dataUrl;
};
