'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { expertiseApi, uploadApi } from '../../lib/api';
import { Expertise } from '../../lib/types';

export default function OurExpertisePage() {
  const [expertiseItems, setExpertiseItems] = useState<Expertise[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Expertise | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingImage, setPendingImage] = useState<{file: File, preview: string} | null>(null);
  const [formData, setFormData] = useState<Omit<Expertise, 'id'>>({
    category: '',
    name: '',
    image: '',
    description: '',
    points: [''],
  });

  const expertiseCategories = Array.from(new Set(expertiseItems.map(item => item.category).filter(Boolean)));

  const filteredItems = expertiseItems.filter((item) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = (
      item.category.toLowerCase().includes(query) ||
      item.name.toLowerCase().includes(query)
    );
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormData({
      category: '',
      name: '',
      image: '',
      description: '',
      points: [''],
    });
    setEditingItem(null);
    setPendingImage(null);
  };

  const loadExpertise = async () => {
    try {
      const response = await expertiseApi.list();
      setExpertiseItems(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to load expertise', error);
      alert('Failed to load expertise from API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpertise();
  }, []);

  const addPointField = () => {
    setFormData((prev) => ({ ...prev, points: [...prev.points, ''] }));
  };

  const updatePoint = (index: number, value: string) => {
    const updatedPoints = [...formData.points];
    updatedPoints[index] = value;
    setFormData((prev) => ({ ...prev, points: updatedPoints }));
  };

  const removePoint = (index: number) => {
    if (formData.points.length === 1) {
      return;
    }
    const updatedPoints = formData.points.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, points: updatedPoints }));
  };

  const handleAddItem = async () => {
    const validPoints = formData.points.map((p) => p.trim()).filter(Boolean);
    if (!formData.category || !formData.name || !formData.description) {
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = formData.image;
      if (pendingImage) {
        finalImageUrl = await uploadApi.uploadFile(pendingImage.file);
      }

      const newItem = await expertiseApi.create({
        category: formData.category.trim(),
        name: formData.name.trim(),
        image: finalImageUrl?.trim() || null,
        description: formData.description.trim(),
        points: validPoints,
      });
      setExpertiseItems((prev) => [newItem, ...prev]);
      setShowAddForm(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create expertise', error);
      alert('Failed to create expertise.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditItem = (item: Expertise) => {
    setEditingItem(item);
    setFormData({
      category: item.category || '',
      name: item.name || '',
      image: item.image || '',
      description: item.description || '',
      points: item.points?.length ? item.points : [''],
    });
    setShowAddForm(true);
  };

  const handleUpdateItem = async () => {
    if (!editingItem) {
      return;
    }
    const validPoints = formData.points.map((p) => p.trim()).filter(Boolean);
    if (!formData.category || !formData.name || !formData.description) {
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = formData.image;
      if (pendingImage) {
        finalImageUrl = await uploadApi.uploadFile(pendingImage.file);
      }

      const updated = await expertiseApi.update(editingItem.id, {
        category: formData.category.trim(),
        name: formData.name.trim(),
        image: finalImageUrl?.trim() || null,
        description: formData.description.trim(),
        points: validPoints,
      });
      setExpertiseItems((prev) => prev.map((item) => (item.id === editingItem.id ? updated : item)));
      setShowAddForm(false);
      resetForm();
    } catch (error) {
      console.error('Failed to update expertise', error);
      alert('Failed to update expertise.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: string | number) => {
    if (confirm('Are you sure you want to delete this expertise item?')) {
      try {
        await expertiseApi.remove(id);
        setExpertiseItems((prev) => prev.filter((item) => item.id !== id));
      } catch (error) {
        console.error('Failed to delete expertise', error);
        alert('Failed to delete expertise.');
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    setPendingImage({
      file,
      preview: URL.createObjectURL(file)
    });
    e.target.value = '';
  };

  const removePendingImage = () => setPendingImage(null);
  const removeExistingImage = () => setFormData({ ...formData, image: '' });

  return (
    <AdminLayout>
      <div className="fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="header-title">Our Expertise Management</h1>
          <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
            + Add Expertise
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by category or expertise name..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-48">
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {expertiseCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="p-4">Loading expertise...</div>
          ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Name</th>
                <th>Image</th>
                <th>Description</th>
                <th>Points</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.category}</td>
                  <td className="font-medium">{item.name}</td>
                  <td>
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                    ) : (
                      <span className="text-sm text-gray-500">No image</span>
                    )}
                  </td>
                  <td>{item.description}</td>
                  <td>{item.points.length} point(s)</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-secondary btn-sm" onClick={() => handleEditItem(item)}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteItem(item.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>

        {showAddForm && (
          <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
            <div className="modal-content max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="text-xl font-semibold">{editingItem ? 'Edit Expertise' : 'Add Expertise'}</h2>
                <button onClick={() => setShowAddForm(false)} className="btn btn-secondary btn-sm">
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <input
                      type="text"
                      className="form-input"
                      list="expertise-categories-list"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Enter or select category"
                    />
                    <datalist id="expertise-categories-list">
                      {expertiseCategories.map((category) => (
                        <option key={category} value={category} />
                      ))}
                    </datalist>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter expertise name"
                    />
                  </div>

                  <div className="form-group md:col-span-2">
                    <label className="form-label">Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-input"
                      onChange={handleImageUpload}
                      disabled={isSubmitting || pendingImage !== null}
                    />

                    {formData.image && !pendingImage && (
                      <div className="mt-2 relative inline-block group">
                        <img src={formData.image} alt="Preview" className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200" />
                        <button
                          type="button"
                          onClick={removeExistingImage}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    )}

                    {pendingImage && (
                      <div className="mt-2 relative inline-block group">
                        <img src={pendingImage.preview} alt="New Preview" className="w-24 h-24 object-cover rounded-lg border-2 border-blue-400" />
                        <span className="absolute bottom-1 right-1 bg-blue-500 text-white text-xs px-1 rounded">New</span>
                        <button
                          type="button"
                          onClick={removePendingImage}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="form-group md:col-span-2">
                    <label className="form-label">Description *</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter short description"
                    />
                  </div>

                  <div className="form-group md:col-span-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="form-label mb-0">Points</label>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={addPointField}>
                        + Add Point
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.points.map((point, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            className="form-input"
                            value={point}
                            onChange={(e) => updatePoint(index, e.target.value)}
                            placeholder={`Point ${index + 1}`}
                          />
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => removePoint(index)}
                            disabled={formData.points.length === 1}
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={editingItem ? handleUpdateItem : handleAddItem}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving (Uploading files)...' : (editingItem ? 'Update Expertise' : 'Add Expertise')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
