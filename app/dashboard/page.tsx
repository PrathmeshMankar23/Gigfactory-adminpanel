'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import AuthWrapper from '../components/AuthWrapper';
import { useUser } from '../components/UserContext';
import { projectsApi, caseStudiesApi, agencyRecruitmentApi, freelancerRecruitmentApi, gigExpertFeedbackApi } from '../../lib/api';
import { Project, CaseStudy } from '../../lib/types';

export default function Dashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalCaseStudies: 0,
    totalAgencies: 0,
    totalFreelancers: 0,
    totalGigExperts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentCaseStudies, setRecentCaseStudies] = useState<CaseStudy[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projects, caseStudies, agencies, freelancers, gigexperts] = await Promise.all([
          projectsApi.list(),
          caseStudiesApi.list(),
          agencyRecruitmentApi.list(),
          freelancerRecruitmentApi.list(),
          gigExpertFeedbackApi.list(),
        ]);

        setStats({
          totalProjects: Array.isArray(projects) ? projects.length : 0,
          totalCaseStudies: Array.isArray(caseStudies) ? caseStudies.length : 0,
          totalAgencies: Array.isArray(agencies) ? agencies.length : 0,
          totalFreelancers: Array.isArray(freelancers) ? freelancers.length : 0,
          totalGigExperts: Array.isArray(gigexperts) ? gigexperts.length : 0,
        });

        // Set recent items (latest 5)
        setRecentProjects(Array.isArray(projects) ? projects.slice(0, 5) : []);
        setRecentCaseStudies(Array.isArray(caseStudies) ? caseStudies.slice(0, 5) : []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <AuthWrapper>
      <AdminLayout>
        <div className="fade-in">
        <h1 className="header-title mb-6">Dashboard Overview</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="stat-card cursor-pointer hover:border-blue-500 transition-colors" onClick={() => window.location.href='/projects'}>
            <div className="flex justify-between items-start">
              <div>
                <div className="stat-value">{stats.totalProjects}</div>
                <div className="stat-label">Total Projects</div>
              </div>
              <div className="stat-icon bg-blue-100 text-blue-600">🏗️</div>
            </div>
          </div>
          
          <div className="stat-card cursor-pointer hover:border-purple-500 transition-colors" onClick={() => window.location.href='/case-studies'}>
            <div className="flex justify-between items-start">
              <div>
                <div className="stat-value">{stats.totalCaseStudies}</div>
                <div className="stat-label">Case Studies</div>
              </div>
              <div className="stat-icon bg-purple-100 text-purple-600">📋</div>
            </div>
          </div>

          <div className="stat-card cursor-pointer hover:border-blue-500 transition-colors" onClick={() => window.location.href='/recruitment/agency'}>
            <div className="flex justify-between items-start">
              <div>
                <div className="stat-value">{stats.totalAgencies}</div>
                <div className="stat-label">Agencies</div>
              </div>
              <div className="stat-icon bg-green-100 text-green-600">🏢</div>
            </div>
          </div>

          <div className="stat-card cursor-pointer hover:border-purple-500 transition-colors" onClick={() => window.location.href='/recruitment/freelancer'}>
            <div className="flex justify-between items-start">
              <div>
                <div className="stat-value">{stats.totalFreelancers}</div>
                <div className="stat-label">Freelancers</div>
              </div>
              <div className="stat-icon bg-purple-100 text-purple-600">👤</div>
            </div>
          </div>

          <div className="stat-card cursor-pointer hover:border-emerald-500 transition-colors" onClick={() => window.location.href='/gigexpert'}>
            <div className="flex justify-between items-start">
              <div>
                <div className="stat-value">{stats.totalGigExperts}</div>
                <div className="stat-label">GB Feedback</div>
              </div>
              <div className="stat-icon bg-emerald-100 text-emerald-600">🌟</div>
            </div>
          </div>
        </div>




        {/* Recent Projects */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Projects</h2>
            <a href="/projects" className="btn btn-secondary btn-sm">View All</a>
          </div>
          
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map((project) => (
                  <tr key={project.id}>
                    <td className="font-medium">{project.name}</td>
                    <td>{project.category}</td>
                    <td>
                      <span className={`badge ${
                        project.status === 'completed' ? 'badge-info' : 'badge-success'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td>{project.location}</td>
                    <td>
                      <button 
                        onClick={() => window.location.href='/projects'} 
                        className="btn btn-secondary btn-sm"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {recentProjects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500 italic">No projects added yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Case Studies */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Case Studies</h2>
            <a href="/case-studies" className="btn btn-secondary btn-sm">View All</a>
          </div>
          
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Case Study Title</th>
                  <th>Category</th>
                  <th>Features</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentCaseStudies.map((caseStudy) => (
                  <tr key={caseStudy.id}>
                    <td className="font-medium">{caseStudy.name}</td>
                    <td>{caseStudy.category}</td>
                    <td>{caseStudy.features.substring(0, 50)}...</td>
                    <td>
                      <button 
                        onClick={() => window.location.href='/case-studies'} 
                        className="btn btn-secondary btn-sm"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {recentCaseStudies.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-gray-500 italic">No case studies added yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  </AuthWrapper>
  );
}
