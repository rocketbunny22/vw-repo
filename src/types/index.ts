export interface System {
  id: string;
  name: string;
  slug: string;
  description: string;
  content: string;
  specs?: Record<string, string>;
  commonIssues?: string[];
  maintenanceTips?: string[];
}

export interface Generation {
  id: string;
  name: string;
  slug: string;
  years: string;
  description: string;
  models: string[];
  image: string;
  systems: System[];
}

export interface VehicleModel {
  id: string;
  name: string;
  generation: string;
  years: string;
  engine: string;
  horsepower: string;
  torque: string;
  transmission: string;
  weight: string;
}

export interface PdfDocument {
  id: string;
  filename: string;
  originalName: string;
  generation: string;
  model?: string;
  models?: string[];
  system: string;
  title: string;
  description: string;
  searchText?: string;
  searchTextExtractedAt?: string;
  uploadedAt: string;
  uploadedBy?: string;
  fileSize: number;
  url: string;
  downloads: number;
  approved?: boolean;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface Comment {
  id: string;
  guideId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  reported?: boolean;
  reportedAt?: string;
  moderationStatus?: 'pending' | 'reviewed';
}

export interface DiyGuide {
  id: string;
  title: string;
  slug: string;
  generation: string;
  system: string;
  author: string;
  authorId?: string;
  content: string;
  difficulty: string;
  timeEstimate: string;
  tools: string[];
  parts: string[];
  createdAt: string;
  updatedAt: string;
  views: number;
  featured: boolean;
  approved?: boolean;
}

export interface VehicleProfile {
  generation: string;
  model: string;
  year?: number;
  engineCode?: string;
  color?: string;
  nickname?: string;
}

export interface UserBookmarks {
  pdfIds: string[];
  guideIds: string[];
}

export interface MaintenanceChecklistItem {
  id: string;
  label: string;
  detail: string;
  system?: string;
  href?: string;
}

export interface MaintenanceChecklist {
  id: string;
  title: string;
  description: string;
  generation?: string;
  system?: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  items: MaintenanceChecklistItem[];
}

export interface UserChecklists {
  completedItemIdsByChecklist: Record<string, string[]>;
  updatedAt?: string;
}

export interface UserOnboarding {
  hasSeenWelcome: boolean;
  welcomeSeenAt?: string;
}

export interface UserProfileLinks {
  instagram?: string;
  vwVortex?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  role: 'user' | 'admin';
  createdAt: string;
  lastLogin: string;
  vehicle?: VehicleProfile;
  bookmarks?: UserBookmarks;
  checklists?: UserChecklists;
  onboarding?: UserOnboarding;
  profileLinks?: UserProfileLinks;
}
