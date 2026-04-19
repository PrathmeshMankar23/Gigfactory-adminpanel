'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { agencyRecruitmentApi } from '../../../lib/api';
import { AgencyApplication, ApplicationStatus } from '../../../lib/types';
import { downloadCSV, triggerPrint } from '../../../lib/exportUtils';


export default function AgencyRecruitmentPage() {
  const [applications, setApplications] = useState<AgencyApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<AgencyApplication | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadApplications = async () => {
    try {
      const response = await agencyRecruitmentApi.list();
      setApplications(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to load agency applications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.registeredName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.authPersonName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (application: AgencyApplication) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const updated = await agencyRecruitmentApi.update(id, { status: newStatus as ApplicationStatus });
      setApplications((prev) => prev.map((app) => (app.id === id ? updated : app)));
    } catch (error) {
      console.error('Failed to update agency status', error);
      alert('Failed to update application status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return;
    try {
      await agencyRecruitmentApi.remove(id);
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch (error) {
      console.error('Failed to delete agency application', error);
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

  // Helper to render JSON or Object details nicely
  const renderDetails = (data: any) => {
    if (!data || Object.keys(data).length === 0) return <span className="text-gray-400 italic">No details provided</span>;
    return (
      <div className="bg-gray-50 p-3 rounded-md text-sm">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="mb-1">
            <span className="font-semibold text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
            <span>{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="header-title">Agency Recruitment Applications</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name..."
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
              onClick={() => downloadCSV(filteredApplications, 'agency_applications_all')}
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
                  <th>Registered Name</th>
                  <th>Auth Person</th>
                  <th>Designation</th>
                  <th>LinkedIn</th>
                  <th>Status</th>
                  <th>Submission Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((application) => (
                  <tr key={application.id}>
                    <td className="font-bold text-blue-600">{application.registeredName}</td>
                    <td>{application.authPersonName}</td>
                    <td className="text-sm">{application.designation}</td>
                    <td>
                      {application.linkedinUrl ? (
                        <a href={application.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          Profile 🔗
                        </a>
                      ) : '-'}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(application.status)}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </td>
                    <td className="text-xs">{new Date(application.submissionDate).toLocaleDateString()}</td>
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
                  <h2 className="text-2xl font-bold text-gray-800">{selectedApplication.registeredName}</h2>
                  <p className="text-sm text-gray-500 italic">Submitted on {new Date(selectedApplication.submissionDate).toLocaleString()}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>

              <div className="modal-body space-y-8">
                {/* 1. Identity & Accountability */}
                <section>
                  <h3 className="text-lg font-bold text-blue-700 border-l-4 border-blue-700 pl-3 mb-4 uppercase tracking-wider">Identity & Accountability</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div><label className="text-xs font-bold text-gray-400 uppercase">Auth Person</label><p className="font-medium">{selectedApplication.authPersonName}</p></div>
                    <div><label className="text-xs font-bold text-gray-400 uppercase">Designation</label><p className="font-medium">{selectedApplication.designation}</p></div>
                    <div><label className="text-xs font-bold text-gray-400 uppercase">Headquarters</label><p className="font-medium">{selectedApplication.headquarters}</p></div>
                    <div><label className="text-xs font-bold text-gray-400 uppercase">Email</label><p className="font-medium text-blue-600 underline">{selectedApplication.email || 'N/A'}</p></div>
                    <div><label className="text-xs font-bold text-gray-400 uppercase">Phone</label><p className="font-medium">{selectedApplication.phone || 'N/A'}</p></div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">Website</label>
                      <p className="font-medium">
                        {selectedApplication.website ? <a href={selectedApplication.website} target="_blank" className="text-blue-500 underline">Visit Website</a> : 'N/A'}
                      </p>
                    </div>
                  </div>
                </section>

                {/* 2. Legal & Tax Identity */}
                <section>
                  <h3 className="text-lg font-bold text-blue-700 border-l-4 border-blue-700 pl-3 mb-4 uppercase tracking-wider">Legal & Tax Identity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-gray-50 p-4 rounded-lg">
                    <div><label className="text-xs font-bold text-gray-400 uppercase">GST Number</label><p className="font-mono text-sm">{selectedApplication.gstNumber || 'N/A'}</p></div>
                    <div><label className="text-xs font-bold text-gray-400 uppercase">CIN</label><p className="font-mono text-sm">{selectedApplication.cin || 'N/A'}</p></div>
                    <div><label className="text-xs font-bold text-gray-400 uppercase">Company PAN</label><p className="font-mono text-sm">{selectedApplication.companyPan || 'N/A'}</p></div>
                  </div>
                </section>

                {/* 3. Service Specializations */}
                <section>
                  <h3 className="text-lg font-bold text-blue-700 border-l-4 border-blue-700 pl-3 mb-4 uppercase tracking-wider">Service Specializations</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedApplication.selectedServices.map(service => (
                      <span key={service} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">{service}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-3">
                      <h4 className="font-bold text-sm mb-2 text-gray-700">Digital Construction & BIM</h4>
                      {renderDetails(selectedApplication.bimDetails)}
                    </div>
                    <div className="border rounded-lg p-3">
                      <h4 className="font-bold text-sm mb-2 text-gray-700">Audit & Vetting</h4>
                      {renderDetails(selectedApplication.auditDetails)}
                    </div>
                    <div className="border rounded-lg p-3">
                      <h4 className="font-bold text-sm mb-2 text-gray-700">Peer Review</h4>
                      {renderDetails(selectedApplication.peerReviewDetails)}
                    </div>
                    <div className="border rounded-lg p-3">
                      <h4 className="font-bold text-sm mb-2 text-gray-700">BOQ & Cost Monitoring</h4>
                      {renderDetails(selectedApplication.boqDetails)}
                    </div>
                    <div className="border rounded-lg p-3 md:col-span-2">
                      <h4 className="font-bold text-sm mb-2 text-gray-700">3D Visualization</h4>
                      {renderDetails(selectedApplication.vizDetails)}
                    </div>
                  </div>
                </section>

                {/* 4. Evidence & Commercials */}
                <section>
                  <h3 className="text-lg font-bold text-blue-700 border-l-4 border-blue-700 pl-3 mb-4 uppercase tracking-wider">Evidence & Commercials</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div><label className="text-xs font-bold text-gray-400 uppercase">Commercial Basis</label><p className="font-medium">{selectedApplication.commercialBasis}</p></div>
                    <div><label className="text-xs font-bold text-gray-400 uppercase">Base Rate</label><p className="font-medium">{selectedApplication.baseRate || 'N/A'}</p></div>
                    <div><label className="text-xs font-bold text-gray-400 uppercase">Notice Period</label><p className="font-medium">{selectedApplication.noticePeriod}</p></div>
                    <div><label className="text-xs font-bold text-gray-400 uppercase">Team Size</label><p className="font-medium">{selectedApplication.teamSize || 'N/A'}</p></div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Portfolio/Evidence</label>
                      {selectedApplication.portfolioUrl ? (
                        <a href={selectedApplication.portfolioUrl} target="_blank" className="block p-2 bg-blue-50 text-blue-700 rounded border border-blue-200 mt-1 text-center font-bold">
                          View Portfolio 🔗
                        </a>
                      ) : <p className="text-gray-400">No portfolio provided</p>}
                    </div>
                  </div>
                </section>

                <section className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                  <h3 className="text-sm font-bold text-orange-700 mb-2 uppercase tracking-wider">Declaration & Signature</h3>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-gray-700">Signed by: <span className="font-bold font-serif underline">{selectedApplication.signatureName}</span></p>
                      <p className="text-xs text-gray-500 mt-1">Application ID: {selectedApplication.id}</p>
                    </div>
                    <div className={selectedApplication.declarationAccepted ? 'text-green-600' : 'text-red-600'}>
                      {selectedApplication.declarationAccepted ? '✓ Declaration Accepted' : '✗ Declaration Declined'}
                    </div>
                  </div>
                </section>
              </div>

              <div className="modal-footer border-t pt-4 mt-8 flex justify-end gap-3 print:hidden">
                <div className="flex-1 flex gap-2">
                  <button
                    onClick={() => downloadCSV([selectedApplication], `agency_app_${selectedApplication.registeredName.replace(/\s+/g, '_')}`)}
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
                  {selectedApplication.status === 'approved' ? 'Already Approved' : 'Approve Agency'}
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


