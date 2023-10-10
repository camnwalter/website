import type { Relation, ValueTransformer } from "typeorm";
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

const transformer: Record<"date" | "bigint", ValueTransformer> = {
  date: {
    from: (date: string | null) => date && new Date(parseInt(date, 10)),
    to: (date?: Date) => date?.valueOf().toString(),
  },
  bigint: {
    from: (bigInt: string | null) => bigInt && parseInt(bigInt, 10),
    to: (bigInt?: number) => bigInt?.toString(),
  },
};

@Entity()
export class Module {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, user => user.modules, { eager: true })
  user!: Relation<User>;

  @Column("varchar", { length: 64, unique: true })
  name!: string;

  @Column("varchar", { length: 512, nullable: true })
  summary!: string | null;

  @Column("text", { nullable: true })
  description!: string | null;

  @Column({ type: "varchar", nullable: true })
  image!: string | null;

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
      summary: this.summary,
      description: this.description,
      image_url: this.image,
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
  changelog!: string | null;

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
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar", { length: 32, unique: true })
  name!: string;

  @Column("varchar", { length: 192, unique: true })
  email!: string;

  @Column({ type: "varchar", nullable: true, transformer: transformer.date })
  emailVerified!: string | null;

  @Column({ type: "varchar", nullable: true })
  image!: string | null;

  @Column("varchar", { length: 192, nullable: true })
  password!: string | null;

  @Column({ type: "enum", enum: Rank, default: Rank.DEFAULT })
  rank!: Rank;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => Module, module => module.user)
  modules!: Relation<Module>[];

  @OneToMany(() => Session, session => session.userId)
  sessions!: Session[];

  @OneToMany(() => Account, account => account.userId)
  accounts!: Account[];

  public(): PublicUser {
    return {
      id: this.id,
      name: this.name,
      image_url: this.image,
      rank: this.rank,
      created_at: this.created_at.getTime(),
    };
  }

  publicWithEmail(): PublicUserWithEmail {
    return {
      ...this.public(),
      email: this.email,
      email_verified: this.emailVerified,
    };
  }
}

export interface PublicModule {
  id: string;
  owner: PublicUser;
  name: string;
  summary: string | null;
  description: string | null;
  image_url: string | null;
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
  changelog: string | null;
  downloads: number;
  created_at: number;
  updated_at: number;
}

export interface PublicUser {
  id: string;
  name: string;
  image_url: string | null;
  rank: Rank;
  created_at: number;
}

export interface PublicUserWithEmail extends PublicUser {
  email: string;
  email_verified: string | null;
}

@Entity()
export class Account {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @Column()
  type!: string;

  @Column()
  provider!: string;

  @Column()
  providerAccountId!: string;

  @Column({ type: "varchar", nullable: true })
  refresh_token!: string | null;

  @Column({ type: "varchar", nullable: true })
  access_token!: string | null;

  @Column({
    nullable: true,
    type: "bigint",
    transformer: transformer.bigint,
  })
  expires_at!: number | null;

  @Column({ type: "varchar", nullable: true })
  token_type!: string | null;

  @Column({ type: "varchar", nullable: true })
  scope!: string | null;

  @Column({ type: "varchar", nullable: true })
  id_token!: string | null;

  @Column({ type: "varchar", nullable: true })
  session_state!: string | null;

  @Column({ type: "varchar", nullable: true })
  oauth_token_secret!: string | null;

  @Column({ type: "varchar", nullable: true })
  oauth_token!: string | null;

  @ManyToOne(() => User, user => user.accounts, {
    createForeignKeyConstraints: true,
  })
  user!: User;
}

@Entity()
export class Session {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  sessionToken!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @Column({ transformer: transformer.date })
  expires!: string;

  @ManyToOne(() => User, user => user.sessions)
  user!: User;
}

@Entity({ name: "verification_tokens" })
export class VerificationToken {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  token!: string;

  @Column()
  identifier!: string;

  @Column({ transformer: transformer.date })
  expires!: string;
}
