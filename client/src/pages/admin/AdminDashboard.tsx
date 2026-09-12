import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  Box,
  CheckCircle2,
  Edit3,
  Eye,
  ImagePlus,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  ShoppingBag,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { api } from "../../lib/api";

type ProductImage = {
  id: string;
  url: string;
  altText: string | null;
  position: number;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  badge: string | null;
  active: boolean;
  categoryId: string;
  category: Category;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
};

type RecentOrder = {
  id: string;
  reference: string;
  customerName: string;
  customerEmail?: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
};

type DashboardData = {
  totalProducts?: number;
  totalCustomers?: number;
  totalOrders?: number;
  totalRevenue?: number;
  lowStockProducts?: number | AdminProduct[];
  recentOrders?: RecentOrder[];
};

type DashboardApiData = {
  stats?: {
    totalProducts?: number;
    totalCustomers?: number;
    totalOrders?: number;
    totalRevenue?: number;
  };
  lowStockProducts?: AdminProduct[];
  recentOrders?: RecentOrder[];
};

type DashboardResponse = {
  success: boolean;
  data: DashboardApiData;
};

type ProductsResponse = {
  success: boolean;
  data: AdminProduct[];
};

type UploadResponse = {
  success: boolean;
  data: {
    url: string;
    publicId: string;
  };
};

type ProductForm = {
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: string;
  categoryId: string;
  badge: string;
  image: string;
  active: boolean;
};

const emptyProductForm: ProductForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  stock: "",
  categoryId: "",
  badge: "",
  image: "",
  active: true,
};

const orderStatuses = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

