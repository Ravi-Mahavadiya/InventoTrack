import client from "./client";

/**
 * Fetches dashboard summary statistics from the server.
 * @returns {Promise<Object>} The dashboard summary payload.
 */
export async function getDashboard() {
  const { data } = await client.get("/dashboard");
  return data.data;
}
