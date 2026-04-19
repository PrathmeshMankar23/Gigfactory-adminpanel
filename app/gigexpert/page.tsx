'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { gigExpertFeedbackApi } from '../../lib/api';
import { GigExpertFeedback, ApplicationStatus } from '../../lib/types';
import { downloadCSV, triggerPrint } from '../../lib/exportUtils';


export default function GigExpertRecruitmentPage() {
  const [applications, setApplications] = useState<GigExpertFeedback[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<GigExpertFeedback | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadApplications = async () => {
    try {
      const response = await gigExpertFeedbackApi.list();
      setApplications(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to load gigexpert applications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (application: GigExpertFeedback) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const updated = await gigExpertFeedbackApi.update(id, { status: newStatus as ApplicationStatus });
      setApplications((prev) => prev.map((app) => (app.id === id ? updated : app)));
    } catch (error) {
      console.error('Failed to update gigexpert status', error);
      alert('Failed to update application status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return;
    try {
      await gigExpertFeedbackApi.remove(id);
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch (error) {
      console.error('Failed to delete gigexpert application', error);
      alert('Failed to delete application.');
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const statusClasses: Record<ApplicationStatus, string> = {
      pending: 'badge-warning',
      reviewing: 'badge-info',
      approved: 'badge-success',
      rejected: 'badge-danger',
    };
    return statusClasses[status] || 'badge-secondary';
  };

  return (
    <AdminLayout>
      <div className="fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="header-title">GigExpert Feedback & Recruitment</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name or email..."
              className="form-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"></span>
          </div>

          <div className="w-full md:w-64">
            <select
              className="form-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex gap-2 print:hidden">
            <button
              className="btn btn-secondary"
              onClick={() => downloadCSV(filteredApplications, 'gigexpert_feedback_all')}
              title="Download filtered results as CSV"
            >
              📊 Export All (CSV)
            </button>
          </div>
        </div>



        <div className="table-container">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading applications...</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Expert Name</th>
                  <th>Type</th>
                  <th>Experience</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Submission Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((application) => (
                  <tr key={application.id}>
                    <td className="font-bold text-emerald-600">{application.name}</td>
                    <td className="text-sm">{application.expertType}</td>
                    <td>{application.experience}</td>
                    <td>{application.location}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(application.status)}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </td>
                    <td className="text-xs">{new Date(application.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => handleViewDetails(application)} className="btn btn-secondary btn-sm">
                          View
                        </button>
                        <select
                          value={application.status}
                          onChange={(e) => handleStatusChange(application.id, e.target.value)}
                          className="form-input text-xs"
                          style={{ width: 'auto', padding: '0.15rem 0.35rem' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewing">Reviewing</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        <button onClick={() => handleDelete(application.id)} className="btn btn-danger btn-sm">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredApplications.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500 italic">No applications found matching your criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {showModal && selectedApplication && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header border-b pb-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedApplication.name}</h2>
                  <p className="text-sm text-gray-500 italic">Submitted on {new Date(selectedApplication.createdAt).toLocaleString()}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>

              <div className="modal-body space-y-8">
                {/* 1. Basic Info */}
                <section>
                  <h3 className="text-lg font-bold text-emerald-700 border-l-4 border-emerald-700 pl-3 mb-4 uppercase tracking-wider">Identity & Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div><label className="text-xs font-bold text-gray-400 uppercase">Expert Name</label><p className="font-medium">{selectedApplication.name}</p></div>
                    <div><label className="text-xs font-bold text-gray-400 uppercase">Type</label><p className="font-medium">{selectedApplication.expertType === 'Other' ? selectedApplication.expertTypeOther : selectedApplication.expertType}</p></div>
                    <div><label className="text-xs font-bold text-gray-400 uppercase">Experience</label><p className="font-medium">{selectedApplication.experience}</p></div>
                    <div><label className="text-xs font-bold text-gray-400 uppercase">Email</label><p className="font-medium text-blue-600 underline">{selectedApplication.email}</p></div>
                    <div><label className="text-xs font-bold text-gray-400 uppercase">Phone</label><p className="font-medium">{selectedApplication.phone}</p></div>
                    <div><label className="text-xs font-bold text-gray-400 uppercase">Location</label><p className="font-medium">{selectedApplication.location}</p></div>
                  </div>
                </section>

                {/* 2. Team & Capability */}
                <section>
                  <h3 className="text-lg font-bold text-emerald-700 border-l-4 border-emerald-700 pl-3 mb-4 uppercase tracking-wider">Team & Capability</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                    <div><label className="text-xs font-bold text-gray-400 uppercase">Team Size</label><p className="font-medium">{selectedApplication.teamSize}</p></div>
                    <div><label className="text-xs font-bold text-gray-400 uppercase">Team Composition</label><p className="font-medium">{selectedApplication.teamComposition}</p></div>
                    <div><label className="text-xs font-bold text-gray-400 uppercase">Work Geography</label><p className="font-medium">{selectedApplication.workGeography}</p></div>
                    <div><label className="text-xs font-bold text-gray-400 uppercase">Design / Build</label><p className="font-medium">{selectedApplication.designOrBuild}</p></div>
                  </div>
                </section>

                {/* 3. Specializations */}
                <section>
                  <h3 className="text-lg font-bold text-emerald-700 border-l-4 border-emerald-700 pl-3 mb-4 uppercase tracking-wider">Specializations & Focus</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Gig Expert Types</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplication.gigExpertTypes.map(type => (
                          <span key={type} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase">{type === 'Other' ? selectedApplication.gigExpertTypeOther : type}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Project Types</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplication.projectTypes.map(type => (
                          <span key={type} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">{type === 'Other' ? selectedApplication.projectTypeOther : type}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Key Work Areas</label>
                      <p className="p-3 bg-white border rounded-md text-sm text-gray-700 whitespace-pre-line">{selectedApplication.keyWorkAreas}</p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="modal-footer border-t pt-4 mt-8 flex justify-end gap-3 print:hidden">
                <div className="flex-1 flex gap-2">
                  <button
                    onClick={() => downloadCSV([selectedApplication], `gigexpert_${selectedApplication.name.replace(/\s+/g, '_')}`)}
                    className="btn btn-secondary btn-sm"
                  >
                    📥 Download CSV
                  </button>
                  <button
                    onClick={() => triggerPrint()}
                    className="btn btn-secondary btn-sm"
                  >
                    📋 Print / Save PDF
                  </button>
                </div>
                <button onClick={() => handleStatusChange(selectedApplication.id, 'approved')} className="btn btn-primary" disabled={selectedApplication.status === 'approved'}>
                  {selectedApplication.status === 'approved' ? 'Already Approved' : 'Approve Expert'}
                </button>
                <button onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Close Review
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// Add print-specific styles to hide everything except the modal content when printing
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @media print {
      body * { visibility: hidden; }
      .modal-overlay, .modal-overlay * { visibility: visible; }
      .modal-overlay { position: absolute; left: 0; top: 0; width: 100%; background: white !important; }
      .modal-content { box-shadow: none !important; border: none !important; width: 100% !important; max-width: none !important; }
      .sidebar, .header, .print:hidden, .btn, .modal-footer button, .modal-header button { display: none !important; }
      .modal-body { padding: 0 !important; }
      .header-title { display: block !important; visibility: visible !important; }
    }
  `;
  document.head.appendChild(style);
}

