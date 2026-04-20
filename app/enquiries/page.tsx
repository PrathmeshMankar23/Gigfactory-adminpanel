'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { enquiryApi } from '../../lib/api';
import { Enquiry } from '../../lib/types';
import { downloadCSV } from '../../lib/exportUtils';

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadEnquiries = async () => {
    try {
      const response = await enquiryApi.list();
      setEnquiries(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to load enquiries', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const filteredEnquiries = enquiries.filter((enq) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = (enq.name || '').toLowerCase().includes(term);
    const emailMatch = (enq.email || '').toLowerCase().includes(term);
    const companyMatch = (enq.companyName || '').toLowerCase().includes(term);
    return nameMatch || emailMatch || companyMatch;
  });

  const handleViewDetails = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) return;
    try {
      await enquiryApi.remove(id);
      setEnquiries((prev) => prev.filter((enq) => enq.id !== id));
    } catch (error) {
      console.error('Failed to delete enquiry', error);
      alert('Failed to delete enquiry.');
    }
  };

  return (
    <AdminLayout>
      <div className="fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="header-title text-3xl font-extrabold text-blue-900">Contact Enquiries</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name, email or company..."
              className="form-input pl-10 h-12 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 print:hidden">
            <button
              className="btn btn-secondary h-12 px-6 flex items-center gap-2"
              onClick={() => downloadCSV(filteredEnquiries, 'contact_enquiries')}
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
                Loading enquiries...
              </div>
            </div>
          ) : (
            <table className="table w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Date</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-5 font-bold text-blue-800">{enq.name || 'Anonymous'}</td>
                    <td className="px-6 py-5 text-gray-600">{enq.companyName || '-'}</td>
                    <td className="px-6 py-5 text-gray-600">{enq.email}</td>
                    <td className="px-6 py-5 text-xs font-mono text-gray-400">
                      {new Date(enq.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-2 items-center">
                        <button onClick={() => handleViewDetails(enq)} className="bg-blue-100 text-blue-700 hover:bg-blue-200 p-2 rounded-lg transition-colors">
                          View
                        </button>
                        <button onClick={() => handleDelete(enq.id)} className="bg-red-50 text-red-500 hover:bg-red-100 p-2 rounded-lg transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filteredEnquiries.length === 0 && (
            <div className="p-12 text-center text-gray-400 italic">No enquiries found.</div>
          )}
        </div>

        {showModal && selectedEnquiry && (
          <div className="modal-overlay pt-10" onClick={() => setShowModal(false)}>
            <div className="modal-content max-w-2xl shadow-2xl rounded-3xl" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header border-b p-8 flex justify-between items-center bg-gray-50">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Message Details</h2>
                  <p className="text-xs text-blue-500 font-bold uppercase tracking-widest mt-1">Contact Submission</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-900 transition-all">✕</button>
              </div>

              <div className="modal-body p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Company</label>
                    <p className="text-lg font-bold text-gray-800">{selectedEnquiry.companyName || 'Not Provided'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Submission Date</label>
                    <p className="text-lg font-bold text-gray-800">{new Date(selectedEnquiry.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Email</label>
                    <p className="text-lg font-bold text-blue-600">{selectedEnquiry.email}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Phone</label>
                    <p className="text-lg font-bold text-gray-800">{selectedEnquiry.phone || 'Not Provided'}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Message Content</label>
                  <div className="bg-gray-50 p-6 rounded-2xl text-gray-700 leading-relaxed whitespace-pre-wrap italic">
                    "{selectedEnquiry.message}"
                  </div>
                </div>
              </div>

              <div className="modal-footer p-8 border-t bg-gray-50 flex justify-end gap-4 px-10 rounded-b-3xl">
                <button onClick={() => setShowModal(false)} className="btn btn-secondary px-8">Close</button>
                <button onClick={() => { handleDelete(selectedEnquiry.id); setShowModal(false); }} className="btn btn-danger px-8">Delete Enquiry</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
