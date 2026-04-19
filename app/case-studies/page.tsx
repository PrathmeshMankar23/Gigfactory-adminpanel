'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { caseStudiesApi, uploadApi } from '../../lib/api';
import { CaseStudy } from '../../lib/types';

export default function CaseStudiesPage() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingCaseStudy, setEditingCaseStudy] = useState<CaseStudy | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingImage, setPendingImage] = useState<{file: File, preview: string} | null>(null);
  const [pendingPdf, setPendingPdf] = useState<{file: File, name: string} | null>(null);

  const [formData, setFormData] = useState<Omit<CaseStudy, 'id'>>({
    name: '',
    category: '',
    image: '',
    features: '',
    pdfLink: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      image: '',
      features: '',
      pdfLink: '',
    });
    setPendingImage(null);
    setPendingPdf(null);
  };

  const loadCaseStudies = async () => {
    try {
      const response = await caseStudiesApi.list();
      setCaseStudies((response as CaseStudy[]) || []);
    } catch (error) {
      console.error('Failed to load case studies', error);
      alert('Failed to load case studies from API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCaseStudies();
  }, []);

  const caseStudyCategories = Array.from(new Set(caseStudies.map(cs => cs.category).filter(Boolean)));

  const filteredCaseStudies = caseStudies.filter(caseStudy => {
    const matchesSearch = caseStudy.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || caseStudy.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddCaseStudy = async () => {
    if (formData.name && formData.category && formData.features) {
      setIsSubmitting(true);
      try {
        let finalImageUrl = formData.image;
        if (pendingImage) {
          finalImageUrl = await uploadApi.uploadFile(pendingImage.file);
        }

        let finalPdfUrl = formData.pdfLink;
        if (pendingPdf) {
          finalPdfUrl = await uploadApi.uploadFile(pendingPdf.file);
        }

        const payload = { 
          name: formData.name, 
          category: formData.category, 
          features: formData.features, 
          image: finalImageUrl || null, 
          pdfLink: finalPdfUrl || null 
        };
        const newCaseStudy = await caseStudiesApi.create(payload);
        setCaseStudies((prev) => [newCaseStudy, ...prev]);
        resetForm();
        setShowAddForm(false);
      } catch (error) {
        console.error('Failed to create case study', error);
        alert('Failed to create case study.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEditCaseStudy = (caseStudy: CaseStudy) => {
    setEditingCaseStudy(caseStudy);
    setFormData({
      name: caseStudy.name || '',
      category: caseStudy.category || '',
      image: caseStudy.image || '',
      features: caseStudy.features || '',
      pdfLink: caseStudy.pdfLink || '',
    });
    setShowAddForm(true);
  };

  const handleUpdateCaseStudy = async () => {
    if (editingCaseStudy && formData.name && formData.category && formData.features) {
      setIsSubmitting(true);
      try {
        let finalImageUrl = formData.image;
        if (pendingImage) {
          finalImageUrl = await uploadApi.uploadFile(pendingImage.file);
        }

        let finalPdfUrl = formData.pdfLink;
        if (pendingPdf) {
          finalPdfUrl = await uploadApi.uploadFile(pendingPdf.file);
        }

        const payload = { 
          name: formData.name, 
          category: formData.category, 
          features: formData.features, 
          image: finalImageUrl || null, 
          pdfLink: finalPdfUrl || null 
        };
        const updatedCaseStudy = await caseStudiesApi.update(editingCaseStudy.id, payload);
        setCaseStudies((prev) => prev.map((cs) => (cs.id === editingCaseStudy.id ? updatedCaseStudy : cs)));
        setEditingCaseStudy(null);
        resetForm();
        setShowAddForm(false);
      } catch (error) {
        console.error('Failed to update case study', error);
        alert('Failed to update case study.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteCaseStudy = async (caseStudyId: string | number) => {
    if (confirm('Are you sure you want to delete this case study?')) {
      try {
        await caseStudiesApi.remove(caseStudyId);
        setCaseStudies((prev) => prev.filter((cs) => cs.id !== caseStudyId));
      } catch (error) {
        console.error('Failed to delete case study', error);
        alert('Failed to delete case study.');
      }
    }
  };

  const handleViewCaseStudy = (pdfLink?: string | null) => {
    if (!pdfLink) {
      alert('No PDF link added for this case study.');
      return;
    }
    // Ensure the link opens in a new tab and bypass potential Cloudinary image viewing issues
    window.open(pdfLink, '_blank', 'noopener,noreferrer');
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

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    setPendingPdf({
      file,
      name: file.name
    });
    e.target.value = '';
  };

  const removePendingImage = () => setPendingImage(null);
  const removeExistingImage = () => setFormData({ ...formData, image: '' });
  
  const removePendingPdf = () => setPendingPdf(null);
  const removeExistingPdf = () => setFormData({ ...formData, pdfLink: '' });

  return (
    <AdminLayout>
      <div className="fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="header-title">Case Studies Management</h1>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowAddForm(true)}
          >
            + Add New Case Study
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search case studies..."
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
              {caseStudyCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Case Studies Table */}
        <div className="table-container">
          {loading ? (
            <div className="p-4">Loading case studies...</div>
          ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Case Study Name</th>
                <th>Category</th>
                <th>Image</th>
                <th>Features</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCaseStudies.map((caseStudy) => (
                <tr key={caseStudy.id}>
                  <td>
                    <div>
                      <div className="font-medium">{caseStudy.name}</div>
                    </div>
                  </td>
                  <td>{caseStudy.category}</td>
                  <td>
                    {caseStudy.image ? (
                      <img src={caseStudy.image} alt={caseStudy.name} className="w-16 h-16 object-cover rounded" />
                    ) : (
                      <span className="text-sm text-gray-500">No image</span>
                    )}
                  </td>
                  <td>{caseStudy.features}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleViewCaseStudy(caseStudy.pdfLink)}
                        title="Open Case Study PDF"
                      >
                        View Case Study
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleEditCaseStudy(caseStudy)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteCaseStudy(caseStudy.id)}
                      >
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

        {/* Add/Edit Case Study Modal */}
        {showAddForm && (
          <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
            <div className="modal-content max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="text-xl font-semibold">
                  {editingCaseStudy ? 'Edit Case Study' : 'Add New Case Study'}
                </h2>
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="btn btn-secondary btn-sm"
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Case Study Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter case study name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <input
                      type="text"
                      className="form-input"
                      list="case-study-categories-list"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Write or select category"
                    />
                    <datalist id="case-study-categories-list">
                      {caseStudyCategories.map((category) => (
                        <option key={category} value={category} />
                      ))}
                    </datalist>
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
                    <label className="form-label">Features *</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      value={formData.features}
                      onChange={(e) => setFormData({...formData, features: e.target.value})}
                      placeholder="Enter case study features"
                    />
                  </div>
                  
                  <div className="form-group md:col-span-2">
                    <label className="form-label">PDF File</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="form-input"
                      onChange={handlePdfUpload}
                      disabled={isSubmitting || pendingPdf !== null}
                    />
                    
                    {formData.pdfLink && !pendingPdf && (
                      <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
                        ✓ Existing PDF (<a href={formData.pdfLink} target="_blank" rel="noopener noreferrer" className="underline text-blue-500">View</a>)
                        <button type="button" onClick={removeExistingPdf} className="text-red-500 bg-red-100 rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-200">×</button>
                      </div>
                    )}

                    {pendingPdf && (
                      <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
                        📄 New PDF selected: {pendingPdf.name}
                        <button type="button" onClick={removePendingPdf} className="text-red-500 bg-red-100 rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-200">×</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingCaseStudy(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={editingCaseStudy ? handleUpdateCaseStudy : handleAddCaseStudy}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving (Uploading files)...' : (editingCaseStudy ? 'Update Case Study' : 'Add Case Study')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
