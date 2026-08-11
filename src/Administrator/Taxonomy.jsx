// src/Administrator/Taxonomy.jsx
//
// Categories CRUD (Kivistone has no separate "tags" concept, so unlike a
// bigger CMS this page only ever manages one taxonomy).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from './api.js';
import { getCache, setCache } from './adminCache.js';
import { deleteImage, slugify, uploadImage } from './mediaUpload.js';

const CACHE_KEY = 'categories:v1';
const PRODUCTS_CACHE_KEY = 'products:all:v1';

const EMPTY_FORM = {
  slug: '',
  title: '',
  seed: '',
  image: '',
  description: '',
  short: '',
  specs: [],
  feature: false,
};

function toForm(category) {
  return {
    slug: category.slug || '',
    title: category.title || '',
    seed: category.seed || '',
    image: category.image || '',
    description: category.description || '',
    short: category.short || '',
    specs: Array.isArray(category.specs) ? category.specs : [],
    feature: !!category.feature,
  };
}

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
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

function CategoryForm({ initial, onCancel, onSave }) {
  const [form, setForm] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(!!initial.slug && initial.slug !== slugify(initial.title));
  const [specInput, setSpecInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const handleTitleChange = (title) => {
    setForm((f) => ({ ...f, title, slug: slugTouched ? f.slug : slugify(title) }));
  };

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const { url } = await uploadImage(file, { prefix: 'categories', name: form.slug || form.title });
      setForm((f) => ({ ...f, image: url }));
    } catch (err) {
      setError(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const addSpec = () => {
    const value = specInput.trim();
    if (!value) return;
    setForm((f) => ({ ...f, specs: [...f.specs, value] }));
    setSpecInput('');
  };

  const removeSpec = (i) => setForm((f) => ({ ...f, specs: f.specs.filter((_, idx) => idx !== i) }));

  const slugValid = /^[a-z0-9-]+$/.test(form.slug);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !slugValid) {
      setError('Title and a valid slug (lowercase letters, numbers, hyphens) are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      {error && <div className="alert alert-error"><i className="fa-solid fa-triangle-exclamation" />{error}</div>}

      <div className="form-group">
        <label className="form-label">Title</label>
        <input className="form-input" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} required />
      </div>

      <div className="form-group">
        <label className="form-label">Slug</label>
        <input
          className="form-input"
          value={form.slug}
          onChange={(e) => { setSlugTouched(true); setForm((f) => ({ ...f, slug: e.target.value })); }}
          required
        />
        {!slugValid && form.slug && <p className="form-helper form-helper--error">Only lowercase letters, numbers and hyphens allowed.</p>}
      </div>

      <div className="form-group">
        <label className="form-label">Image</label>
        <div className="dropzone" onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
        >
          {form.image ? (
            <img src={form.image} alt="" className="dropzone-preview" />
          ) : (
            <div className="dropzone-placeholder">
              <i className="fa-solid fa-cloud-arrow-up" />
              <span>{uploading ? 'Uploading…' : 'Click or drag an image here'}</span>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files?.[0])} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-textarea" rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
      </div>

      <div className="form-group">
        <label className="form-label">Short description (used as meta description)</label>
        <textarea className="form-textarea" rows={3} value={form.short} onChange={(e) => setForm((f) => ({ ...f, short: e.target.value }))} />
      </div>

      <div className="form-group">
        <label className="form-label">Specs</label>
        <div className="pill-input-wrap">
          {form.specs.map((s, i) => (
            <span key={i} className="pill-item">
              {s}
              <button type="button" onClick={() => removeSpec(i)}><i className="fa-solid fa-xmark" /></button>
            </span>
          ))}
          <input
            className="pill-input-field"
            value={specInput}
            onChange={(e) => setSpecInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSpec(); } }}
            placeholder="Type and press Enter…"
          />
        </div>
      </div>

      <label className="check-row">
        <input type="checkbox" checked={form.feature} onChange={(e) => setForm((f) => ({ ...f, feature: e.target.checked }))} />
        Feature this category (spotlight card)
      </label>

      <div className="modal-footer">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
          {saving ? 'Saving…' : 'Save Category'}
        </button>
      </div>
    </form>
  );
}

