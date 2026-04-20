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
    const term = searchTerm.toLowerCase();
    const nameMatch = (app.companyName || '').toLowerCase().includes(term);
    const personMatch = (app.authorizedPerson || '').toLowerCase().includes(term);
    const matchesSearch = nameMatch || personMatch;

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

  const getStatusBadge = (status: string) => {
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
          <h1 className="header-title text-3xl font-extrabold text-blue-900">Agency Applications</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by company or person..."
              className="form-input pl-10 h-12 shadow-sm"
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
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="flex gap-2 print:hidden">
            <button
              className="btn btn-secondary h-12 px-6 flex items-center gap-2"
              onClick={() => downloadCSV(filteredApplications, 'agency_applications_all')}
            >
              📊 Export CSV
            </button>
          </div>
        </div>

        <div className="table-container shadow-xl rounded-2xl overflow-hidden border-none bg-white">
          {loading ? (
            <div className="p-12 text-center text-gray-400 font-medium">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full mb-4"></div>
                Loading application pool...
              </div>
            </div>
          ) : (
            <table className="table w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Company Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Contact Person</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Applied On</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-5 font-bold text-blue-800">{app.companyName}</td>
                    <td className="px-6 py-5">
                      <div className="font-semibold text-gray-700">{app.authorizedPerson}</div>
                      <div className="text-[11px] text-gray-400 uppercase font-bold tracking-tighter">{app.designation}</div>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600">{app.headquarters}</td>
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
                        <button onClick={() => handleViewDetails(app)} className="bg-blue-100 text-blue-700 hover:bg-blue-200 p-2 rounded-lg transition-colors" title="View Details">
                          View
                        </button>
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          className="bg-white border border-gray-200 rounded-lg text-[10px] font-bold p-1 outline-none focus:border-blue-500"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="APPROVED">APPROVED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                        <button onClick={() => handleDelete(app.id)} className="bg-red-50 text-red-500 hover:bg-red-100 p-2 rounded-lg transition-colors" title="Delete">
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
            <div className="p-12 text-center text-gray-400 italic">No applications found in this category.</div>
          )}
        </div>

        {showModal && selectedApplication && (
          <div className="modal-overlay overflow-y-auto pt-10" onClick={() => setShowModal(false)}>
            <div className="modal-content max-w-5xl mb-20 shadow-2xl rounded-3xl" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header border-b p-8 flex justify-between items-center bg-gray-50/50 backdrop-blur-md sticky top-0 z-10">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">{selectedApplication.companyName}</h2>
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-mono uppercase">ID: {selectedApplication.id.split('-')[0]}..</span>
                    <span className="text-xs text-blue-500 font-bold uppercase tracking-widest">Agency Recruitment</span>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="bg-white shadow-sm border border-gray-100 p-2 rounded-xl text-gray-400 hover:text-gray-900 transition-all hover:scale-110 active:scale-95">
                  ✕
                </button>
              </div>

              <div className="modal-body p-10 space-y-12">
                {/* 1. Identity */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">01</div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Identity & Accountability</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <InfoItem label="Authorised Person" value={selectedApplication.authorizedPerson} subValue={selectedApplication.designation} />
                    <InfoItem label="LinkedIn Profile" value={selectedApplication.linkedinUrl || 'N/A'} isLink={!!selectedApplication.linkedinUrl} />
                    <InfoItem label="Company Website" value={selectedApplication.website || 'N/A'} isLink={!!selectedApplication.website} subValue={selectedApplication.headquarters} />
                  </div>
                </section>

                {/* 2. Legal */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">02</div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Legal & Tax Identity</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-gray-50/50 p-8 rounded-3xl border border-gray-100">
                    <InfoItem label="Entity Name" value={selectedApplication.companyName} />
                    <InfoItem label="GST Number" value={selectedApplication.gstNumber || 'N/A'} mono />
                    <InfoItem label="PAN ID" value={selectedApplication.pan || 'N/A'} mono />
                    <InfoItem label="CIN Number" value={selectedApplication.cin || 'N/A'} mono />
                  </div>
                </section>

                {/* 3. Tech Vetting */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">03</div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Service Selection & Technical Vetting</h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {selectedApplication.providesBIM && (
                      <VettingCard
                        title="BIM & Drafting"
                        color="blue"
                        icon="🏗️"
                        details={[
                          { label: 'LOD Capability', value: selectedApplication.lodCapability },
                          { label: 'Software Stack', value: selectedApplication.bimSoftwares?.join(', ') },
                          { label: 'CDE Experience', value: selectedApplication.cdeExperience }
                        ]}
                      />
                    )}

                    {selectedApplication.providesAsBuiltAudit && (
                      <VettingCard
                        title="As-Built Audit"
                        color="green"
                        icon="📏"
                        details={[
                          { label: 'Service Scope', value: selectedApplication.serviceRadius },
                          { label: 'Equipment List', value: selectedApplication.equipmentOwned?.join(', ') }
                        ]}
                      />
                    )}

                    {selectedApplication.providesPeerReview && (
                      <VettingCard
                        title="Peer Review"
                        color="purple"
                        icon="🔍"
                        details={[
                          { label: 'Specialization', value: selectedApplication.specialization },
                          { label: 'Total Team Exp', value: selectedApplication.totalExperience ? `${selectedApplication.totalExperience} Professionals` : null }
                        ]}
                      />
                    )}

                    {selectedApplication.providesBOQ && (
                      <VettingCard
                        title="BOQ & Cost Monitoring"
                        color="yellow"
                        icon="📊"
                        details={[
                          { label: 'Standards', value: selectedApplication.measurementStandard },
                          { label: 'Estimating Software', value: selectedApplication.estimationSoftware }
                        ]}
                      />
                    )}

                    {selectedApplication.provides3DRendering && (
                      <VettingCard
                        title="3D Visualisation"
                        color="indigo"
                        icon="🎨"
                        details={[
                          { label: 'Rendering Engines', value: selectedApplication.renderingEngines?.join(', ') },
                          { label: 'Processing Hardware', value: selectedApplication.hardwareCapacity },
                          { label: 'Animation Ready', value: selectedApplication.animationCapability ? 'Yes' : 'No' }
                        ]}
                      />
                    )}
                  </div>
                </section>

                {/* 4. Portfolio */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">04</div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Evidence & Commercials</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-blue-50/30 rounded-3xl border border-blue-50">
                    <InfoItem label="Commercial Basis" value={selectedApplication.commercialBasis?.replace('_', ' ')} />
                    <InfoItem label="Base Rate Quote" value={selectedApplication.baseRate ? `${selectedApplication.baseRate} INR` : 'N/A'} />
                    <InfoItem label="Standard Lead Time" value={selectedApplication.leadTime?.replace('_', ' ')} />
                    <div className="md:col-span-3 pt-6 border-t border-blue-100 mt-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Portfolio / Work Samples</label>
                      <div className="flex flex-wrap gap-4">
                        {selectedApplication.portfolioUrl && (
                          <a href={selectedApplication.portfolioUrl} target="_blank" className="portfolio-link-premium">
                            <span className="text-lg">📂</span>
                            <div>
                              <div className="font-bold text-gray-900">External Resource</div>
                              <div className="text-[10px] text-gray-500 uppercase font-black">Link Provided</div>
                            </div>
                          </a>
                        )}
                        {selectedApplication.portfolioPdfUrl && (
                          <a href={selectedApplication.portfolioPdfUrl} target="_blank" className="portfolio-link-premium bg-blue-600 text-white border-blue-600 hover:shadow-lg hover:shadow-blue-200">
                            <span className="text-lg">📄</span>
                            <div>
                              <div className="font-bold">Portfolio PDF</div>
                              <div className="text-[10px] text-blue-200 uppercase font-black">Hosted File</div>
                            </div>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* 5. Declaration */}
                <section className="bg-gradient-to-br from-gray-900 to-blue-900 text-white p-10 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-10 overflow-hidden relative shadow-2xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                  <div className="relative z-10">
                    <h4 className="text-blue-300 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Digitally Signed Declaration</h4>
                    <p className="text-3xl font-serif italic leading-relaxed">"{selectedApplication.signature || selectedApplication.authorizedPerson}"</p>
                    <p className="text-[10px] text-gray-400 mt-6 tracking-widest uppercase font-bold">Authenticated Submission on {new Date(selectedApplication.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-center relative z-10 bg-white/10 p-6 rounded-3xl backdrop-blur-xl border border-white/10 min-w-[180px]">
                    <div className={`w-3 h-3 rounded-full mb-3 shadow-lg ${selectedApplication.isVerified ? 'bg-green-400 shadow-green-500/50' : 'bg-yellow-400 shadow-yellow-500/50'}`}></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-center">{selectedApplication.isVerified ? 'Identity Verified' : 'Self-Certified'}</p>
                    {selectedApplication.status === 'APPROVED' && <div className="mt-4 text-green-300 font-bold text-xs">✓ APPROVED</div>}
                  </div>
                </section>
              </div>

              <div className="modal-footer p-8 border-t bg-white flex justify-between items-center px-12 sticky bottom-0 z-10">
                <div className="flex gap-4">
                  <button onClick={() => triggerPrint()} className="bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs uppercase p-4 rounded-2xl border border-gray-100 transition-all active:scale-95">🖨️ PDF Report</button>
                  <button onClick={() => downloadCSV([selectedApplication], `agency_${selectedApplication.companyName}`)} className="bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs uppercase p-4 rounded-2xl border border-gray-100 transition-all active:scale-95">📊 Dataset Export</button>
                </div>
                <div className="flex gap-6 items-center">
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900 font-black uppercase text-[10px] tracking-widest">Discard review</button>
                  <button
                    onClick={() => handleStatusChange(selectedApplication.id, 'APPROVED')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest py-5 px-10 rounded-2xl transition-all shadow-xl shadow-blue-200 active:scale-95 disabled:opacity-50"
                    disabled={selectedApplication.status === 'APPROVED'}
                  >
                    {selectedApplication.status === 'APPROVED' ? 'Application Approved' : 'Finalize Approval'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .portfolio-link-premium {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 24px;
          background: white;
          border: 1px solid #f1f5f9;
          border-radius: 16px;
          min-width: 220px;
          transition: all 0.3s;
          text-decoration: none;
        }
        .portfolio-link-premium:hover {
            transform: translateY(-4px);
            border-color: #3b82f6;
            box-shadow: 0 10px 20px rgba(0,0,0,0.04);
        }
      `}</style>
    </AdminLayout>
  );
}

function InfoItem({ label, value, subValue, isLink, linkPrefix, mono }: any) {
  return (
    <div>
      <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-2">{label}</label>
      <div className={`text-lg font-bold truncate leading-none ${mono ? 'font-mono uppercase text-sm text-blue-600' : 'text-gray-800'}`}>
        {isLink ? <a href={(linkPrefix || '') + value} target="_blank" className="text-blue-600 hover:underline">{value || '-'}</a> : (value || '-')}
      </div>
      {subValue && <div className="text-[11px] text-gray-400 mt-2 font-medium truncate">{subValue}</div>}
    </div>
  );
}

function VettingCard({ title, color, icon, details }: any) {
  const colorMap: any = {
    blue: 'border-blue-100 bg-blue-50/30 text-blue-900',
    green: 'border-green-100 bg-green-50/30 text-green-900',
    purple: 'border-purple-100 bg-purple-50/30 text-purple-900',
    yellow: 'border-yellow-100 bg-yellow-50/30 text-yellow-900',
    indigo: 'border-indigo-100 bg-indigo-50/30 text-indigo-900',
  };

  return (
    <div className={`p-8 rounded-[2rem] border ${colorMap[color]} transition-all duration-500 hover:shadow-xl hover:shadow-gray-100/50`}>
      <div className="flex justify-between items-start mb-6">
        <h4 className="font-black text-[10px] uppercase tracking-[0.2em] opacity-40">{title}</h4>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="space-y-5">
        {details.map((d: any, i: number) => d.value && (
          <div key={i}>
            <label className="text-[10px] uppercase font-black opacity-30 block mb-1">{d.label}</label>
            <p className="text-sm font-bold">{d.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
