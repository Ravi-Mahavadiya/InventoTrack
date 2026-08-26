import Category from "./category.model.js";
import mongoose from "mongoose";

export const getAllCategories = async () => {
  const categories = await Category.find().sort({ name: 1 });
  
  // Dynamically count products assigned to each category
  const Product = mongoose.models.Product;
  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat) => {
      const productCount = Product ? await Product.countDocuments({ category: cat._id }) : 0;
      return {
        ...cat.toObject(),
        productCount,
      };
    })
  );

  return categoriesWithCounts;
};

export const getCategoryById = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    throw Object.assign(new Error("Category not found"), { status: 404 });
  }

  const Product = mongoose.models.Product;
  const productCount = Product ? await Product.countDocuments({ category: category._id }) : 0;

  return {
    ...category.toObject(),
    productCount,
  };
};

export const createCategory = async ({ name, description }) => {
  const existing = await Category.findOne({ name: new RegExp(`^${name.trim()}$`, "i") });
  if (existing) {
    throw Object.assign(new Error(`Category '${name}' already exists`), { status: 409 });
  }

  const category = await Category.create({ name: name.trim(), description });
  return category;
};

export const updateCategory = async (id, { name, description }) => {
  const category = await Category.findById(id);
  if (!category) {
    throw Object.assign(new Error("Category not found"), { status: 404 });
  }

  if (name && name.trim().toLowerCase() !== category.name.toLowerCase()) {
    const existing = await Category.findOne({ name: new RegExp(`^${name.trim()}$`, "i") });
    if (existing) {
      throw Object.assign(new Error(`Category '${name}' already exists`), { status: 409 });
    }
    category.name = name.trim();
    category.slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  }

  if (description !== undefined) {
    category.description = description;
  }

  await category.save();
  return category;
};

export const deleteCategory = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    throw Object.assign(new Error("Category not found"), { status: 404 });
  }

  // Prevent deletion if products exist in this category
  const Product = mongoose.models.Product;
  if (Product) {
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      throw Object.assign(
        new Error(`Cannot delete category. There are ${productCount} product(s) associated with it.`),
        { status: 400 }
      );
    }
  }

  await Category.findByIdAndDelete(id);
  return { message: "Category deleted successfully" };
};
