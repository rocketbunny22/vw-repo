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
  system: string;
  title: string;
  description: string;
  uploadedAt: string;
  uploadedBy?: string;
  fileSize: number;
  url: string;
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

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  role: 'user' | 'admin';
  createdAt: string;
  lastLogin: string;
}