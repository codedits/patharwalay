"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { formatPKR } from "@/lib/currency";
import Image from "next/image";
import { polishImageUrl } from "@/lib/images";

type Item = {
  _id?: string;
  title: string;
  description?: string;
  slug?: string;
  price: number;
  imageUrl?: string;
  images?: string[];
  onSale?: boolean;
  inStock?: boolean;
  createdAt?: string | number | Date;
};

type ProductForm = {
  _id?: string;
  title: string;
  description?: string;
  price: number;
  imageUrl?: string;
  images?: string[];
  onSale?: boolean;
  inStock?: boolean;
};

type Settings = {
  heroImageUrl?: string;
  heroHeadline?: string;
  hero2ImageUrl?: string;
  hero2Headline?: string;
  hero2Tagline?: string;
  heroImagePublicId?: string;
  hero2ImagePublicId?: string;
  productsHeroImageUrl?: string;
  productsHeroHeadline?: string;
  productsHeroTagline?: string;
  productsHeroImagePublicId?: string;
};

export default function AdminPage() {
  const [active, setActive] = useState<"products" | "settings">("products");
  const [items, setItems] = useState<Item[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  // Assume protected until checked to avoid a brief window where actions are enabled
  const [isProtected, setIsProtected] = useState<boolean>(true);
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [passwordAttempt, setPasswordAttempt] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [keepLogged, setKeepLogged] = useState<boolean>(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [form, setForm] = useState<ProductForm>({ title: "", description: "", price: 0, imageUrl: "", images: [], inStock: true, onSale: false });
  const [sortBy, setSortBy] = useState<"title-asc" | "title-desc" | "newest" | "oldest" | "price-asc" | "price-desc">("title-asc");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingTotal, setUploadingTotal] = useState(0);
  const [uploadingDone, setUploadingDone] = useState(0);
  // Accordion state for Site Settings panels
  const [openSettingsPanel, setOpenSettingsPanel] = useState<"home" | "second" | "products" | null>("home");
  // Keep a separate string state for price so users can freely type
  const [priceInput, setPriceInput] = useState<string>("");

  // Lock page scroll while an overlay/modal is shown (auth or product modal)
  useEffect(() => {
    const shouldLock = (isProtected && !authorized) || showModal;
    if (shouldLock) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
    return;
  }, [isProtected, authorized, showModal]);


  // Helper to load products with a small retry and safe type checks
  const loadProducts = useCallback(async (retry = true) => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error(`Failed to fetch products ${res.status}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
      return true;
    } catch (err) {
      console.warn("loadProducts error", err);
      if (retry) {
        // brief backoff then retry once
        await new Promise((r) => setTimeout(r, 250));
        return loadProducts(false);
      }
      setItems([]);
      return false;
    }
  }, []);

  const loadInitial = useCallback(async () => {
    try {
      // Check if admin is protected
      const check = await fetch("/api/admin-auth", { credentials: 'same-origin' });
      const cj = await check.json();
      setIsProtected(!!cj?.protected);
      if (!cj?.protected) {
        // not protected, proceed to load data
        await loadProducts();
        try {
          const sres = await fetch("/api/settings");
          const sdata = await sres.json();
          setSettings(sdata || {});
        } catch (err) {
          console.error("Failed to load settings", err);
        }
      } else if (cj?.ok) {
        // protected but cookie indicates we're already authorized
        setAuthorized(true);
        await loadProducts();
        try {
          const sres = await fetch("/api/settings");
          const sdata = await sres.json();
          setSettings(sdata || {});
        } catch (err) {
          console.error("Failed to load settings", err);
        }
      }
    } catch {
      console.error("Failed to init admin page");
    }
  }, [loadProducts]);
  useEffect(() => { void loadInitial(); }, [loadInitial]);

  

  async function verifyPassword() {
    setAuthError(null);
    try {
  const res = await fetch("/api/admin-auth", { method: "POST", body: JSON.stringify({ password: passwordAttempt, keep: keepLogged }), headers: { "Content-Type": "application/json" }, credentials: 'same-origin' });
      const j = await res.json();
      if (j?.ok) {
        setAuthorized(true);
  // load data
  await loadProducts();
        const sres = await fetch("/api/settings");
        const sdata = await sres.json();
        setSettings(sdata || {});
      } else {
        setAuthError("Incorrect password");
      }
  } catch {
      setAuthError("Failed to verify password");
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.title.toLowerCase().includes(q));
  }, [items, query]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sortBy) {
      case "title-desc":
        list.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "newest":
        // Fallback to _id string compare if createdAt not present
        list.sort((a: Item, b: Item) => {
          const toMs = (c?: string | number | Date) => {
            if (c == null) return 0;
            if (typeof c === "number") return c;
            if (typeof c === "string") return new Date(c).getTime();
            if (c instanceof Date) return c.getTime();
            return 0;
          };
          const ad = toMs(a.createdAt);
          const bd = toMs(b.createdAt);
          return bd - ad;
        });
        break;
      case "oldest":
        list.sort((a: Item, b: Item) => {
          const toMs = (c?: string | number | Date) => {
            if (c == null) return 0;
            if (typeof c === "number") return c;
            if (typeof c === "string") return new Date(c).getTime();
            if (c instanceof Date) return c.getTime();
            return 0;
          };
          const ad = toMs(a.createdAt);
          const bd = toMs(b.createdAt);
          return ad - bd;
        });
        break;
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "title-asc":
      default:
        list.sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  }, [filtered, sortBy]);

  async function uploadMediaFile(file: File) {
    const fd = new FormData();
    fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd, credentials: 'same-origin' });
    // The server (or an intermediate proxy) may sometimes return a non-JSON
    // error body (for example: "Request Entity Too Large"). Parsing that as
    // JSON consumes the body and will throw; calling `res.text()` afterwards
    // fails because the body stream was already read. Use `res.clone()` to
    // safely attempt multiple reads.
    let data: unknown = null;
    try {
      // Try to parse JSON first from a clone so the original response stays
      // unread for other uses.
      data = await res.clone().json();
    } catch (_parseErr) {
      try {
        const text = await res.clone().text();
        data = { error: text || `Upload failed with status ${res.status}` };
      } catch {
        // If even reading text fails for some reason, fall back to a generic
        // error that includes the status code.
        data = { error: `Upload failed with status ${res.status}` };
      }
    }

    // Safely extract string fields from unknown parsed data
    const getString = (obj: unknown, key: string): string | undefined => {
      if (!obj || typeof obj !== "object") return undefined;
      const v = (obj as Record<string, unknown>)[key];
      return typeof v === "string" ? v : undefined;
    };

    if (!res.ok) {
      const err = getString(data, "error") || getString(data, "message") || `Upload failed with status ${res.status}`;
      throw new Error(String(err));
    }

    const url = getString(data, "secure_url") || getString(data, "url") || getString(data, "secureUrl") || "";
    const publicId = typeof data === "object" && data && "raw" in (data as Record<string, unknown>) && typeof (data as Record<string, unknown>).raw === "object"
      ? ( ((data as Record<string, unknown>).raw as Record<string, unknown>).public_id as string | undefined )
      : undefined;
    return { url, publicId };
  }

  function resetForm() {
    setForm({ title: "", description: "", price: 0, imageUrl: "", images: [], inStock: true, onSale: false });
    setEditingId(null);
  setPriceInput("");
  }

  function editItem(it: Item) {
    setForm({
      _id: it._id,
      title: it.title,
      description: it.description,
      price: it.price,
      imageUrl: it.imageUrl || (it.images && it.images[0]) || "",
      images: it.images || (it.imageUrl ? [it.imageUrl] : []),
      onSale: it.onSale ?? false,
      inStock: it.inStock ?? true,
    });
  setPriceInput(String(it.price ?? ""));
    setEditingId(it._id || null);
  setShowModal(true);
  }

  async function remove(id?: string) {
    if (!id) return;
    if (!confirm("Delete this product?")) return;
    const delRes = await fetch(`/api/products/${id}`, { method: "DELETE", credentials: 'same-origin' });
    if (!delRes.ok) {
      if (delRes.status === 401) {
        alert("You are not authorized. Please enter the admin password.");
        setIsProtected(true);
        setAuthorized(false);
        return;
      }
      alert("Delete failed");
      return;
    }
    const res = await fetch("/api/products");
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
  const parsedPrice = Number.parseInt(priceInput || "0", 10);
      const primary = form.imageUrl || (form.images && form.images[0]) || "";
      const uniqueImages = Array.from(new Set([...(form.images || [])])).slice(0, 7);
  const body = { ...form, price: Number.isFinite(parsedPrice) ? parsedPrice : 0, imageUrl: primary, images: uniqueImages };
      let writeRes: Response | null = null;
      if (editingId) {
        writeRes = await fetch(`/api/products/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), credentials: 'same-origin' });
      } else {
        writeRes = await fetch(`/api/products`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), credentials: 'same-origin' });
      }
      if (!writeRes?.ok) {
        if (writeRes && writeRes.status === 401) {
          alert("You are not authorized. Please enter the admin password.");
          setIsProtected(true);
          setAuthorized(false);
          return;
        }
        const msg = await (async () => {
          try { const j = await writeRes?.json(); return (j && (j.error || j.message)) || writeRes?.statusText || 'Failed'; } catch { return writeRes?.statusText || 'Failed'; }
        })();
        alert(`Save failed: ${String(msg)}`);
        return;
      }
      resetForm();
  setShowModal(false);
      const refetchRes = await fetch("/api/products");
      const data = await refetchRes.json();
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      {isProtected && !authorized ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="admin-auth-title">
          <div className="bg-background max-w-md w-full p-6 rounded-lg outline-light shadow-xl">
            <h2 className="text-lg font-semibold mb-2">Admin access</h2>
            <p className="text-sm text-muted mb-4">Enter admin password to continue.</p>
            <input
              type="password"
              autoFocus
              value={passwordAttempt}
              onChange={(e) => setPasswordAttempt(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { void verifyPassword(); } if (e.key === 'Escape') { setPasswordAttempt(''); } }}
              className="w-full rounded-md border px-3 py-2 mb-3"
              aria-label="Admin password"
            />
            {/* Keep me logged in checkbox */}
            <label className="flex items-center gap-2 text-sm mb-3">
              <input type="checkbox" checked={keepLogged} onChange={(e) => setKeepLogged(e.target.checked)} className="form-checkbox h-4 w-4" />
              <span className="select-none">Keep me logged in</span>
            </label>
            {authError ? <div className="text-rose-600 text-sm mb-2">{authError}</div> : null}
            <div className="flex gap-2 justify-end">
              <button className="btn-outline" onClick={() => { setPasswordAttempt(""); }}>Clear</button>
              <button className="btn-primary" onClick={() => verifyPassword()}>Enter</button>
            </div>
          </div>
        </div>
      ) : null}
      <div className="min-h-screen grid md:grid-cols-[220px_1fr]">
      {/* Sidebar */}
  <aside className="hidden md:flex flex-col border-r border-black/10 dark:border-white/10">
        <div className="h-16 flex items-center px-3 border-b">
          <div className="text-lg font-semibold tracking-tight">Store Admin</div>
        </div>
        <nav className="px-2 py-3 space-y-1">
          <button onClick={() => setActive("products")} className={`w-full text-left px-3 py-2 rounded-md transition ${active === "products" ? "bg-black text-white dark:bg-white dark:text-black" : "hover:bg-black/5 dark:hover:bg-white/10"}`}>Products</button>
          <button onClick={() => setActive("settings")} className={`w-full text-left px-3 py-2 rounded-md transition ${active === "settings" ? "bg-black text-white dark:bg-white dark:text-black" : "hover:bg-black/5 dark:hover:bg-white/10"}`}>Site Settings</button>
        </nav>
        <div className="mt-auto p-4 text-xs text-muted">v0.1 • Next.js Admin</div>
      </aside>

    {/* Main */}
  <main className="flex-1 flex flex-col">
        {/* Header */}
  <header className="sticky top-0 z-10 border-b border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur supports-[backdrop-filter]:bg-white/40 flex flex-col md:flex-row items-center px-4 gap-3 py-2 md:py-0">
          <div className="md:hidden text-base font-semibold">Admin</div>
          <div className="relative flex-1 md:max-w-xl w-full">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={active === "products" ? "Search products" : "Search settings"} className="w-full rounded-md border px-3 py-2 pl-9" />
            <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted">🔎</span>
          </div>
      <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-2">
        {active === "products" ? (
          <div className="flex items-center gap-2 md:gap-3">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="rounded-md border px-2 py-2 text-sm hidden sm:block">
              <option value="title-asc">Title A–Z</option>
              <option value="title-desc">Title Z–A</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
            <button
              className="btn-primary disabled:opacity-60"
              title={isProtected && !authorized ? "Login required" : "Add product"}
              disabled={isProtected && !authorized}
              onClick={() => { if (isProtected && !authorized) return; resetForm(); setShowModal(true); }}
            >Add product</button>
          </div>
        ) : (
          <button className="btn-outline" onClick={async () => {
            try {
              setSettingsSaving(true);
              const res = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings || {}), credentials: 'same-origin' });
              const s = await res.json();
              setSettings(s || {});
            } finally {
              setSettingsSaving(false);
            }
          }}>{settingsSaving ? "Saving..." : "Save"}</button>
        )}
        {/* Logout button when authorized */}
        {authorized ? (
          <button className="ml-2 btn-outline" onClick={async () => {
            try {
              await fetch('/api/admin-auth', { method: 'DELETE', credentials: 'same-origin' });
            } catch (e) {
              console.error('Logout failed', e);
            }
            setAuthorized(false);
            setIsProtected(true);
            setPasswordAttempt('');
          }}>Logout</button>
        ) : null}
      </div>
        </header>
        {/* Mobile tabs for navigation */}
        <div className="md:hidden border-b border-black/10 dark:border-white/10 px-4 py-2 flex gap-2 bg-background sticky top-16 z-10">
          <button
            className={`px-3 py-1.5 rounded-md text-sm ${active === "products" ? "bg-black text-white dark:bg-white dark:text-black" : "border border-black/10 dark:border-white/10"}`}
            onClick={() => setActive("products")}
          >
            Products
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm ${active === "settings" ? "bg-black text-white dark:bg-white dark:text-black" : "border border-black/10 dark:border-white/10"}`}
            onClick={() => setActive("settings")}
          >
            Settings
          </button>
        </div>
  {/* Content */}
  <div className="p-4 sm:p-6">
            {active === "products" ? (
            <section className="space-y-4">
              {/* Mobile list view */}
              <div className="md:hidden grid gap-3">
                {sorted.map((it) => (
                  <div key={it._id} className="rounded-md border border-black/10 dark:border-white/10 p-3 flex items-center gap-3">
                    <div className="relative w-20 h-28 bg-black/5 dark:bg-white/10 overflow-hidden rounded">
                      {it.images?.[0] || it.imageUrl ? (
                        <Image src={(it.images?.[0] || it.imageUrl)!} alt={it.title} fill className="object-cover" sizes="80px" />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate" title={it.title}>{it.title}</div>
                      <div className="text-xs text-muted mt-0.5">{formatPKR(it.price)} · <span className={it.inStock ? "text-emerald-600" : "text-rose-600"}>{it.inStock ? "In stock" : "Out of stock"}</span>{it.onSale ? " · SALE" : ""}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => editItem(it)} className="btn-primary text-xs">Edit</button>
                      <button onClick={() => remove(it._id)} className="btn-outline text-xs">Del</button>
                    </div>
                  </div>
                ))}
                {!sorted.length ? (
                  <div className="rounded-md border border-black/10 dark:border-white/10 p-6 text-center text-muted">No products match your search.</div>
                ) : null}
              </div>

              {/* Desktop table view */}
              <div className="hidden md:block overflow-auto border border-black/10 dark:border-white/10 rounded-md">
                <table className="min-w-full text-sm">
                  <thead className="bg-black/5 dark:bg-white/5 text-muted">
                    <tr>
                      <th className="text-left font-medium px-3 py-2">Item</th>
                      <th className="text-left font-medium px-3 py-2">Price</th>
                      <th className="text-left font-medium px-3 py-2">Stock</th>
                      <th className="text-left font-medium px-3 py-2">Images</th>
                      <th className="text-right font-medium px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((it) => (
                      <tr key={it._id} className="border-t border-black/10 dark:border-white/10">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-3">
                            <div className="relative w-20 h-28 bg-black/5 dark:bg-white/10 overflow-hidden rounded">
                              {it.images?.[0] || it.imageUrl ? (
                                <Image src={(it.images?.[0] || it.imageUrl)!} alt={it.title} fill className="object-cover" sizes="80px" />
                              ) : null}
                            </div>
                            <div className="font-medium truncate max-w-[280px]" title={it.title}>{it.title}</div>
                          </div>
                        </td>
                        <td className="px-3 py-2">{formatPKR(it.price)}</td>
                        <td className="px-3 py-2">
                          <span className={`text-xs ${it.inStock ? "text-emerald-600" : "text-rose-600"}`}>{it.inStock ? "In stock" : "Out of stock"}</span>
                          {it.onSale ? <span className="ml-2 rounded bg-yellow-200/60 px-1.5 py-0.5 text-[10px] text-yellow-800">SALE</span> : null}
                        </td>
                        <td className="px-3 py-2 text-muted">{it.images?.length || 0}</td>
                        <td className="px-3 py-2 text-right">
                          <button onClick={() => editItem(it)} className="btn-primary text-xs">Edit</button>
                          <button onClick={() => remove(it._id)} className="btn-outline text-xs ml-2">Delete</button>
                        </td>
                      </tr>
                    ))}
                    {!sorted.length ? (
                      <tr>
                        <td colSpan={5} className="px-3 py-10 text-center text-muted">No products match your search.</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </section>
          ) : (
            <section className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
              {/* Homepage hero section */}
              <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/5 dark:bg-white/5 shadow-sm">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-5 py-4"
                  onClick={() => setOpenSettingsPanel(openSettingsPanel === "home" ? null : "home")}
                  aria-expanded={openSettingsPanel === "home"}
                >
                  <div className="text-left">
                    <div className="text-sm font-medium">Homepage hero</div>
                    <p className="text-xs text-muted mt-1">Shown at the top of the homepage.</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${openSettingsPanel === "home" ? "rotate-180" : ""}`} aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
                </button>
                <div className={`${openSettingsPanel === "home" ? "p-5 grid gap-5 md:grid-cols-2 items-start" : "hidden"}`}>
                  <div className="space-y-3">
                    <label className="block text-xs text-muted">Headline</label>
                    <input value={settings?.heroHeadline || ""} onChange={(e) => setSettings((prev) => ({ ...(prev || {}), heroHeadline: e.target.value }))} placeholder="Elegant gemstones, modern designs" className="w-full rounded-md border px-3 py-2" />
                  </div>
                  <div>
                    <div className="text-xs text-muted mb-2">Hero image</div>
                    <div className="relative rounded-lg overflow-hidden border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/10 aspect-[16/9]">
                      {settings?.heroImageUrl ? (
                        <Image src={polishImageUrl(settings.heroImageUrl, ["c_fill", "g_auto", "w_760", "h_428"]) } alt="Hero" fill className="object-cover" sizes="(max-width: 768px) 100vw, 380px" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">No image</div>
                      )}
                    </div>
                    <input type="file" accept="image/*" onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      try {
                        const { url, publicId } = await uploadMediaFile(f);
                        if (url) {
                          setSettings((prev) => ({ ...(prev || {}), heroImageUrl: url, heroImagePublicId: publicId }));
                          await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...(settings || {}), heroImageUrl: url, heroImagePublicId: publicId }), credentials: 'same-origin' });
                        }
                      } catch (err) {
                        console.error("Hero upload failed", err);
                        alert("Hero image upload failed");
                      }
                    }} className="mt-3 text-sm" />
                    {settings?.heroImageUrl ? (
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          aria-label="Delete image"
                          title="Delete image"
                          className="inline-flex items-center rounded p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                          onClick={async () => {
                            const next = { ...(settings || {}), heroImageUrl: "", heroImagePublicId: "" } as Settings;
                            setSettings(next);
                            await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next), credentials: 'same-origin' });
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M14.74 9l-.346 9M9.61 18l-.35-9M4.77 5.79l1.07 13.882A2.25 2.25 0 0 0 8.083 21.75h7.834a2.25 2.25 0 0 0 2.244-2.078L19.16 5.79" />
                            <path d="M9.5 4.334A2.167 2.167 0 0 1 11.667 2.25h.666A2.167 2.167 0 0 1 14.5 4.334V5.25m-9.728.54a48.11 48.11 0 0 1 3.478-.398m0 0a48.667 48.667 0 0 1 7.5 0m0 0c.34.029.68.062 1.022.1M4.772 5.79c.34-.059.68-.114 1.022-.165m9.978.265c.342.052.682.107 1.022.166" />
                            <path d="M3.5 5.25h17" />
                          </svg>
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Second hero section */}
              <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/5 dark:bg-white/5 shadow-sm">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-5 py-4"
                  onClick={() => setOpenSettingsPanel(openSettingsPanel === "second" ? null : "second")}
                  aria-expanded={openSettingsPanel === "second"}
                >
                  <div className="text-left">
                    <div className="text-sm font-medium">Second hero</div>
                    <p className="text-xs text-muted mt-1">Shown below the featured products section.</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${openSettingsPanel === "second" ? "rotate-180" : ""}`} aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
                </button>
                <div className={`${openSettingsPanel === "second" ? "p-5 grid gap-5 md:grid-cols-2 items-start" : "hidden"}`}>
                  <div className="space-y-3">
                    <label className="block text-xs text-muted">Headline</label>
                    <input value={settings?.hero2Headline || ""} onChange={(e) => setSettings((prev) => ({ ...(prev || {}), hero2Headline: e.target.value }))} placeholder="Discover rare stones" className="w-full rounded-md border px-3 py-2" />
                    <label className="block text-xs text-muted">Tagline</label>
                    <input value={settings?.hero2Tagline || ""} onChange={(e) => setSettings((prev) => ({ ...(prev || {}), hero2Tagline: e.target.value }))} placeholder="Curated selections, new each week" className="w-full rounded-md border px-3 py-2" />
                  </div>
                  <div>
                    <div className="text-xs text-muted mb-2">Second hero image</div>
                    <div className="relative rounded-lg overflow-hidden border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/10 aspect-[16/9]">
                      {settings?.hero2ImageUrl ? (
                        <Image src={polishImageUrl(settings.hero2ImageUrl, ["c_fill", "g_auto", "w_760", "h_428"]) } alt="Second Hero" fill className="object-cover" sizes="(max-width: 768px) 100vw, 380px" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">No image</div>
                      )}
                    </div>
                    <input type="file" accept="image/*" onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      try {
                        const { url, publicId } = await uploadMediaFile(f);
                        if (url) {
                          setSettings((prev) => ({ ...(prev || {}), hero2ImageUrl: url, hero2ImagePublicId: publicId }));
                          await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...(settings || {}), hero2ImageUrl: url, hero2ImagePublicId: publicId }), credentials: 'same-origin' });
                        }
                      } catch (err) {
                        console.error("Second hero upload failed", err);
                        alert("Second hero image upload failed");
                      }
                    }} className="mt-3 text-sm" />
                    {settings?.hero2ImageUrl ? (
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          aria-label="Delete image"
                          title="Delete image"
                          className="inline-flex items-center rounded p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                          onClick={async () => {
                            const next = { ...(settings || {}), hero2ImageUrl: "", hero2ImagePublicId: "" } as Settings;
                            setSettings(next);
                            await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next), credentials: 'same-origin' });
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M14.74 9l-.346 9M9.61 18l-.35-9M4.77 5.79l1.07 13.882A2.25 2.25 0 0 0 8.083 21.75h7.834a2.25 2.25 0 0 0 2.244-2.078L19.16 5.79" />
                            <path d="M9.5 4.334A2.167 2.167 0 0 1 11.667 2.25h.666A2.167 2.167 0 0 1 14.5 4.334V5.25m-9.728.54a48.11 48.11 0 0 1 3.478-.398m0 0a48.667 48.667 0 0 1 7.5 0m0 0c.34.029.68.062 1.022.1M4.772 5.79c.34-.059.68-.114 1.022-.165m9.978.265c.342.052.682.107 1.022.166" />
                            <path d="M3.5 5.25h17" />
                          </svg>
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Products page hero section */}
              <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/5 dark:bg-white/5 shadow-sm">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-5 py-4"
                  onClick={() => setOpenSettingsPanel(openSettingsPanel === "products" ? null : "products")}
                  aria-expanded={openSettingsPanel === "products"}
                >
                  <div className="text-left">
                    <div className="text-sm font-medium">Products page hero</div>
                    <p className="text-xs text-muted mt-1">Shown at the top of the products page.</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${openSettingsPanel === "products" ? "rotate-180" : ""}`} aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
                </button>
                <div className={`${openSettingsPanel === "products" ? "p-5 grid gap-5 md:grid-cols-2 items-start" : "hidden"}`}>
                  <div className="space-y-3">
                    <label className="block text-xs text-muted">Headline</label>
                    <input value={settings?.productsHeroHeadline || ""} onChange={(e) => setSettings((prev) => ({ ...(prev || {}), productsHeroHeadline: e.target.value }))} placeholder="Explore our full collection" className="w-full rounded-md border px-3 py-2" />
                    <label className="block text-xs text-muted">Tagline</label>
                    <input value={settings?.productsHeroTagline || ""} onChange={(e) => setSettings((prev) => ({ ...(prev || {}), productsHeroTagline: e.target.value }))} placeholder="Handpicked gems and designs" className="w-full rounded-md border px-3 py-2" />
                  </div>
                  <div>
                    <div className="text-xs text-muted mb-2">Products hero image</div>
                    <div className="relative rounded-lg overflow-hidden border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/10 aspect-[16/9]">
                      {settings?.productsHeroImageUrl ? (
                        <Image src={polishImageUrl(settings.productsHeroImageUrl, ["c_fill", "g_auto", "w_760", "h_428"]) } alt="Products Hero" fill className="object-cover" sizes="(max-width: 768px) 100vw, 380px" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">No image</div>
                      )}
                    </div>
                    <input type="file" accept="image/*" onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      try {
                        const { url, publicId } = await uploadMediaFile(f);
                        if (url) {
                          setSettings((prev) => ({ ...(prev || {}), productsHeroImageUrl: url, productsHeroImagePublicId: publicId }));
                          await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...(settings || {}), productsHeroImageUrl: url, productsHeroImagePublicId: publicId }), credentials: 'same-origin' });
                        }
                      } catch (err) {
                        console.error("Products hero upload failed", err);
                        alert("Products hero image upload failed");
                      }
                    }} className="mt-3 text-sm" />
                    {settings?.productsHeroImageUrl ? (
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          aria-label="Delete image"
                          title="Delete image"
                          className="inline-flex items-center rounded p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                          onClick={async () => {
                            const next = { ...(settings || {}), productsHeroImageUrl: "", productsHeroImagePublicId: "" } as Settings;
                            setSettings(next);
                            await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next), credentials: 'same-origin' });
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M14.74 9l-.346 9M9.61 18l-.35-9M4.77 5.79l1.07 13.882A2.25 2.25 0 0 0 8.083 21.75h7.834a2.25 2.25 0 0 0 2.244-2.078L19.16 5.79" />
                            <path d="M9.5 4.334A2.167 2.167 0 0 1 11.667 2.25h.666A2.167 2.167 0 0 1 14.5 4.334V5.25m-9.728.54a48.11 48.11 0 0 1 3.478-.398m0 0a48.667 48.667 0 0 1 7.5 0m0 0c.34.029.68.062 1.022.1M4.772 5.79c.34-.059.68-.114 1.022-.165m9.978.265c.342.052.682.107 1.022.166" />
                            <path d="M3.5 5.25h17" />
                          </svg>
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Product create/edit modal (full-screen on mobile) */}
  <div className={`fixed inset-0 z-50 ${showModal ? "" : "pointer-events-none"}`} aria-hidden={!showModal} role="dialog" aria-modal="true">
          {/* backdrop */}
          <div className={`absolute inset-0 bg-black/40 transition-opacity ${showModal ? "opacity-100" : "opacity-0"}`} onClick={() => { setShowModal(false); resetForm(); }} />
          <div className={`absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-screen h-[100vh] md:w-[92vw] md:max-w-lg md:h-auto rounded-none md:rounded-md border border-black/10 dark:border-white/10 bg-background shadow-xl transition-transform ${showModal ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
            <div className="h-14 md:h-12 flex items-center justify-between px-4 border-b border-black/10 dark:border-white/10 sticky top-0 bg-background">
              <div className="font-medium">{editingId ? "Edit product" : "New product"}</div>
              <button className="btn-outline" onClick={() => { setShowModal(false); resetForm(); }} aria-label="Close">Close</button>
            </div>
            <div className="p-4 md:max-h-[70vh] md:overflow-y-auto h-[calc(100vh-3.5rem)] overflow-y-auto">
              <form onSubmit={onSubmit} className="grid gap-3">
              <label className="text-xs text-muted">Title</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Natural Ruby Necklace" className="rounded-md border px-3 py-2" />

              <label className="text-xs text-muted">Description</label>
              <textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Add product details, materials, dimensions..." className="min-h-28 rounded-md border px-3 py-2" />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted">Price (PKR)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="0"
                    value={priceInput}
                    onChange={(e) => {
                      const onlyDigits = e.target.value.replace(/[^0-9]/g, "");
                      setPriceInput(onlyDigits);
                    }}
                    className="w-full rounded-md border px-3 py-2"
                    aria-label="Price in PKR"
                  />
                </div>
                <div className="flex items-end gap-3">
                  <label className="inline-flex items-center gap-2 text-xs"><input type="checkbox" checked={!!form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.checked })} /> In stock</label>
                  <label className="inline-flex items-center gap-2 text-xs"><input type="checkbox" checked={!!form.onSale} onChange={(e) => setForm({ ...form, onSale: e.target.checked })} /> On sale</label>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>Images ({(form.images?.length || 0)}/7)</span>
                  <span>First image is the cover</span>
                </div>
                <input type="file" accept="image/*" multiple onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  if (!files.length) return;
                  const current = form.images || [];
                  const slots = Math.max(0, 7 - current.length);
                  const toUpload = files.slice(0, slots);
                  if (!toUpload.length) {
                    alert("You already have 7 images. Remove some to add more.");
                    return;
                  }
                  try {
                    setIsUploading(true);
                    setUploadingTotal(toUpload.length);
                    setUploadingDone(0);
                    const urls: string[] = [];
                    // sequential uploads to avoid rate spikes
                    for (const f of toUpload) {
                      const { url } = await uploadMediaFile(f);
                      if (url) urls.push(url);
                      setUploadingDone((d) => d + 1);
                    }
                    if (urls.length) {
                      const next = Array.from(new Set([...(current || []), ...urls])).slice(0, 7);
                      setForm((prev) => ({ ...prev, images: next, imageUrl: prev.imageUrl || next[0] }));
                    }
                  } catch (err) {
                    console.error("Upload failed:", err);
                    alert(`Image upload failed: ${String(err)}`);
                  } finally {
                    setIsUploading(false);
                    setUploadingTotal(0);
                    setUploadingDone(0);
                    e.currentTarget.value = "";
                  }
                }} className="text-sm" />

                {isUploading && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Uploading images…</span>
                      <span>{uploadingDone}/{uploadingTotal}</span>
                    </div>
                    <div className="w-full h-2 rounded bg-black/10 dark:bg-white/10 overflow-hidden" aria-label="Upload progress" role="progressbar" aria-valuemin={0} aria-valuemax={uploadingTotal} aria-valuenow={uploadingDone}>
                      <div className="h-full bg-accent transition-[width]" style={{ width: `${uploadingTotal ? Math.round((uploadingDone / uploadingTotal) * 100) : 0}%` }} />
                    </div>
                  </div>
                )}

                {form.images && form.images.length ? (
                  <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {form.images.filter(Boolean).map((url, idx) => (
                      <div key={url} className="rounded overflow-hidden border border-black/10 dark:border-white/10 relative">
                        <div className="relative w-full h-24">
                          <Image src={url} alt={`img-${idx}`} fill className="object-cover" sizes="100px" />
                        </div>
                        <button
                          type="button"
                          aria-label="Remove image"
                          onClick={() => setForm((prev) => ({ ...prev, images: (prev.images || []).filter((u) => u !== url) }))}
                          className="absolute top-2 right-2 z-30 bg-red-600 text-white hover:bg-red-700 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-md border border-white/10"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button disabled={loading || isUploading} className="btn-primary">{loading ? "Saving..." : isUploading ? "Uploading images..." : editingId ? "Save product" : "Create product"}</button>
                <button type="button" className="btn-outline" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
              </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      {/* Mobile floating action button for quick add */}
      {active === "products" && authorized ? (
        <button
          className="fixed md:hidden bottom-5 right-5 inline-flex items-center gap-2 rounded-full px-4 py-3 shadow-lg bg-black text-white dark:bg-white dark:text-black active:scale-95 transition disabled:opacity-60"
          onClick={() => { resetForm(); setShowModal(true); }}
          aria-label="Add product"
        >
          <span className="text-lg leading-none">＋</span>
          <span className="font-medium">Add</span>
        </button>
      ) : null}
      </div>
    </div>
  );
}


