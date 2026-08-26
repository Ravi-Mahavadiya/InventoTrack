import client from "./client";

/**
 * Fetches all categories.
 * @returns {Promise<Array>} List of categories.
 */
export async function getCategories() {
  const { data } = await client.get("/categories");
  return data.data;
}

/**
 * Creates a new category.
 * @param {Object} category - The category payload.
 * @returns {Promise<Object>} The created category.
 */
export async function createCategory(category) {
  const { data } = await client.post("/categories", category);
  return data.data;
}

/**
 * Updates an existing category.
 * @param {string} id - The category ID.
 * @param {Object} category - The updated fields.
 * @returns {Promise<Object>} The updated category.
 */
export async function updateCategory(id, category) {
  const { data } = await client.put(`/categories/${id}`, category);
  return data.data;
}

/**
 * Deletes a category.
 * @param {string} id - The category ID.
 * @returns {Promise<Object>} The server response.
 */
export async function deleteCategory(id) {
  const { data } = await client.delete(`/categories/${id}`);
  return data.data;
}
