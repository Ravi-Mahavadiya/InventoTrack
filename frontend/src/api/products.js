import client from "./client";

/**
 * Fetches products from the server with search, filtering, sorting, and pagination.
 * @param {Object} [params] - Query parameters.
 * @returns {Promise<Object>} The products list and pagination payload.
 */
export async function getProducts(params) {
  const { data } = await client.get("/products", { params });
  return data.data; // { products, pagination }
}

/**
 * Fetches a single product by ID.
 * @param {string} id - Product ID.
 * @returns {Promise<Object>} The product details.
 */
export async function getProductById(id) {
  const { data } = await client.get(`/products/${id}`);
  return data.data;
}

/**
 * Creates a new product.
 * @param {Object} product - Product payload.
 * @returns {Promise<Object>} The created product.
 */
export async function createProduct(product) {
  const { data } = await client.post("/products", product);
  return data.data;
}

/**
 * Updates an existing product.
 * @param {string} id - Product ID.
 * @param {Object} product - Product updated fields.
 * @returns {Promise<Object>} The updated product.
 */
export async function updateProduct(id, product) {
  const { data } = await client.put(`/products/${id}`, product);
  return data.data;
}

/**
 * Adjusts a product's stock.
 * @param {string} id - Product ID.
 * @param {Object} payload - Stock adjustment details.
 * @param {string} payload.type - Adjustment type (INCREASE or DECREASE).
 * @param {number} payload.amount - Quantity adjustment amount.
 * @param {string} [payload.reason] - Reason description.
 * @returns {Promise<Object>} The adjusted product / transaction.
 */
export async function adjustStock(id, payload) {
  const { data } = await client.patch(`/products/${id}/stock`, payload);
  return data.data;
}

/**
 * Deletes a product.
 * @param {string} id - Product ID.
 * @returns {Promise<Object>} The server response details.
 */
export async function deleteProduct(id) {
  const { data } = await client.delete(`/products/${id}`);
  return data.data;
}
