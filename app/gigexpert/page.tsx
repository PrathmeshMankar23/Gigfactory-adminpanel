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
    const term = searchTerm.toLowerCase();
    const nameMatch = (app.name || '').toLowerCase().includes(term);
    const emailMatch = (app.email || '').toLowerCase().includes(term);
    const matchesSearch = nameMatch || emailMatch;

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
      alert('Failed to update status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      await gigExpertFeedbackApi.remove(id);
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch (error) {
      console.error('Failed to delete gigexpert entry', error);
      alert('Failed to delete entry.');
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const s = status?.toUpperCase();
    if (s === 'PENDING') return 'badge-warning';
    if (s === 'APPROVED') return 'badge-success';
    if (s === 'REJECTED') return 'badge-danger';
    return 'badge-secondary';
  };

  return (
    <AdminLayout>
      <div className="fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="header-title text-3xl font-extrabold text-emerald-900">GigExpert Feedback Pool</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search experts by name or email..."
              className="form-input pl-10 h-12 shadow-sm focus:border-emerald-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"></span>
          </div>

          <div className="w-full md:w-64">
            <select
              className="form-input h-12 shadow-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Feedback States</option>
              <option value="PENDING">Pending Review</option>
              <option value="APPROVED">Waitlisted / Approved</option>
              <option value="REJECTED">Archived</option>
            </select>
          </div>

          <div className="flex gap-2 print:hidden">
            <button
              className="btn btn-secondary h-12 px-6 flex items-center gap-2 border-emerald-100 text-emerald-700 hover:bg-emerald-50"
              onClick={() => downloadCSV(filteredApplications, 'gigexpert_feedback_all')}
            >
              📊 Export CSV
            </button>
          </div>
        </div>

        <div className="table-container shadow-xl rounded-2xl overflow-hidden border-none bg-white">
          {loading ? (
            <div className="p-12 text-center text-gray-400 font-medium animate-pulse">
              Analyzing expert pool...
            </div>
          ) : (
            <table className="table w-full">
              <thead className="bg-emerald-50/50 border-b border-emerald-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-emerald-600">Expert Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-emerald-600">Classification</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-emerald-600">Experience</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-emerald-600">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-emerald-600">Submitted</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-emerald-600">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-6 py-5 font-black text-emerald-800">{app.name}</td>
                    <td className="px-6 py-5">
                      <div className="font-semibold text-gray-700 text-sm">
                        {app.expertType === 'Other' ? app.expertTypeOther : app.expertType}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600 font-bold">{app.experience}</td>
                    <td className="px-6 py-5">
                      <span className={`badge px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${getStatusBadge(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-xs font-mono text-gray-400">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-2 items-center">
                        <button onClick={() => handleViewDetails(app)} className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 p-2 rounded-lg transition-colors" title="View Full Details">
                          view
                        </button>
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          className="bg-white border border-gray-100 rounded-lg text-[10px] font-bold p-1 outline-none"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="APPROVED">APPROVED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                        <button onClick={() => handleDelete(app.id)} className="bg-red-50 text-red-500 hover:bg-red-100 p-2 rounded-lg transition-colors" title="Delete Entry">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filteredApplications.length === 0 && (
            <div className="p-12 text-center text-gray-400 italic">No feedback entries matching your search.</div>
          )}
        </div>

        {showModal && selectedApplication && (
          <div className="modal-overlay overflow-y-auto pt-10" onClick={() => setShowModal(false)}>
            <div className="modal-content max-w-5xl mb-20 shadow-2xl rounded-[2.5rem] border-none flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header border-b p-10 flex justify-between items-center bg-gray-50/50 backdrop-blur-md sticky top-0 z-10">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">{selectedApplication.name}</h2>
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold uppercase tracking-tighter">Status: {selectedApplication.status}</span>
                    <span className="text-xs text-blue-500 font-bold uppercase tracking-widest">GigExpert Profile Review</span>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="bg-white shadow-sm border border-gray-100 p-3 rounded-2xl text-gray-400 hover:text-gray-900 transition-all hover:scale-110">
                  ✕
                </button>
              </div>

              <div className="modal-body p-10 space-y-12 overflow-y-auto">
                {/* 1. Identity */}
                <section>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-emerald-100">ID</div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Identity & Expert Type</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <InfoItem label="Full Name" value={selectedApplication.name} />
                    <InfoItem label="Expert Classification" value={selectedApplication.expertType === 'Other' ? selectedApplication.expertTypeOther : selectedApplication.expertType} />
                    <InfoItem label="Professional Experience" value={selectedApplication.experience} />
                    <InfoItem label="Contact Email" value={selectedApplication.email} isLink linkPrefix="mailto:" />
                    <InfoItem label="Phone Number" value={selectedApplication.phone} />
                    <InfoItem label="Primary Location" value={selectedApplication.location} />
                  </div>
                </section>

                {/* 2. Team Capability */}
                <section>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-100">TC</div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Team & Operational Capability</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100">
                    <InfoItem label="Active Team Size" value={selectedApplication.teamSize || 'Solo Contributor'} />
                    <InfoItem label="Team Composition" value={selectedApplication.teamComposition || 'Not Specified'} />
                    <InfoItem label="Operational Geography" value={selectedApplication.workGeography || 'Local'} />
                    <InfoItem label="Primary Service Mode" value={selectedApplication.designOrBuild || 'Digital / Consultation'} />
                  </div>
                </section>

                {/* 3. Specializations */}
                <section>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-100">AF</div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Areas of Focus & Expertise</h3>
                  </div>
                  <div className="space-y-10">
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm transition-all hover:border-emerald-200">
                      <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-4">Gig Expert Categories</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplication.gigExpertTypes.map((type, i) => (
                          <span key={i} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[11px] font-black uppercase tracking-wider border border-emerald-100">
                            {type === 'Other' ? selectedApplication.gigExpertTypeOther : type}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm transition-all hover:border-blue-200">
                      <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-4">Target Project Types</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplication.projectTypes.map((type, i) => (
                          <span key={i} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-[11px] font-black uppercase tracking-wider border border-blue-100">
                            {type === 'Other' ? selectedApplication.projectTypeOther : type}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-emerald-900 text-white p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
                      <label className="text-[10px] font-black text-emerald-300 uppercase tracking-[0.3em] block mb-6">Execution Strategy / Key Work Areas</label>
                      <p className="text-lg font-medium leading-relaxed italic opacity-90">
                        "{selectedApplication.keyWorkAreas}"
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="modal-footer p-10 border-t bg-white flex justify-between items-center px-14 rounded-b-[2.5rem]">
                <div className="flex gap-4">
                  <button onClick={() => triggerPrint()} className="footer-btn-emerald">🖨️ Professional PDF</button>
                  <button onClick={() => downloadCSV([selectedApplication], `expert_${selectedApplication.name}`)} className="footer-btn-emerald">📊 Data Export</button>
                </div>
                <div className="flex gap-8 items-center">
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900 font-black uppercase text-[10px] tracking-widest">Close Review</button>
                  <button
                    onClick={() => handleStatusChange(selectedApplication.id, 'APPROVED')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-[0.2em] py-5 px-12 rounded-2xl transition-all shadow-xl shadow-emerald-200 active:scale-95 disabled:opacity-50"
                    disabled={selectedApplication.status === 'APPROVED'}
                  >
                    {selectedApplication.status === 'APPROVED' ? 'WAITLISTED' : 'APPROVE TO POOL'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .footer-btn-emerald {
             font-size: 10px;
             font-weight: 900;
             text-transform: uppercase;
             letter-spacing: 0.1em;
             padding: 14px 22px;
             border: 1px solid #f1f5f9;
             border-radius: 16px;
             background: #fff;
             color: #64748b;
             transition: all 0.2s;
        }
        .footer-btn-emerald:hover {
            background: #f8fafc;
            border-color: #ecfdf5;
            color: #059669;
        }
      `}</style>
    </AdminLayout>
  );
}

function InfoItem({ label, value, subValue, isLink, linkPrefix, mono }: any) {
  return (
    <div>
      <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] block mb-3">{label}</label>
      <div className={`text-xl font-bold truncate leading-none ${mono ? 'font-mono text-emerald-600 text-sm' : 'text-gray-800'}`}>
        {isLink ? <a href={(linkPrefix || '') + value} target="_blank" className="text-blue-600 hover:underline">{value || '-'}</a> : (value || '-')}
      </div>
      {subValue && <div className="text-[11px] text-gray-400 mt-2 font-medium truncate italic">{subValue}</div>}
    </div>
  );
}
