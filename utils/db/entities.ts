import type { Relation } from "typeorm";
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
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, user => user.modules, { eager: true })
  user!: Relation<User>;

  @Column("varchar", { length: 64, unique: true })
  name!: string;

  @Column("varchar", { length: 512, nullable: true })
  summary?: string;

  @Column("text", { nullable: true })
  description?: string;

  @Column("boolean", { default: false })
  has_image!: boolean;

  @Column("int", { default: 0 })
  downloads!: number;

  @Column("boolean", { default: false })
  flagged!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column("simple-array")
  tags!: string[];

  @OneToMany(() => Release, release => release.module, { eager: true })
  releases!: Relation<Release>[];

  async public(): Promise<PublicModule> {
    // TODO: Check auth to conditionally return unverified releases
    return {
      id: this.id,
      owner: this.user.public(),
      name: this.name,
      description: this.description,
      image_url: this.has_image
        ? `${process.env.WEB_ROOT}/assets/modules/${this.name}.png`
        : undefined,
      downloads: this.downloads,
      tags: this.tags,
      releases: this.releases.filter(r => r.verified).map(r => r.public()),
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

  @Column("text", { nullable: true })
  changelog?: string;

  @Column("int", { default: 0 })
  downloads!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column("boolean", { default: false })
  verified!: boolean;

  public(): PublicRelease {
    return {
      id: this.id,
      release_version: this.release_version,
      mod_version: this.mod_version,
      game_versions: this.game_versions,
      changelog: this.changelog,
      downloads: this.downloads,
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
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("varchar", { length: 32, unique: true })
  name!: string;

  @Column("varchar", { length: 192, unique: true })
  email!: string;

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

  public(): PublicUser {
    return {
      id: this.id,
      name: this.name,
      rank: this.rank,
    };
  }
}

export interface PublicModule {
  id: number;
  owner: PublicUser;
  name: string;
  summary?: string;
  description?: string;
  image_url?: string;
  downloads: number;
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
  changelog?: string;
  downloads: number;
  created_at: number;
  updated_at: number;
}

export interface PublicUser {
  id: number;
  name: string;
  rank: Rank;
}
