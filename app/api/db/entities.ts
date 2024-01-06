import type { Snowflake } from "discord.js";
import type { Relation } from "typeorm";
import { OneToOne } from "typeorm";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum Sort {
  DATE_CREATED_DESC = "DATE_CREATED_DESC",
  DATE_CREATED_ASC = "DATE_CREATED_ASC",
  DOWNLOADS_DESC = "DOWNLOADS_DESC",
  DOWNLOADS_ASC = "DOWNLOADS_ASC",
}

@Entity()
export class Module {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, user => user.modules, { eager: true })
  user!: Relation<User>;

  @Column("varchar", { length: 64, unique: true })
  name!: string;

  @Column("varchar", { length: 300, nullable: true })
  summary!: string | null;

  @Column("text", { nullable: true })
  description!: string | null;

  @Column({ type: "varchar", nullable: true })
  image!: string | null;

  @Column("int", { default: 0 })
  downloads!: number;

  @Column("tinyint", { default: false, width: 1 })
  hidden!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column("simple-array")
  tags!: string[];

  @OneToMany(() => Release, release => release.module, { eager: true })
  releases!: Relation<Release[]>;

  public(): PublicModule {
    // TODO: Check auth to conditionally return unverified releases
    return {
      id: this.id,
      owner: this.user.public(),
      name: this.name,
      summary: this.summary,
      description: this.description,
      image: this.image,
      downloads: this.downloads,
      hidden: this.hidden || undefined,
      tags: this.tags,
      releases: this.releases?.filter(r => r.verified).map(r => r.public()) ?? [],
      created_at: this.created_at.getTime(),
      updated_at: this.updated_at.getTime(),
    };
  }
}

@Entity()
export class Release {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Module, module => module.releases, { nullable: false })
  module!: Relation<Module>;

  @Column("varchar", { length: 32 })
  release_version!: string;

  @Column("varchar", { length: 16 })
  mod_version!: string;

  @Column("simple-array")
  game_versions!: string[];

  @Column("text", { nullable: true, default: null })
  changelog!: string | null;

  @Column("int", { default: 0 })
  downloads!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column("tinyint", { default: false, width: 1 })
  verified!: boolean;

  @Column("varchar", { length: 64, nullable: true, default: null })
  verification_message_id?: Snowflake;

  @OneToOne(() => User)
  verified_by!: Relation<User> | null;

  @Column("datetime", { default: null })
  verified_at!: Date | null;

  public(): PublicRelease {
    return {
      id: this.id,
      release_version: this.release_version,
      mod_version: this.mod_version,
      game_versions: this.game_versions,
      changelog: this.changelog,
      downloads: this.downloads,
      verified: !!this.verified,
      created_at: this.created_at.getTime(),
      updated_at: this.updated_at.getTime(),
    };
  }
}

export enum Rank {
  DEFAULT = "default",
  TRUSTED = "trusted",
  ADMIN = "admin",
}

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar", { length: 32, unique: true })
  name!: string;

  @Column("varchar", { length: 192, unique: true })
  email!: string;

  @Column("tinyint", { default: false, width: 1 })
  emailVerified!: boolean;

  @Column("uuid", { nullable: true })
  verificationToken!: string | null;

  @Column("uuid", { nullable: true })
  passwordResetToken!: string | null;

  @Column({ type: "varchar", nullable: true })
  image!: string | null;

  @Column("varchar", { length: 192 })
  password!: string;

  @Column({ type: "enum", enum: Rank, default: Rank.DEFAULT })
  rank!: Rank;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => Module, module => module.user)
  modules!: Relation<Module>[];

  @OneToMany(() => Notification, notif => notif.user)
  notifications!: Relation<Notification>[];

  public(): PublicUser {
    return {
      id: this.id,
      name: this.name,
      image: this.image,
      rank: this.rank,
      created_at: this.created_at.getTime(),
    };
  }

  publicAuthenticated(): AuthenticatedUser {
    return {
      ...this.public(),
      email: this.email,
      email_verified: !!this.emailVerified,
      notifications: this.notifications?.map(n => n.public()) ?? [],
    };
  }
}

export enum EmailType {
  DELIVERY = "delivery",
  BOUNCE = "bounce",
  COMPLAINT = "complaint",
}

@Entity()
export class Email {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "enum", enum: EmailType })
  type!: EmailType;

  @Column("varchar", { length: 50, nullable: true })
  subtype!: string;

  @Column("varchar", { length: 255 })
  recipient!: string;

  @Column("varchar", { length: 100 })
  timestamp!: string;

  @CreateDateColumn()
  created_at!: Date;
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, user => user.notifications)
  user!: User;

  @Column("varchar", { length: 255 })
  title!: string;

  @Column("text", { nullable: true })
  description?: string;

  @Column("tinyint", { default: false, width: 1 })
  read!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  public(): PublicNotification {
    return {
      title: this.title,
      description: this.description,
      read: !!this.read,
      created_at: this.created_at.getTime(),
    };
  }
}

// TODO: Convert these to camelCase

export interface PublicModule {
  id: string;
  owner: PublicUser;
  name: string;
  summary: string | null;
  description: string | null;
  image: string | null;
  downloads: number;
  hidden?: true;
  tags: string[];
  releases: PublicRelease[];
  created_at: number;
  updated_at: number;
}

export interface PublicRelease {
  id: string;
  release_version: string;
  mod_version: string;
  game_versions: string[];
  changelog: string | null;
  downloads: number;
  verified: boolean;
  created_at: number;
  updated_at: number;
}

export interface PublicNotification {
  title: string;
  description?: string;
  read: boolean;
  created_at: number;
}

export interface PublicUser {
  id: string;
  name: string;
  image: string | null;
  rank: Rank;
  created_at: number;
}

export interface AuthenticatedUser extends PublicUser {
  email: string;
  email_verified?: boolean;
  notifications: PublicNotification[];
}
