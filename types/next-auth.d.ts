import { DefaultSession } from "next-auth";
import { Rank } from "utils/db";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user?: DefaultSession["user"] & {
      rank: Rank;
    };
  }
}
