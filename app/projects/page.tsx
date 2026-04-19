'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { projectsApi, uploadApi } from '../../lib/api';
import { Project } from '../../lib/types';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingImages, setPendingImages] = useState<{file: File, preview: string}[]>([]);

  const [formData, setFormData] = useState<Omit<Project, 'id'>>({
    name: '',
    category: '',
    status: 'ongoing',
    description: '',
    scope: '',
    area: '',
    location: '',
    images: [],
  });

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      status: 'ongoing',
      description: '',
      scope: '',
      area: '',
      location: '',
      images: [],
    });
    setPendingImages([]);
  };

  const loadProjects = async () => {
    try {
      const response = await projectsApi.list();
      setProjects(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to load projects', error);
      alert('Failed to load projects from API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const projectCategories = Array.from(new Set(projects.map(p => p.category).filter(Boolean)));

  const filteredProjects = projects.filter(project => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = (
      project.name.toLowerCase().includes(query) ||
      project.location.toLowerCase().includes(query)
    );
    const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const uploadPendingImages = async (): Promise<string[]> => {
    if (pendingImages.length === 0) return [];
    setIsSubmitting(true);
    const uploadPromises = pendingImages.map(item => uploadApi.uploadFile(item.file));
    return await Promise.all(uploadPromises);
  };

  const handleAddProject = async () => {
    if (formData.name && formData.category && formData.status && formData.description && formData.scope && formData.area && formData.location) {
      try {
        const newUrls = await uploadPendingImages();
        const finalImages = [...formData.images, ...newUrls];

        const newProject = await projectsApi.create({
          name: formData.name,
          category: formData.category,
          status: formData.status,
          description: formData.description,
          scope: formData.scope,
          area: formData.area,
          location: formData.location,
          images: finalImages,
        });
        setProjects((prev) => [...prev, newProject]);
        resetForm();
        setShowAddForm(false);
      } catch (error) {
        console.error('Failed to create project', error);
        alert('Failed to create project.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name || '',
      category: project.category || '',
      status: project.status || 'ongoing',
      description: project.description || '',
      scope: project.scope || '',
      area: project.area || '',
      location: project.location || '',
      images: project.images || [],
    });
    setShowAddForm(true);
  };

  const handleUpdateProject = async () => {
    if (editingProject && formData.name && formData.category && formData.status && formData.description && formData.scope && formData.area && formData.location) {
      try {
        const newUrls = await uploadPendingImages();
        const finalImages = [...formData.images, ...newUrls];

        const updatedProject = await projectsApi.update(editingProject.id, {
          name: formData.name,
          category: formData.category,
          status: formData.status,
          description: formData.description,
          scope: formData.scope,
          area: formData.area,
          location: formData.location,
          images: finalImages,
        });
        setProjects((prev) => prev.map((p) => (p.id === editingProject.id ? updatedProject : p)));
        setEditingProject(null);
        resetForm();
        setShowAddForm(false);
      } catch (error) {
        console.error('Failed to update project', error);
        alert('Failed to update project.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteProject = async (projectId: string | number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await projectsApi.remove(projectId);
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
      } catch (error) {
        console.error('Failed to delete project', error);
        alert('Failed to delete project.');
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);
    
    const availableSlots = 3 - (formData.images.length + pendingImages.length);
    if (availableSlots <= 0) return;
    
    const filesToAdd = files.slice(0, availableSlots);
    const newPending = filesToAdd.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setPendingImages(prev => [...prev, ...newPending]);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  const removePendingImage = (index: number) => {
    setPendingImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <AdminLayout>
      <div className="fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="header-title">Projects Management</h1>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowAddForm(true)}
          >
            + Add New Project
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by project name or location..."
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
              {projectCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Projects Table */}
        <div className="table-container">
          {loading ? (
            <div className="p-4">Loading projects...</div>
          ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Category</th>
                <th>Status</th>
                <th>Description</th>
                <th>Scope</th>
                <th>Area</th>
                <th>Location</th>
                <th>Images</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.id}>
                  <td className="font-medium">{project.name}</td>
                  <td>{project.category || '-'}</td>
                  <td className="capitalize">{project.status || '-'}</td>
                  <td>{project.description}</td>
                  <td>{project.scope}</td>
                  <td>{project.area}</td>
                  <td>{project.location}</td>
                  <td>{project.images?.length || 0}/3</td>
                  <td>
                    <div className="flex gap-2">
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleEditProject(project)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteProject(project.id)}
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

        {/* Add/Edit Project Modal */}
        {showAddForm && (
          <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
            <div className="modal-content max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="text-xl font-semibold">
                  {editingProject ? 'Edit Project' : 'Add New Project'}
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
                <div className="form-group md:col-span-2">
                  <label className="form-label">Project Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter project name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <input
                    type="text"
                    className="form-input"
                    list="project-categories-list"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Write or select category"
                  />
                  <datalist id="project-categories-list">
                    {projectCategories.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </div>

                <div className="form-group">
                  <label className="form-label">Status *</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                <div className="form-group md:col-span-2">
                  <label className="form-label">Project Images (Max 3)</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="form-input"
                        onChange={handleImageUpload}
                        disabled={(formData.images.length + pendingImages.length) >= 3 || isSubmitting}
                      />
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {formData.images.length + pendingImages.length}/3 images
                      </span>
                    </div>
                    {((formData.images.length > 0) || (pendingImages.length > 0)) && (
                      <div className="flex gap-3 flex-wrap">
                        {formData.images.map((image, index) => (
                          <div key={`existing-${index}`} className="relative group">
                            <img 
                              src={image} 
                              alt={`Project existing image ${index + 1}`}
                              className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {pendingImages.map((item, index) => (
                          <div key={`pending-${index}`} className="relative group">
                            <img 
                              src={item.preview} 
                              alt={`Project pending image ${index + 1}`}
                              className="w-24 h-24 object-cover rounded-lg border-2 border-blue-400"
                            />
                            <span className="absolute bottom-1 right-1 bg-blue-500 text-white text-xs px-1 rounded">New</span>
                            <button
                              type="button"
                              onClick={() => removePendingImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="form-group md:col-span-2">
                  <label className="form-label">Project Description *</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Enter detailed project description"
                  />
                </div>
                
                <div className="form-group md:col-span-2">
                  <label className="form-label">Scope *</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={formData.scope}
                    onChange={(e) => setFormData({...formData, scope: e.target.value})}
                    placeholder="Enter project scope and objectives"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Area *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                    placeholder="e.g., 5000 sq ft"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Enter project location"
                  />
                </div>
              </div>
              
              </div>

              <div className="modal-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingProject(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={editingProject ? handleUpdateProject : handleAddProject}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving (Uploading files)...' : (editingProject ? 'Update Project' : 'Add Project')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