function formatStatus(status?: string) {
  if (!status) {
    return "Unknown";
  }

  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatMoney(value: number | undefined | null) {
  return Number(value ?? 0).toLocaleString();
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  const [products, setProducts] = useState<AdminProduct[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [showProductForm, setShowProductForm] = useState(false);

  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(
    null,
  );

  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);

  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const [updatingProductId, setUpdatingProductId] = useState<string | null>(
    null,
  );

  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null,
  );

  const token = localStorage.getItem("nova_token");

  const authConfig = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token],
  );

  const loadAdminData = useCallback(
    async (silent = false) => {
      const currentToken = localStorage.getItem("nova_token");

      if (!currentToken) {
        navigate("/login", {
          replace: true,
        });
        return;
      }

      try {
        if (silent) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        setError("");

        const [dashboardResponse, productsResponse] = await Promise.all([
          api.get<DashboardResponse>("/admin/dashboard", {
            headers: {
              Authorization: `Bearer ${currentToken}`,
            },
          }),

          api.get<ProductsResponse>("/admin/products", {
            headers: {
              Authorization: `Bearer ${currentToken}`,
            },
          }),
        ]);

        const dashboardData = dashboardResponse.data.data;

        setDashboard({
          ...(dashboardData.stats ?? {}),
          lowStockProducts: dashboardData.lowStockProducts ?? [],
          recentOrders: dashboardData.recentOrders ?? [],
        });

        setProducts(productsResponse.data.data ?? []);
      } catch (requestError) {
        if (
          axios.isAxiosError(requestError) &&
          requestError.response?.status === 401
        ) {
          localStorage.removeItem("nova_token");
          localStorage.removeItem("nova_user");

          navigate("/login", {
            replace: true,
          });

          return;
        }

        if (
          axios.isAxiosError(requestError) &&
          requestError.response?.status === 403
        ) {
          navigate("/", {
            replace: true,
          });

          return;
        }

        console.error("Load admin dashboard error:", requestError);

        setError("Unable to load the admin dashboard. Please try again.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [navigate],
  );

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const categories = useMemo(() => {
    const map = new Map<string, Category>();

    products.forEach((product) => {
      if (product.category?.id) {
        map.set(product.category.id, product.category);
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [products]);

  function openCreateProduct() {
    setEditingProduct(null);

    setProductForm({
      ...emptyProductForm,
      categoryId: categories[0]?.id ?? "",
    });

    setShowProductForm(true);
  }

  function openEditProduct(product: AdminProduct) {
    setEditingProduct(product);

    setProductForm({
      name: product.name ?? "",
      slug: product.slug ?? "",
      description: product.description ?? "",
      price: String(product.price ?? 0),
      stock: String(product.stock ?? 0),
      categoryId: product.category?.id ?? product.categoryId ?? "",
      badge: product.badge ?? "",
      image: product.images?.[0]?.url ?? "",
      active: product.active ?? true,
    });

    setShowProductForm(true);
  }

  function closeProductForm() {
    if (isSavingProduct || isUploadingImage) {
      return;
    }

    setEditingProduct(null);
    setProductForm(emptyProductForm);
    setShowProductForm(false);
  }

  function updateProductForm<K extends keyof ProductForm>(
    key: K,
    value: ProductForm[K],
  ) {
    setProductForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleProductNameChange(value: string) {
    setProductForm((current) => ({
      ...current,
      name: value,
      slug: editingProduct ? current.slug : makeSlug(value),
    }));
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      window.alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      window.alert("Image must be 5MB or smaller.");
      return;
    }

    const currentToken = localStorage.getItem("nova_token");

    if (!currentToken) {
      navigate("/login", {
        replace: true,
      });
      return;
    }

    try {
      setIsUploadingImage(true);

      const formData = new FormData();

      formData.append("image", file);

      const response = await api.post<UploadResponse>(
        "/uploads/product-image",
        formData,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        },
      );

      updateProductForm("image", response.data.data.url);
    } catch (requestError) {
      console.error("Image upload error:", requestError);

      let message = "Unable to upload image.";

      if (axios.isAxiosError(requestError)) {
        const responseMessage = requestError.response?.data?.message;

        if (typeof responseMessage === "string") {
          message = responseMessage;
        }
      }

      window.alert(message);
    } finally {
      setIsUploadingImage(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleProductSubmit(event: FormEvent) {
    event.preventDefault();

    if (
      !productForm.name.trim() ||
      !productForm.slug.trim() ||
      !productForm.description.trim() ||
      productForm.price === "" ||
      productForm.stock === "" ||
      !productForm.categoryId
    ) {
      window.alert("Please complete all required product fields.");
      return;
    }

    const price = Number(productForm.price);

    const stock = Number(productForm.stock);

    if (Number.isNaN(price) || price < 0 || Number.isNaN(stock) || stock < 0) {
      window.alert("Price and stock must be valid positive numbers.");
      return;
    }

    try {
      setIsSavingProduct(true);

      const payload = {
        name: productForm.name.trim(),
        slug: makeSlug(productForm.slug),
        description: productForm.description.trim(),
        price,
        stock,
        categoryId: productForm.categoryId,
        badge: productForm.badge.trim() || null,
        active: productForm.active,
        ...(productForm.image.trim()
          ? {
              image: productForm.image.trim(),
            }
          : {}),
      };

      if (editingProduct) {
        await api.patch(
          `/admin/products/${editingProduct.id}`,
          payload,
          authConfig,
        );
      } else {
        await api.post("/admin/products", payload, authConfig);
      }

      setEditingProduct(null);
      setProductForm(emptyProductForm);
      setShowProductForm(false);

      await loadAdminData(true);
    } catch (requestError) {
      console.error("Save product error:", requestError);

      let message = "Unable to save product.";

      if (axios.isAxiosError(requestError)) {
        const responseMessage = requestError.response?.data?.message;

        if (typeof responseMessage === "string") {
          message = responseMessage;
        }
      }

      window.alert(message);
    } finally {
      setIsSavingProduct(false);
    }
  }

  async function handleProductActiveToggle(product: AdminProduct) {
    try {
      setUpdatingProductId(product.id);

      await api.patch(
        `/admin/products/${product.id}`,
        {
          active: !product.active,
        },
        authConfig,
      );

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                active: !product.active,
              }
            : item,
        ),
      );

      await loadAdminData(true);
    } catch (requestError) {
      console.error("Toggle product error:", requestError);

      window.alert("Unable to update product status.");
    } finally {
      setUpdatingProductId(null);
    }
  }

  async function handleDeleteProduct(product: AdminProduct) {
    const confirmed = window.confirm(
      `Remove "${product.name}" from NOVA? Products linked to existing orders will be deactivated instead of permanently deleted.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingProductId(product.id);

      const response = await api.delete(
        `/admin/products/${product.id}`,
        authConfig,
      );

      const message = response.data?.message;

      if (message) {
        window.alert(message);
      }

      await loadAdminData(true);
    } catch (requestError) {
      console.error("Delete product error:", requestError);

      let message = "Unable to remove product.";

      if (axios.isAxiosError(requestError)) {
        const responseMessage = requestError.response?.data?.message;

        if (typeof responseMessage === "string") {
          message = responseMessage;
        }
      }

      window.alert(message);
    } finally {
      setDeletingProductId(null);
    }
  }

  async function handleOrderStatusChange(orderId: string, status: string) {
    try {
      setUpdatingOrderId(orderId);

      await api.patch(
        `/admin/orders/${orderId}/status`,
        {
          status,
        },
        authConfig,
      );

      setDashboard((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          recentOrders: (current.recentOrders ?? []).map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status,
                }
              : order,
          ),
        };
      });
    } catch (requestError) {
      console.error("Update order status error:", requestError);

      window.alert("Unable to update order status.");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <Loader2 size={30} className="mx-auto animate-spin" />

          <p className="mt-4 text-sm text-neutral-500">Loading NOVA admin...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-black">Admin dashboard unavailable</h1>

          <p className="mt-3 text-sm text-neutral-500">
            {error || "Unable to load dashboard information."}
          </p>

          <button
            type="button"
            onClick={() => loadAdminData()}
            className="mt-6 bg-black px-6 py-3 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const recentOrders = dashboard.recentOrders ?? [];

  const lowStockCount = Array.isArray(dashboard.lowStockProducts)
    ? dashboard.lowStockProducts.length
    : Number(dashboard.lowStockProducts ?? 0);

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-6 py-5 lg:px-8">
          <div>
            <Link to="/" className="text-xl font-black tracking-[0.18em]">
              NOVA
            </Link>

            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-neutral-400">
              Store administration
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadAdminData(true)}
              disabled={isRefreshing}
              className="flex h-10 w-10 items-center justify-center border border-black/10 bg-white transition hover:border-black disabled:opacity-50"
              aria-label="Refresh dashboard"
            >
              <RefreshCw
                size={17}
                className={isRefreshing ? "animate-spin" : ""}
              />
            </button>

            <Link
              to="/"
              className="border border-black/10 px-4 py-2.5 text-sm font-semibold transition hover:border-black"
            >
              View store
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-6 py-10 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
              Dashboard
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight">
              Store overview
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Manage products, inventory and customer orders.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateProduct}
            className="flex w-fit items-center gap-2 bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            <Plus size={17} />
            Add product
          </button>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Revenue"
            value={`₦${formatMoney(dashboard.totalRevenue)}`}
            icon={<ShoppingBag size={20} />}
          />

          <StatCard
            label="Orders"
            value={String(Number(dashboard.totalOrders ?? 0))}
            icon={<Package size={20} />}
          />

          <StatCard
            label="Customers"
            value={String(Number(dashboard.totalCustomers ?? 0))}
            icon={<Users size={20} />}
          />

          <StatCard
            label="Products"
            value={String(Number(dashboard.totalProducts ?? products.length))}
            icon={<Box size={20} />}
          />

          <StatCard
            label="Low stock"
            value={String(lowStockCount)}
            icon={<CheckCircle2 size={20} />}
          />
        </div>

        <section className="mt-10 overflow-hidden border border-black/10 bg-white">
          <div className="flex flex-col gap-4 border-b border-black/10 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">Product management</h2>

              <p className="mt-1 text-sm text-neutral-500">
                Add products, update inventory and control catalogue visibility.
              </p>
            </div>

            <div className="text-sm text-neutral-500">
              {products.length} {products.length === 1 ? "product" : "products"}
            </div>
          </div>

          {products.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Package size={30} className="mx-auto text-neutral-300" />

              <h3 className="mt-4 font-semibold">No products yet</h3>

              <button
                type="button"
                onClick={openCreateProduct}
                className="mt-5 bg-black px-5 py-3 text-sm font-semibold text-white"
              >
                Add first product
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="px-6 py-4">Product</th>

                    <th className="px-4 py-4">Category</th>

                    <th className="px-4 py-4">Price</th>

                    <th className="px-4 py-4">Stock</th>

                    <th className="px-4 py-4">Status</th>

                    <th className="px-4 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-black/10">
                  {products.map((product) => {
                    const image =
                      product.images?.[0]?.url ??
                      "https://placehold.co/160x200?text=NOVA";

                    return (
                      <tr key={product.id} className="align-middle">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-13 shrink-0 overflow-hidden bg-neutral-100">
                              <img
                                src={image}
                                alt={product.name ?? "NOVA product"}
                                className="h-full w-full object-cover"
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-[240px] truncate text-sm font-semibold">
                                {product.name}
                              </p>

                              <p className="mt-1 max-w-[240px] truncate text-xs text-neutral-400">
                                /{product.slug}
                              </p>

                              {product.badge && (
                                <span className="mt-2 inline-block bg-neutral-100 px-2 py-1 text-[10px] font-semibold uppercase">
                                  {product.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm">
                          {product.category?.name ?? "Uncategorised"}
                        </td>

                        <td className="px-4 py-4 text-sm font-semibold">
                          ₦{formatMoney(product.price)}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`text-sm font-semibold ${
                              Number(product.stock ?? 0) <= 10
                                ? "text-red-600"
                                : "text-neutral-900"
                            }`}
                          >
                            {Number(product.stock ?? 0)}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => handleProductActiveToggle(product)}
                            disabled={updatingProductId === product.id}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                              product.active
                                ? "bg-green-100 text-green-800"
                                : "bg-neutral-200 text-neutral-600"
                            }`}
                          >
                            {updatingProductId === product.id
                              ? "Updating..."
                              : product.active
                                ? "Active"
                                : "Inactive"}
                          </button>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/products/${product.slug}`}
                              className="flex h-9 w-9 items-center justify-center border border-black/10 transition hover:border-black"
                              aria-label="View product"
                            >
                              <Eye size={15} />
                            </Link>

                            <button
                              type="button"
                              onClick={() => openEditProduct(product)}
                              className="flex h-9 w-9 items-center justify-center border border-black/10 transition hover:border-black"
                              aria-label="Edit product"
                            >
                              <Edit3 size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(product)}
                              disabled={deletingProductId === product.id}
                              className="flex h-9 w-9 items-center justify-center border border-red-200 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                              aria-label="Delete product"
                            >
                              {deletingProductId === product.id ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : (
                                <Trash2 size={15} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-10 overflow-hidden border border-black/10 bg-white">
          <div className="border-b border-black/10 p-6">
            <h2 className="text-xl font-bold">Recent orders</h2>

            <p className="mt-1 text-sm text-neutral-500">
              Review purchases and update fulfilment status.
            </p>
          </div>

          {recentOrders.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-neutral-500">
              No orders yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="px-6 py-4">Order</th>

                    <th className="px-4 py-4">Customer</th>

                    <th className="px-4 py-4">Total</th>

                    <th className="px-4 py-4">Payment</th>

                    <th className="px-4 py-4">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-black/10">
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold">
                          {order.reference ?? "NOVA Order"}
                        </p>

                        <p className="mt-1 text-xs text-neutral-400">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "—"}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-sm">
                        {order.user?.name ?? order.customerName ?? "Customer"}
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold">
                        ₦{formatMoney(order.total)}
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-800">
                          {formatStatus(order.paymentStatus)}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <select
                          value={order.status ?? "PROCESSING"}
                          onChange={(event) =>
                            handleOrderStatusChange(
                              order.id,
                              event.target.value,
                            )
                          }
                          disabled={updatingOrderId === order.id}
                          className="border border-black/15 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-black disabled:opacity-50"
                        >
                          {orderStatuses.map((status) => (
                            <option key={status} value={status}>
                              {formatStatus(status)}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {showProductForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto bg-white">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/10 bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-bold">
                  {editingProduct ? "Edit product" : "Add product"}
                </h2>

                <p className="mt-1 text-xs text-neutral-500">
                  {editingProduct
                    ? "Update product and inventory details."
                    : "Create a new product for the NOVA catalogue."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeProductForm}
                disabled={isSavingProduct || isUploadingImage}
                className="flex h-10 w-10 items-center justify-center border border-black/10 transition hover:border-black disabled:opacity-50"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Product name *
                </label>

                <input
                  value={productForm.name}
                  onChange={(event) =>
                    handleProductNameChange(event.target.value)
                  }
                  className="input"
                  placeholder="Essential Black Dress"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Slug *
                </label>

                <input
                  value={productForm.slug}
                  onChange={(event) =>
                    updateProductForm("slug", makeSlug(event.target.value))
                  }
                  className="input"
                  placeholder="essential-black-dress"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Description *
                </label>

                <textarea
                  value={productForm.description}
                  onChange={(event) =>
                    updateProductForm("description", event.target.value)
                  }
                  rows={5}
                  className="input resize-none"
                  placeholder="Describe the product..."
                  required
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Price (₦) *
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={productForm.price}
                    onChange={(event) =>
                      updateProductForm("price", event.target.value)
                    }
                    className="input"
                    placeholder="65000"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Stock *
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(event) =>
                      updateProductForm("stock", event.target.value)
                    }
                    className="input"
                    placeholder="20"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Category *
                  </label>

                  <select
                    value={productForm.categoryId}
                    onChange={(event) =>
                      updateProductForm("categoryId", event.target.value)
                    }
                    className="input"
                    required
                  >
                    <option value="">Select category</option>

                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Badge
                  </label>

                  <input
                    value={productForm.badge}
                    onChange={(event) =>
                      updateProductForm("badge", event.target.value)
                    }
                    className="input"
                    placeholder="New, Popular..."
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Product image
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="flex w-full items-center justify-center gap-2 border border-dashed border-black/20 bg-neutral-50 px-6 py-8 text-sm font-semibold transition hover:border-black hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUploadingImage ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Uploading image...
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      Choose image
                    </>
                  )}
                </button>

                <p className="mt-2 text-xs text-neutral-400">
                  JPG, PNG, WEBP and other image formats. Maximum size 5MB.
                </p>
              </div>

              {productForm.image ? (
                <div className="overflow-hidden border border-black/10">
                  <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ImagePlus size={16} />

                      <p className="text-sm font-semibold">Image uploaded</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => updateProductForm("image", "")}
                      disabled={isUploadingImage}
                      className="text-xs font-semibold text-red-600"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="h-72 bg-neutral-100">
                    <img
                      src={productForm.image}
                      alt="Product preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center bg-neutral-100 text-neutral-300">
                  <ImagePlus size={34} />
                </div>
              )}

              <label className="flex cursor-pointer items-center gap-3 border border-black/10 p-4">
                <input
                  type="checkbox"
                  checked={productForm.active}
                  onChange={(event) =>
                    updateProductForm("active", event.target.checked)
                  }
                  className="h-4 w-4"
                />

                <div>
                  <p className="text-sm font-semibold">Product active</p>

                  <p className="mt-1 text-xs text-neutral-500">
                    Active products can appear in the store.
                  </p>
                </div>
              </label>

              <div className="flex flex-col-reverse gap-3 border-t border-black/10 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeProductForm}
                  disabled={isSavingProduct || isUploadingImage}
                  className="border border-black/15 px-6 py-3 text-sm font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingProduct || isUploadingImage}
                  className="flex items-center justify-center gap-2 bg-black px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {isSavingProduct && (
                    <Loader2 size={16} className="animate-spin" />
                  )}

                  {isSavingProduct
                    ? "Saving..."
                    : editingProduct
                      ? "Save changes"
                      : "Create product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <article className="border border-black/10 bg-white p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
          {label}
        </p>

        <div className="text-neutral-400">{icon}</div>
      </div>

      <p className="mt-5 text-2xl font-black">{value}</p>
    </article>
  );
}
