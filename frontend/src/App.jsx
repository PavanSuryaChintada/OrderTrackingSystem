import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  PackageOpen,
  RefreshCw,
  Search,
  ShoppingCart,
  Store,
} from "lucide-react";
import {
  createOrder,
  fetchOrderById,
  fetchOrders,
  updateOrderStatus,
} from "./api/ordersApi";
import "./index.css";

const STATUS_FLOW = ["PLACED", "PACKED", "SHIPPED", "DELIVERED"];

const STATUS_STYLES = {
  PLACED: "bg-blue-100 text-blue-700",
  PACKED: "bg-amber-100 text-amber-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
};

const NEXT_ACTION_LABEL = {
  PACKED: "Pack Order",
  SHIPPED: "Ship Order",
  DELIVERED: "Deliver Order",
};

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

function Stepper({ status }) {
  const currentIndex = STATUS_FLOW.indexOf(status);
  const isTerminalDelivered = status === "DELIVERED";

  return (
    <div className="mt-4">
      <div className="flex items-center">
        {STATUS_FLOW.map((step, index) => {
          const completed =
            index < currentIndex || (isTerminalDelivered && index === currentIndex);
          const active = index === currentIndex && !isTerminalDelivered;
          const lineDone = index < currentIndex;

          return (
            <div key={step} className="relative flex flex-1 items-center">
              <span
                className={`relative z-10 h-4 w-4 rounded-full border-2 transition-all duration-500 ease-out ${
                  completed
                    ? "border-emerald-500 bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.14)]"
                    : active
                      ? "animate-pulse border-indigo-500 bg-white shadow-[0_0_0_5px_rgba(99,102,241,0.16)]"
                      : "border-slate-300 bg-white"
                }`}
              />
              {index < STATUS_FLOW.length - 1 && (
                <span
                  className={`absolute left-4 right-0 h-0.5 rounded-full transition-colors duration-500 ${
                    lineDone ? "bg-emerald-400" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-2 grid grid-cols-4 text-[11px] font-medium">
        {STATUS_FLOW.map((step, index) => {
          const completed =
            index < currentIndex || (isTerminalDelivered && index === currentIndex);
          const active = index === currentIndex && !isTerminalDelivered;

          return (
            <span
              key={step}
              className={`text-left transition-colors duration-500 ${
                completed
                  ? "text-emerald-700"
                  : active
                    ? "font-semibold text-indigo-700"
                    : "text-slate-400"
              }`}
            >
              {step}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function App() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({ customerName: "", productName: "", quantity: 1 });
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [highlightOrderId, setHighlightOrderId] = useState(null);

  const [lookupId, setLookupId] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupError, setLookupError] = useState("");
  const [lookingUp, setLookingUp] = useState(false);

  async function loadOrders({ silent = false } = {}) {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError("");
      const data = await fetchOrders();
      setOrders(data.orders || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = setTimeout(() => setToastMessage(""), 2500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    if (!highlightOrderId) return undefined;
    const timer = setTimeout(() => setHighlightOrderId(null), 2200);
    return () => clearTimeout(timer);
  }, [highlightOrderId]);

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: name === "quantity" ? Number(value) : value }));
  }

  async function handleCreateOrder(event) {
    event.preventDefault();
    setFormError("");
    setFormMessage("");

    try {
      setCreating(true);
      const result = await createOrder(formData);
      const createdOrder = result?.order;
      setFormMessage("Order created successfully.");
      setToastMessage("Order created successfully");
      setFormData({ customerName: "", productName: "", quantity: 1 });
      await loadOrders();
      if (createdOrder?.id) {
        setHighlightOrderId(createdOrder.id);
      }
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
    if (!nextStatus) return;

    const previousOrders = orders;
    const previousLookup = lookupResult;

    // Optimistic UI update for smooth stage transition animation.
    setOrders((prev) =>
      prev.map((item) =>
        item.id === order.id
          ? {
              ...item,
              status: nextStatus,
              updated_at: new Date().toISOString(),
            }
          : item
      )
    );
    if (lookupResult && lookupResult.id === order.id) {
      setLookupResult((prev) =>
        prev
          ? {
              ...prev,
              status: nextStatus,
              updated_at: new Date().toISOString(),
            }
          : prev
      );
    }

    try {
      setUpdatingOrderId(order.id);
      await updateOrderStatus(order.id, nextStatus);
      await loadOrders({ silent: true });
      if (lookupResult && lookupResult.id === order.id) {
        const refreshed = await fetchOrderById(order.id);
        setLookupResult(refreshed.order || null);
      }
    } catch (requestError) {
      setOrders(previousOrders);
      setLookupResult(previousLookup);
      setError(requestError.message);
    } finally {
      setUpdatingOrderId(null);
    }
  }

  const totalOrders = useMemo(() => orders.length, [orders]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <nav className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-8">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-semibold tracking-wide text-slate-900">OrderOps Dashboard</span>
          </div>
          <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {totalOrders} Orders
          </span>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-8 py-8">
        {toastMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm">
            <CheckCircle2 className="h-4 w-4" />
            {toastMessage}
          </div>
        )}

        <header className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Order Tracking System</h1>
            <p className="mt-1 text-sm text-slate-500">
              Enterprise order lifecycle view with clear stage progression.
            </p>
          </div>
          <button
            type="button"
            onClick={loadOrders}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </header>

        <section className="mb-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-slate-700" />
            <h2 className="text-xl font-bold text-slate-900">Create Order</h2>
          </div>
          <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" onSubmit={handleCreateOrder}>
            <label className="text-sm font-medium text-slate-600">
              Customer Name
              <input
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                required
                maxLength={120}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-200 transition focus:ring"
              />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Product Name
              <input
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                required
                maxLength={120}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-200 transition focus:ring"
              />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Quantity
              <input
                type="number"
                name="quantity"
                min="1"
                value={formData.quantity}
                onChange={handleInputChange}
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-200 transition focus:ring"
              />
            </label>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={creating}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {creating ? "Creating..." : "Create Order"}
              </button>
            </div>
          </form>
          {formMessage && (
            <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              {formMessage}
            </p>
          )}
          {formError && <p className="mt-3 text-sm font-medium text-rose-600">{formError}</p>}
        </section>

        <section className="mb-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-5 w-5 text-slate-700" />
            <h2 className="text-xl font-bold text-slate-900">Find Order by ID</h2>
          </div>
          <form className="flex max-w-md gap-2" onSubmit={handleLookupOrder}>
            <input
              type="number"
              min="1"
              placeholder="Enter order ID"
              value={lookupId}
              onChange={(event) => setLookupId(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-200 transition focus:ring"
            />
            <button
              type="submit"
              disabled={lookingUp}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              {lookingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {lookingUp ? "Searching..." : "Search"}
            </button>
          </form>
          {lookupError && <p className="mt-3 text-sm font-medium text-rose-600">{lookupError}</p>}
          {lookupResult && (
            <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
              <span className="font-semibold">Order #{lookupResult.id}</span> - {lookupResult.customer_name} - {lookupResult.product_name}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <PackageOpen className="h-5 w-5 text-slate-700" />
            <h2 className="text-xl font-bold text-slate-900">Orders</h2>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading orders...
            </div>
          )}
          {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

          {!loading && !error && orders.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 py-10 text-center">
              <PackageOpen className="mb-3 h-10 w-10 text-slate-400" />
              <p className="text-base font-semibold text-slate-700">No orders yet</p>
              <p className="mt-1 text-sm text-slate-500">Create your first order to get started.</p>
            </div>
          )}

          {!loading && !error && orders.length > 0 && (
            <div className="grid gap-4">
              {orders.map((order) => {
                const nextStatus = getNextStatus(order.status);
                const actionLabel = nextStatus ? NEXT_ACTION_LABEL[nextStatus] : "Completed";
                const isUpdating = updatingOrderId === order.id;
                const cardHighlight = highlightOrderId === order.id;

                return (
                  <article
                    key={order.id}
                    className={`rounded-lg border bg-white p-4 shadow-sm transition ${
                      cardHighlight ? "border-emerald-300 ring-2 ring-emerald-100 animate-pulse" : "border-slate-200"
                    }`}
                  >
                    <div className="flex flex-col gap-4">
                      <div>
                        <p className="text-base font-semibold text-slate-900">Order #{order.id}</p>
                        <p className="text-sm font-semibold text-slate-800">{order.customer_name}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {order.quantity}x {order.product_name} · Updated {formatDate(order.updated_at)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[order.status] || "bg-slate-100 text-slate-700"}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <Stepper status={order.status} />

                      <div className="flex justify-end">
                        <button
                          type="button"
                          disabled={!nextStatus || isUpdating}
                          onClick={() => handleAdvanceStatus(order)}
                          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:scale-[1.02] hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {isUpdating ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            actionLabel
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;
