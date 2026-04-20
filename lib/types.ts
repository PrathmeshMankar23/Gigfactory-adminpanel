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


export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export enum LODLevel {
  LOD_300 = 'LOD_300',
  LOD_350 = 'LOD_350',
  LOD_400 = 'LOD_400',
  LOD_500 = 'LOD_500'
}

export enum Specialization {
  STRUCTURAL = 'STRUCTURAL',
  MEP = 'MEP',
  ARCHITECTURAL = 'ARCHITECTURAL',
  FIRE_LIFE_SAFETY = 'FIRE_LIFE_SAFETY'
}

export enum MeasurementStandard {
  IS_1200 = 'IS_1200',
  RICS = 'RICS',
  NRM2 = 'NRM2',
  SMM7 = 'SMM7'
}

export enum HardwareCapacity {
  RENDER_FARM = 'RENDER_FARM',
  HIGH_END_GPU = 'HIGH_END_GPU',
  CLOUD_RENDERING = 'CLOUD_RENDERING',
  STANDARD_WORKSTATION = 'STANDARD_WORKSTATION'
}

export enum SoftwareType {
  REVIT = 'REVIT',
  AUTOCAD = 'AUTOCAD',
  NAVISWORKS = 'NAVISWORKS',
  TEKLA = 'TEKLA',
  CIVIL_3D = 'CIVIL_3D'
}

export enum EquipmentType {
  LASER_SCANNER = 'LASER_SCANNER',
  TOTAL_STATION = 'TOTAL_STATION',
  DRONE = 'DRONE'
}

export enum RenderingEngine {
  VRAY = 'VRAY',
  CORONA = 'CORONA',
  LUMION = 'LUMION',
  UNREAL_ENGINE = 'UNREAL_ENGINE'
}

export interface AgencyApplication {
  id: string;
  createdAt: string;
  updatedAt: string;

  // 1. Identity & Accountability
  authorizedPerson: string;
  designation: string;
  linkedinUrl?: string | null;
  headquarters: string;
  website?: string | null;

  // 2. Legal & Tax Identity
  companyName: string;
  gstNumber?: string | null;
  cin?: string | null;
  pan?: string | null;

  // 3. Service Selection (Flags)
  providesBIM: boolean;
  providesAsBuiltAudit: boolean;
  providesPeerReview: boolean;
  providesBOQ: boolean;
  provides3DRendering: boolean;

  // Technical Details
  bimSoftwares: SoftwareType[];
  lodCapability?: LODLevel | null;
  cdeExperience?: string | null;
  
  equipmentOwned: EquipmentType[];
  serviceRadius?: string | null;

  totalExperience?: number | null;
  specialization?: Specialization | null;

  measurementStandard?: MeasurementStandard | null;
  estimationSoftware?: string | null;

  renderingEngines: RenderingEngine[];
  hardwareCapacity?: HardwareCapacity | null;
  animationCapability?: boolean | null;

  // 4. Evidence & Commercials
  portfolioUrl?: string | null;
  portfolioPdfUrl?: string | null;
  commercialBasis?: string | null;
  baseRate?: number | null;
  leadTime?: string | null;
  teamSize?: number | null;

  // 5. Declaration
  isVerified: boolean;
  signature?: string | null;
  declarationDate?: string | null;

  // Admin
  status: ApplicationStatus;
}

export interface FreelancerApplication {
  id: string;
  createdAt: string;
  updatedAt: string;

  // 1. Identity & Accountability
  fullName: string;
  designation: string;
  linkedinUrl?: string | null;
  location: string;

  // 2. Legal & Tax Identity
  legalName: string;
  pan?: string | null;

  // 3. Services (Flags)
  providesBIM: boolean;
  providesAsBuiltAudit: boolean;
  providesPeerReview: boolean;
  providesBOQ: boolean;
  provides3DRendering: boolean;

  // Technical Details
  bimSoftwares: SoftwareType[];
  lodCapability?: LODLevel | null;
  cdeExperience?: string | null;
  
  equipmentOwned: EquipmentType[];
  serviceRadius?: string | null;

  totalExperience?: number | null;
  specialization?: Specialization | null;

  measurementStandard?: MeasurementStandard | null;
  estimationSoftware?: string | null;

  renderingEngines: RenderingEngine[];
  hardwareCapacity?: HardwareCapacity | null;
  animationCapability?: boolean | null;

  // 4. Commercials
  portfolioUrl?: string | null;
  portfolioPdfUrl?: string | null;
  commercialBasis?: string | null;
  baseRate?: number | null;
  leadTime?: string | null;
  availability?: string | null;

  // 5. Declaration
  isVerified: boolean;
  signature?: string | null;
  declarationDate?: string | null;

  // Admin
  status: ApplicationStatus;
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

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName?: string | null;
  message: string;
  createdAt: string;
  updatedAt: string;
}
