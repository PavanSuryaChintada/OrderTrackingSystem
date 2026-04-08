const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

async function parseJsonResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || "Request failed";
    throw new Error(message);
  }

  return data;
}

export async function fetchOrders() {
  const response = await fetch(`${API_BASE_URL}/orders`);
  return parseJsonResponse(response);
}

export async function fetchOrderById(orderId) {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
  return parseJsonResponse(response);
}
