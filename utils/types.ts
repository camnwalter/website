export interface DBModule {
  id: number;
  user_id: number;
  name: string;
  description: string;
  image: string;
  downloads: number;
  hidden: boolean;
  created_at: number;
  updated_at: number;
  tags: string;
}

export interface DBRelease {
  // TODO: Why is this a bytearray???? Just make it a string like everything else
  id: Uint8Array;
  module_id: number;
  release_version: string;
  mod_version: string;
  changelog: string;
  downloads: number;
  created_at: number;
  updated_at: number;
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

// export interface IUser {
//   id: number;
//   name: string;
//   rank: 'default' | 'trusted' | 'admin';
// }

// export interface IModuleMetadata {
//   limit: number;
//   offset: number;
//   total: number;
// }

// export interface IModuleResponse {
//   meta: IModuleMetadata;
//   modules: IModule[];
// }

// export interface IPersonalUser extends IUser {
//   email: string;
// }

// export interface IRawVersions {
//   [version: string]: Array<string>;
// }

// export interface IVersion {
//   majorMinor: string;
//   patches: Array<string>;
// }

// export type IVersions = Array<IVersion>;

// export type ModuleSearchFilter = 'all' | 'trusted' | 'user' | 'flagged';
// export type ModuleSorting =
//   | 'DATE_CREATED_DESC'
//   | 'DATE_CREATED_ASC'
//   | 'DOWNLOADS_DESC'
//   | 'DOWNLOADS_ASC';
