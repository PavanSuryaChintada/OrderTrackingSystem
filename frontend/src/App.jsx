import { useEffect, useState } from "react";
import { fetchOrders } from "./api/ordersApi";
import "./index.css";

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
}

function App() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");
      const data = await fetchOrders();
      setOrders(data.orders || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <h1>Order Tracking System</h1>
          <p>Track orders across the fixed lifecycle: Placed, Packed, Shipped, Delivered.</p>
        </div>
        <button type="button" onClick={loadOrders} className="refresh-button">
          Refresh
        </button>
      </header>

      <section className="panel">
        <h2>Orders</h2>

        {loading && <p>Loading orders...</p>}
        {error && <p className="error-text">{error}</p>}
        {!loading && !error && orders.length === 0 && <p>No orders found.</p>}

        {!loading && !error && orders.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer_name}</td>
                    <td>{order.product_name}</td>
                    <td>{order.quantity}</td>
                    <td>
                      <span className={`status-badge status-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{formatDate(order.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