export default function Taxonomy() {
  const [searchParams, setSearchParams] = useSearchParams();
  const cached = getCache(CACHE_KEY);
  const [categories, setCategories] = useState(cached || []);
  const [productCounts, setProductCounts] = useState({});
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState('');
  const [modalMode, setModalMode] = useState(null); // null | 'new' | category object
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const load = useCallback(async () => {
    if (!getCache(CACHE_KEY)) setLoading(true);
    setError('');
    try {
      const [cats, products] = await Promise.all([
        api.get('/api/admin/categories'),
        api.get('/api/admin/products'),
      ]);
      setCategories(cats || []);
      setCache(CACHE_KEY, cats || []);
      setCache(PRODUCTS_CACHE_KEY, products || []);
      const counts = {};
      (products || []).forEach((p) => {
        counts[p.category_slug] = (counts[p.category_slug] || 0) + 1;
      });
      setProductCounts(counts);
    } catch (err) {
      setError(err.message || 'Failed to load categories');
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
      slug: form.slug.trim(),
      title: form.title.trim(),
      seed: form.seed.trim() || slugify(form.title),
      image: form.image || null,
      description: form.description.trim(),
      short: form.short.trim(),
      specs: form.specs,
      feature: form.feature,
    };
    if (modalMode === 'new') {
      const created = await api.post('/api/admin/categories', payload);
      setCategories((prev) => [...prev, created]);
    } else {
      const updated = await api.put(`/api/admin/categories/${modalMode.slug}`, payload);
      setCategories((prev) => prev.map((c) => (c.slug === modalMode.slug ? updated : c)));
    }
    setCache(CACHE_KEY, null);
    setModalMode(null);
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError('');
    try {
      await api.del(`/api/admin/categories/${deleteTarget.slug}`);
      if (deleteTarget.image) deleteImage(deleteTarget.image);
      setCategories((prev) => prev.filter((c) => c.slug !== deleteTarget.slug));
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete category');
    }
  };

  const sorted = useMemo(
    () => [...categories].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.title.localeCompare(b.title)),
    [categories],
  );

  return (
    <div className="taxonomy-page">
      <div className="toolbar">
        <p className="page-subtitle">{loading ? 'Loading…' : `${categories.length} categories`}</p>
        <button type="button" className="btn btn-primary" onClick={() => setModalMode('new')}>
          <i className="fa-solid fa-plus" /> New Category
        </button>
      </div>

      {error && <div className="alert alert-error"><i className="fa-solid fa-triangle-exclamation" />{error}</div>}

      <div className="category-grid">
        {sorted.map((c) => (
          <div key={c.slug} className="category-card">
            <div className="category-card-image">
              {c.image ? <img src={c.image} alt="" /> : <i className="fa-solid fa-image" />}
              {c.feature && <span className="pill pill-neutral category-card-feature-pill">Featured</span>}
              <div className="category-card-actions">
                <button type="button" className="icon-btn" onClick={() => setModalMode(c)} title="Edit">
                  <i className="fa-solid fa-pen" />
                </button>
                <button type="button" className="icon-btn danger" onClick={() => setDeleteTarget(c)} title="Delete">
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            </div>
            <div className="category-card-body">
              <h3 className="category-card-title">{c.title}</h3>
              <p className="category-card-count">{productCounts[c.slug] || 0} products</p>
            </div>
          </div>
        ))}
        {!loading && sorted.length === 0 && <p className="empty-state">No categories yet.</p>}
      </div>

      <Modal open={!!modalMode} title={modalMode === 'new' ? 'New Category' : `Edit ${modalMode?.title || ''}`} onClose={() => setModalMode(null)}>
        {modalMode && (
          <CategoryForm
            initial={modalMode === 'new' ? EMPTY_FORM : toForm(modalMode)}
            onCancel={() => setModalMode(null)}
            onSave={handleSave}
          />
        )}
      </Modal>

      <Modal open={!!deleteTarget} title="Delete Category" onClose={() => { setDeleteTarget(null); setDeleteError(''); }}>
        <p className="confirm-msg">
          Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This cannot be undone.
        </p>
        {deleteError && <div className="alert alert-error"><i className="fa-solid fa-triangle-exclamation" />{deleteError}</div>}
        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={() => { setDeleteTarget(null); setDeleteError(''); }}>Cancel</button>
          <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
