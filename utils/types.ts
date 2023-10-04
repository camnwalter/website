export interface DBModule {
  id: number;
  user_id: number;
  name: string;
  description: string;
  image: string;
  downloads: number;
  hidden: boolean;
  created_at: Date;
  updated_at: Date;
  tags: string;
}

export interface DBRelease {
  id: Uint8Array;
  module_id: number;
  release_version: string;
  mod_version: string;
  changelog: string;
  downloads: number;
  created_at: Date;
  updated_at: Date;
  verified: boolean;
  verification_token: string;
  verification_message: string;
}

type Rank = "default" | "trusted" | "admin";

export interface DBUser {
  id: number;
  name: string;
  email: string;
  password: string;
  rank: Rank;
  remember_token: string;
  created_at: number;
  updated_at: number;
}

export interface Module {
  id: number;
  owner: User;
  name: string;
  description: string;
  image: string;
  downloads: number;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  releases: Release[];
  flagged: boolean;
}

export interface Release {
  id: string;
  releaseVersion: string;
  modVersion: string;
  changelog: string;
  downloads: number;
  verified: boolean;
}

export interface User {
  id: number;
  name: string;
  rank: Rank;
}

export interface Stats {
  module_count: number;
  release_count: number;
  user_count: number;
  total_downloads: number;
}

export type Sort = "DATE_CREATED_DESC" | "DATE_CREATED_ASC" | "DOWNLOADS_DESC" | "DOWNLOADS_ASC";
