import {
  Project,
  CaseStudy,
  Expertise,
  YouTubeVideo,
  AgencyApplication,
  FreelancerApplication,
  GigExpertFeedback,
  Admin,
} from './types';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://gigfactory-backend.onrender.com/api';

async function parseErrorResponse(response: Response): Promise<string> {
  const fallback = `Request failed with status ${response.status}`;
  try {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      return errorJson.message || errorJson.error || errorText || fallback;
    } catch {
      return errorText || fallback;
    }
  } catch {
    return fallback;
  }
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorMessage = await parseErrorResponse(response);
    throw new Error(errorMessage);
  }

  // Handle APIs that may respond with empty body.
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return null as unknown as T;
  }

  return response.json();
}

export const projectsApi = {
  list: () => apiRequest<Project[]>('/projects'),
  create: (payload: Partial<Project>) => apiRequest<Project>('/projects', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string | number, payload: Partial<Project>) => apiRequest<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: string | number) => apiRequest<void>(`/projects/${id}`, { method: 'DELETE' }),
};

export const caseStudiesApi = {
  list: () => apiRequest<CaseStudy[]>('/case-studies'),
  create: (payload: Partial<CaseStudy>) => apiRequest<CaseStudy>('/case-studies', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string | number, payload: Partial<CaseStudy>) => apiRequest<CaseStudy>(`/case-studies/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: string | number) => apiRequest<void>(`/case-studies/${id}`, { method: 'DELETE' }),
};

export const expertiseApi = {
  list: () => apiRequest<Expertise[]>('/expertise'),
  create: (payload: Partial<Expertise>) => apiRequest<Expertise>('/expertise', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string | number, payload: Partial<Expertise>) => apiRequest<Expertise>(`/expertise/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: string | number) => apiRequest<void>(`/expertise/${id}`, { method: 'DELETE' }),
};

export const youtubeVideosApi = {
  list: () => apiRequest<YouTubeVideo[]>('/youtube-videos'),
  create: (payload: Partial<YouTubeVideo>) => apiRequest<YouTubeVideo>('/youtube-videos', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string | number, payload: Partial<YouTubeVideo>) => apiRequest<YouTubeVideo>(`/youtube-videos/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: string | number) => apiRequest<void>(`/youtube-videos/${id}`, { method: 'DELETE' }),
};

export const agencyRecruitmentApi = {
  list: () => apiRequest<AgencyApplication[]>('/recruitment/agency'),
  create: (payload: Partial<AgencyApplication>) => apiRequest<AgencyApplication>('/recruitment/agency', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string | number, payload: Partial<AgencyApplication>) => apiRequest<AgencyApplication>(`/recruitment/agency/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: string | number) => apiRequest<void>(`/recruitment/agency/${id}`, { method: 'DELETE' }),
};

export const freelancerRecruitmentApi = {
  list: () => apiRequest<FreelancerApplication[]>('/recruitment/freelancer'),
  create: (payload: Partial<FreelancerApplication>) => apiRequest<FreelancerApplication>('/recruitment/freelancer', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string | number, payload: Partial<FreelancerApplication>) => apiRequest<FreelancerApplication>(`/recruitment/freelancer/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: string | number) => apiRequest<void>(`/recruitment/freelancer/${id}`, { method: 'DELETE' }),
};

export const gigExpertFeedbackApi = {
  list: () => apiRequest<GigExpertFeedback[]>('/app/gigexpert'),
  create: (payload: Partial<GigExpertFeedback>) => apiRequest<GigExpertFeedback>('/app/gigexpert', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string | number, payload: Partial<GigExpertFeedback>) => apiRequest<GigExpertFeedback>(`/app/gigexpert/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: string | number) => apiRequest<void>(`/app/gigexpert/${id}`, { method: 'DELETE' }),
};



export const adminsApi = {

  list: () => apiRequest<Admin[]>('/admins'),
  create: (payload: Partial<Admin>) => apiRequest<Admin>('/admins', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string | number, payload: Partial<Admin>) => apiRequest<Admin>(`/admins/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: string | number) => apiRequest<void>(`/admins/${id}`, { method: 'DELETE' }),
  login: (credentials: { email: string; password: string }) => apiRequest<{ message: string; user: Admin }>('/admins/login', { method: 'POST', body: JSON.stringify(credentials) }),
};

export const enquiryApi = {
  send: (payload: any) => apiRequest<void>('/enquiry', { method: 'POST', body: JSON.stringify(payload) }),
};

export const uploadApi = {
  uploadFile: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.url;
  },
};

