export interface Project {
  id: string | number;
  name: string;
  category: string;
  status: string;
  description: string;
  scope: string;
  area: string;
  location: string;
  images: string[];
}

export interface CaseStudy {
  id: string | number;
  name: string;
  category: string;
  image?: string | null;
  features: string;
  pdfLink?: string | null;
}

export interface Expertise {
  id: string | number;
  category: string;
  name: string;
  image?: string | null;
  description: string;
  points: string[];
}

export interface YouTubeVideo {
  id: string | number;
  title: string;
  youtubeLink: string;
}


export type ApplicationStatus = 'pending' | 'reviewing' | 'approved' | 'rejected';

export interface AgencyApplication {
  id: string;
  
  // 1. Identity & Accountability
  authPersonName: string;
  designation: string;
  linkedinUrl?: string | null;
  headquarters: string;
  website?: string | null;
  email?: string | null;
  phone?: string | null;

  // 2. Legal & Tax Identity
  registeredName: string;
  gstNumber?: string | null;
  cin?: string | null;
  companyPan?: string | null;

  // 3. Services
  selectedServices: string[];
  bimDetails?: any;
  auditDetails?: any;
  peerReviewDetails?: any;
  boqDetails?: any;
  vizDetails?: any;

  // 4. Evidence & Commercials
  portfolioUrl?: string | null;
  commercialBasis: string;
  baseRate?: string | null;
  noticePeriod: string;
  teamSize?: string | null;

  // 5. Final Declaration
  declarationAccepted: boolean;
  signatureName: string;
  submissionDate: string;

  // Administrative
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}


export interface FreelancerApplication {
  id: string;
  
  // 1. Identity & Accountability
  fullName: string;
  designation: string;
  linkedinUrl?: string | null;
  location: string;
  email?: string | null;
  phone?: string | null;

  // 2. Legal & Tax Identity
  legalNamePan?: string | null;
  personalPan?: string | null;

  // 3. Services
  selectedServices: string[];
  bimDetails?: any;
  auditDetails?: any;
  peerReviewDetails?: any;
  boqDetails?: any;
  vizDetails?: any;

  // 4. Evidence & Commercials
  portfolioUrl?: string | null;
  commercialBasis: string;
  baseRate?: string | null;
  noticePeriod: string;
  availability: string;

  // 5. Final Declaration
  declarationAccepted: boolean;
  signatureName: string;
  submissionDate: string;

  // Administrative
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GigExpertFeedback {
  id: string;
  name: string;
  expertType: string;
  expertTypeOther?: string | null;
  experience: string;
  phone: string;
  email: string;
  location: string;
  workGeography: string;
  teamSize: string;
  teamComposition: string;
  gigExpertTypes: string[];
  gigExpertTypeOther?: string | null;
  designOrBuild: string;
  projectTypes: string[];
  projectTypeOther?: string | null;
  keyWorkAreas: string;

  // Administrative
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Admin {

  id: string | number;
  name: string;
  email: string;
  role: string;
  password?: string;
}
