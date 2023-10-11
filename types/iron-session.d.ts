import { AuthenticatedUser } from "utils/db/entities";

declare module "iron-session" {
  interface IronSessionData {
    user?: AuthenticatedUser;
  }
}
