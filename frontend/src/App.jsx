import { useEffect, useState } from "react";
import {
  createOrder,
  fetchOrderById,
  fetchOrders,
  updateOrderStatus,
} from "./api/ordersApi";
import "./index.css";

const STATUS_FLOW = ["PLACED", "PACKED", "SHIPPED", "DELIVERED"];

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
}

function getNextStatus(currentStatus) {
  const index = STATUS_FLOW.indexOf(currentStatus);
  if (index === -1 || index === STATUS_FLOW.length - 1) {
    return null;
  }

  return STATUS_FLOW[index + 1];
}

function App() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    customerName: "",
    productName: "",
    quantity: 1,
  });
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);

  const [lookupId, setLookupId] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupError, setLookupError] = useState("");
  const [lookingUp, setLookingUp] = useState(false);

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

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value,
    }));
  }

  async function handleCreateOrder(event) {
    event.preventDefault();
    setFormError("");
    setFormMessage("");

    try {
      setCreating(true);
      await createOrder(formData);
      setFormMessage("Order created successfully.");
      setFormData({ customerName: "", productName: "", quantity: 1 });
      await loadOrders();
    } catch (requestError) {
      setFormError(requestError.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleLookupOrder(event) {
    event.preventDefault();
    setLookupError("");
    setLookupResult(null);

    if (!lookupId.trim()) {
      setLookupError("Enter an order ID.");
      return;
    }

    try {
      setLookingUp(true);
      const data = await fetchOrderById(lookupId.trim());
      setLookupResult(data.order || null);
    } catch (requestError) {
      setLookupError(requestError.message);
    } finally {
      setLookingUp(false);
    }
  }

  async function handleAdvanceStatus(order) {
    const nextStatus = getNextStatus(order.status);
    if (!nextStatus) {
      return;
    }

    try {
      await updateOrderStatus(order.id, nextStatus);
      await loadOrders();
      if (lookupResult && lookupResult.id === order.id) {
        const refreshed = await fetchOrderById(order.id);
        setLookupResult(refreshed.order || null);
      }
    } catch (requestError) {
      setError(requestError.message);
    }
  }

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
        <h2>Create Order</h2>
        <form className="form-grid" onSubmit={handleCreateOrder}>
          <label>
            Customer Name
            <input
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              required
              maxLength={120}
            />
          </label>
          <label>
            Product Name
            <input
              name="productName"
              value={formData.productName}
              onChange={handleInputChange}
              required
              maxLength={120}
            />
          </label>
          <label>
            Quantity
            <input
              type="number"
              name="quantity"
              min="1"
              value={formData.quantity}
              onChange={handleInputChange}
              required
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create Order"}
            </button>
          </div>
        </form>
        {formMessage && <p className="success-text">{formMessage}</p>}
        {formError && <p className="error-text">{formError}</p>}
      </section>

      <section className="panel">
        <h2>Find Order by ID</h2>
        <form className="lookup-row" onSubmit={handleLookupOrder}>
          <input
            type="number"
            min="1"
            placeholder="Enter order ID"
            value={lookupId}
            onChange={(event) => setLookupId(event.target.value)}
          />
          <button type="submit" disabled={lookingUp}>
            {lookingUp ? "Searching..." : "Find"}
          </button>
        </form>
        {lookupError && <p className="error-text">{lookupError}</p>}
        {lookupResult && (
          <p className="lookup-result">
            Order #{lookupResult.id}: {lookupResult.customer_name} - {lookupResult.product_name} -
            <strong> {lookupResult.status}</strong>
          </p>
        )}
      </section>

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
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const nextStatus = getNextStatus(order.status);
                  return (
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
                      <td>
                        <button
                          type="button"
                          className="small-button"
                          disabled={!nextStatus}
                          onClick={() => handleAdvanceStatus(order)}
                        >
                          {nextStatus ? `Mark ${nextStatus}` : "Completed"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
