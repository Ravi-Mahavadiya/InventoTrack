import client from "./client";

/**
 * Sends a login request to the server.
 * @param {Object} credentials - Login credentials.
 * @param {string} credentials.email - User's email.
 * @param {string} credentials.password - User's password.
 * @returns {Promise<Object>} The API response data.
 */
export async function login({ email, password }) {
  const { data } = await client.post("/auth/login", { email, password });
  return data.data; // { user, token }
}

/**
 * Sends a registration request to the server.
 * @param {Object} details - Registration details.
 * @param {string} details.name - User's name.
 * @param {string} details.email - User's email.
 * @param {string} details.password - User's password.
 * @returns {Promise<Object>} The API response data.
 */
export async function register({ name, email, password }) {
  const { data } = await client.post("/auth/register", { name, email, password });
  return data.data; // { user, token }
}

/**
 * Fetches the currently logged in user's profile.
 * @returns {Promise<Object>} The user profile object.
 */
export async function getMe() {
  const { data } = await client.get("/auth/me");
  return data.data;
}
