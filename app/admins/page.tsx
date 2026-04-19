'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useUser } from '../components/UserContext';
import { Admin } from '../../lib/types';
import { adminsApi } from '../../lib/api';

export default function AdminsPage() {
  const { user, loading: userLoading } = useUser();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN',
  });

  const loadAdmins = async () => {
    try {
      const data = await adminsApi.list();
      setAdmins(data);
    } catch (error) {
      console.error('Failed to load admins', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      loadAdmins();
    }
  }, [user]);

  const handleAddAdmin = async () => {
    if (formData.name && formData.email && formData.password) {
      setIsSubmitting(true);
      try {
        const newAdmin = await adminsApi.create(formData);
        setAdmins([...admins, newAdmin]);
        resetForm();
        setShowAddForm(false);
      } catch (error) {
        console.error('Failed to add admin', error);
        alert('Failed to add admin. Email might already exist.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      alert('Please fill in all required fields.');
    }
  };

  const handleUpdateAdmin = async () => {
    if (editingAdmin && formData.name && formData.email) {
      setIsSubmitting(true);
      try {
        const updatedAdmin = await adminsApi.update(editingAdmin.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          ...(formData.password ? { password: formData.password } : {}),
        });
        setAdmins(admins.map((a) => (a.id === editingAdmin.id ? updatedAdmin : a)));
        resetForm();
        setShowAddForm(false);
      } catch (error) {
        console.error('Failed to update admin', error);
        alert('Failed to update admin.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteAdmin = async (adminId: string | number) => {
    if (adminId === user?.id) {
      alert('You cannot delete your own account.');
      return;
    }
    
    if (confirm('Are you sure you want to delete this administrator?')) {
      try {
        await adminsApi.remove(adminId);
        setAdmins(admins.filter((a) => a.id !== adminId));
      } catch (error) {
        console.error('Failed to delete admin', error);
        alert('Failed to delete admin.');
      }
    }
  };

  const resetForm = () => {
    setEditingAdmin(null);
    setShowAddForm(false);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'ADMIN',
    });
  };

  const filteredAdmins = admins.filter((admin) =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!userLoading && user?.role !== 'SUPER_ADMIN') {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center fade-in">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            You do not have the necessary permissions to access the administrator management panel.
            Only <strong>Super Admins</strong> can manage other administrative accounts.
          </p>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="mt-6 btn btn-primary"
          >
            Return to Dashboard
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="header-title">Admin Management</h1>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowAddForm(true)}
          >
            + Add New Admin
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search admins by name or email..."
            className="form-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="table-container">
          {loading ? (
            <div className="p-4">Loading administrators...</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.map((admin) => (
                  <tr key={admin.id}>
                    <td className="font-medium">{admin.name}</td>
                    <td>{admin.email}</td>
                    <td>
                      <span className={`badge ${admin.role === 'SUPER_ADMIN' ? 'badge-info' : 'badge-warning'}`}>
                        {admin.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setEditingAdmin(admin);
                            setFormData({
                              name: admin.name,
                              email: admin.email,
                              password: '', // Don't show password
                              role: admin.role,
                            });
                            setShowAddForm(true);
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteAdmin(admin.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAdmins.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      No administrators found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Add/Edit Admin Modal */}
        {showAddForm && (
          <div className="modal-overlay" onClick={resetForm}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="text-xl font-semibold">
                  {editingAdmin ? 'Edit Administrator' : 'Add New Administrator'}
                </h2>
                <button onClick={resetForm} className="btn btn-secondary btn-sm">✕</button>
              </div>
              
              <div className="modal-body">
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Rahul Sharma"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      className="form-input"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="e.g. rahul@gigfactory.com"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password {editingAdmin ? '(Leave blank to keep current)' : '*'}</label>
                    <input
                      type="password"
                      className="form-input"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder={editingAdmin ? "••••••••" : "Enter a secure password"}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Role *</label>
                    <select
                      className="form-select"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                    >
                      <option value="ADMIN">Regular Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.role === 'SUPER_ADMIN' 
                        ? 'Super Admins can manage other administrators and settings.' 
                        : 'Regular Admins can only manage Projects, Case Studies, and Expertise.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                <button 
                  className="btn btn-primary"
                  onClick={editingAdmin ? handleUpdateAdmin : handleAddAdmin}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : (editingAdmin ? 'Update Admin' : 'Create Admin')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}