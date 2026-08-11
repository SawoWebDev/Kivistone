// src/Administrator/Products.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from './api.js';
import { getCache, setCache } from './adminCache.js';
import { deleteImage, slugify, uploadImage } from './mediaUpload.js';

const CACHE_KEY = 'products:v1';
const CATEGORIES_CACHE_KEY = 'categories:v1';

const EMPTY_FORM = {
  id: '',
  name: '',
  category_slug: '',
  size_mm: '',
  weightMode: 'kg', // "kg" | "label"
  weight_kg: '',
  weight_label: '',
  image: '',
  status: 'published',
  visible: true,
  sort_order: 0,
  meta_title: '',
  meta_description: '',
};

function toForm(product) {
  return {
    id: product.id || '',
    name: product.name || '',
    category_slug: product.category_slug || '',
    size_mm: product.size_mm || '',
    weightMode: product.weight_label ? 'label' : 'kg',
    weight_kg: product.weight_kg ?? '',
    weight_label: product.weight_label || '',
    image: product.image || '',
    status: product.status || 'published',
    visible: product.visible !== false,
    sort_order: product.sort_order ?? 0,
    meta_title: product.meta_title || '',
    meta_description: product.meta_description || '',
  };
}

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

function ProductForm({ initial, categories, isNew, onCancel, onSave }) {
  const [form, setForm] = useState(initial);
  const [idTouched, setIdTouched] = useState(!isNew);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleNameChange = (name) => {
    setForm((f) => ({ ...f, name, id: idTouched ? f.id : slugify(name) }));
  };

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const { url } = await uploadImage(file, { prefix: 'products', name: form.id || form.name });
      setForm((f) => ({ ...f, image: url }));
    } catch (err) {
      setError(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const idValid = /^[a-z0-9-]+$/.test(form.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !idValid || !form.category_slug) {
      setError('Name, a valid id, and a category are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      {error && <div className="alert alert-error"><i className="fa-solid fa-triangle-exclamation" />{error}</div>}

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Name</label>
          <input className="form-input" value={form.name} onChange={(e) => handleNameChange(e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">ID (slug)</label>
          <input
            className="form-input"
            value={form.id}
            onChange={(e) => { setIdTouched(true); setForm((f) => ({ ...f, id: e.target.value })); }}
            disabled={!isNew}
            required
          />
          {isNew && !idValid && form.id && <p className="form-helper form-helper--error">Only lowercase letters, numbers and hyphens allowed.</p>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Category</label>
        <select className="form-select" value={form.category_slug} onChange={(e) => setForm((f) => ({ ...f, category_slug: e.target.value }))} required>
          <option value="">Select a category…</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Size (mm)</label>
          <input className="form-input" value={form.size_mm} onChange={(e) => setForm((f) => ({ ...f, size_mm: e.target.value }))} placeholder="e.g. 90 x 60" />
        </div>
        <div className="form-group">
          <label className="form-label">Weight</label>
          <div className="weight-toggle">
            <button type="button" className={`weight-toggle-btn${form.weightMode === 'kg' ? ' active' : ''}`} onClick={() => setForm((f) => ({ ...f, weightMode: 'kg' }))}>kg</button>
            <button type="button" className={`weight-toggle-btn${form.weightMode === 'label' ? ' active' : ''}`} onClick={() => setForm((f) => ({ ...f, weightMode: 'label' }))}>label</button>
          </div>
          {form.weightMode === 'kg' ? (
            <input
              type="number"
              step="0.01"
              className="form-input"
              value={form.weight_kg}
              onChange={(e) => setForm((f) => ({ ...f, weight_kg: e.target.value }))}
              placeholder="e.g. 1.2"
            />
          ) : (
            <input
              className="form-input"
              value={form.weight_label}
              onChange={(e) => setForm((f) => ({ ...f, weight_label: e.target.value }))}
              placeholder="e.g. Varies by size"
            />
          )}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Image</label>
        <div
          className="dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
          onClick={() => document.getElementById('product-image-input')?.click()}
        >
          {form.image ? (
            <img src={form.image} alt="" className="dropzone-preview" />
          ) : (
            <div className="dropzone-placeholder">
              <i className="fa-solid fa-cloud-arrow-up" />
              <span>{uploading ? 'Uploading…' : 'Click or drag an image here'}</span>
            </div>
          )}
          <input id="product-image-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files?.[0])} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Sort order</label>
          <input type="number" className="form-input" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} />
        </div>
      </div>

      <label className="check-row">
        <input type="checkbox" checked={form.visible} onChange={(e) => setForm((f) => ({ ...f, visible: e.target.checked }))} />
        Visible on the public site
      </label>

      <div className="form-group">
        <label className="form-label">Meta title <span className="form-label-optional">(optional)</span></label>
        <input className="form-input" value={form.meta_title} onChange={(e) => setForm((f) => ({ ...f, meta_title: e.target.value }))} />
      </div>

      <div className="form-group">
        <label className="form-label">Meta description <span className="form-label-optional">(optional)</span></label>
        <textarea className="form-textarea" rows={3} value={form.meta_description} onChange={(e) => setForm((f) => ({ ...f, meta_description: e.target.value }))} />
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
          {saving ? 'Saving…' : 'Save Product'}
        </button>
      </div>
    </form>
  );
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const cached = getCache(CACHE_KEY);
  const [products, setProducts] = useState(cached || []);
  const [categories, setCategories] = useState(getCache(CATEGORIES_CACHE_KEY) || []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState('');
  const [modalMode, setModalMode] = useState(null); // null | 'new' | product object
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(async () => {
    if (!getCache(CACHE_KEY)) setLoading(true);
    setError('');
    try {
      const [prods, cats] = await Promise.all([
        api.get('/api/admin/products'),
        api.get('/api/admin/categories'),
      ]);
      setProducts(prods || []);
      setCategories(cats || []);
      setCache(CACHE_KEY, prods || []);
      setCache(CATEGORIES_CACHE_KEY, cats || []);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setModalMode('new');
      searchParams.delete('new');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (form) => {
    const payload = {
      name: form.name.trim(),
      category_slug: form.category_slug,
      size_mm: form.size_mm.trim() || null,
      weight_kg: form.weightMode === 'kg' && form.weight_kg !== '' ? Number(form.weight_kg) : null,
      weight_label: form.weightMode === 'label' ? (form.weight_label.trim() || null) : null,
      image: form.image || null,
      status: form.status,
      visible: form.visible,
      sort_order: form.sort_order,
      meta_title: form.meta_title.trim() || null,
      meta_description: form.meta_description.trim() || null,
    };

    if (modalMode === 'new') {
      const created = await api.post('/api/admin/products', { ...payload, id: form.id.trim() });
      setProducts((prev) => [...prev, created]);
    } else {
      const updated = await api.put(`/api/admin/products/${modalMode.id}`, payload);
      setProducts((prev) => prev.map((p) => (p.id === modalMode.id ? updated : p)));
    }
    setCache(CACHE_KEY, null);
    setModalMode(null);
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.del(`/api/admin/products/${deleteTarget.id}`);
      if (deleteTarget.image) deleteImage(deleteTarget.image);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message || 'Failed to delete product');
    }
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search && !p.name?.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter && p.category_slug !== categoryFilter) return false;
      if (statusFilter && p.status !== statusFilter) return false;
      return true;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const categoryTitle = (slug) => categories.find((c) => c.slug === slug)?.title || slug;

  return (
    <div className="products-page">
      <div className="toolbar">
        <div className="search-wrap">
          <i className="fa-solid fa-magnifying-glass" />
          <input className="search-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name…" />
        </div>
        <select className="filter-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
        </select>
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <button type="button" className="btn btn-primary" onClick={() => setModalMode('new')}>
          <i className="fa-solid fa-plus" /> New Product
        </button>
      </div>

      {error && <div className="alert alert-error"><i className="fa-solid fa-triangle-exclamation" />{error}</div>}

      <div className="product-grid">
        {filtered.map((p) => (
          <div key={p.id} className="product-card">
            <div className="product-card-image">
              {p.image ? <img src={p.image} alt="" /> : <i className="fa-solid fa-image" />}
              <span className={`pill product-card-status ${p.status === 'published' ? 'pill-create' : 'pill-neutral'}`}>
                {p.status === 'published' ? 'Published' : 'Draft'}
              </span>
              <div className="product-card-actions">
                <button type="button" className="icon-btn" onClick={() => setModalMode(p)} title="Edit"><i className="fa-solid fa-pen" /></button>
                <button type="button" className="icon-btn danger" onClick={() => setDeleteTarget(p)} title="Delete"><i className="fa-solid fa-trash" /></button>
              </div>
            </div>
            <div className="product-card-body">
              <span className="pill pill-neutral product-card-category">{categoryTitle(p.category_slug)}</span>
              <h3 className="product-card-title">{p.name}</h3>
              <p className="product-card-subtitle">
                {[p.size_mm, p.weight_kg ? `${p.weight_kg} kg` : p.weight_label].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>
        ))}
        {!loading && filtered.length === 0 && <p className="empty-state">No products match the current filters.</p>}
      </div>

      <Modal open={!!modalMode} title={modalMode === 'new' ? 'New Product' : `Edit ${modalMode?.name || ''}`} onClose={() => setModalMode(null)}>
        {modalMode && (
          <ProductForm
            initial={modalMode === 'new' ? EMPTY_FORM : toForm(modalMode)}
            categories={categories}
            isNew={modalMode === 'new'}
            onCancel={() => setModalMode(null)}
            onSave={handleSave}
          />
        )}
      </Modal>

      <Modal open={!!deleteTarget} title="Delete Product" onClose={() => setDeleteTarget(null)}>
        <p className="confirm-msg">
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
        </p>
        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
          <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
