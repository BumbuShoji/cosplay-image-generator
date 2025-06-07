
export interface UploadedImageFile {
  id: string;
  file: File;
  previewUrl: string;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  base64Data: string; // Raw base64 string, not data URI
  createdAt: number;
}

export interface Quota {
  used: number;
  limit: number;
  isSubscribed: boolean;
  subscriptionDate?: number; // Timestamp of when subscription started/renewed
  // userId will be used as the key in localStorage, not stored within the Quota object itself
}

export interface HistoryEntry extends GeneratedImage {}

export interface User {
  id: string; // e.g., mock Google User ID
  name?: string; // e.g., "Mock User"
  email?: string; // e.g., "user@example.com"
  avatarUrl?: string; // URL to a mock avatar
  isLoggedIn: boolean;
}
