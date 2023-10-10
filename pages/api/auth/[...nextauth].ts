import { TypeORMAdapter } from "@auth/typeorm-adapter";
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import * as api from "utils/api";
import { Account, connectionOptions, Session, User, VerificationToken } from "utils/db";

export const authOptions: AuthOptions = {
  adapter: TypeORMAdapter(connectionOptions, {
    entities: {
      UserEntity: User,
      AccountEntity: Account,
      SessionEntity: Session,
      VerificationTokenEntity: VerificationToken,
    },
  }),
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "example@gmail.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials?: Record<string, string>) {
        // TODO: Why would this be null?
        if (!credentials) throw new Error("Internal error: null credentials object");

        // Note: If signup === false, then username could be an email address
        const { username, email, password, signup } = credentials;
        console.log(username, email, password, signup);

        if (signup) return (await api.auth.createUser(username, email, password)).publicWithEmail();

        return (await api.auth.verify(username, password)).publicWithEmail();
      },
    }),
  ],
  callbacks: {
    async session({ session, token, user }): Promise<Session> {
      console.log("session user:");
      console.log(user);
      throw new Error("todo: session");
    },
  },
  pages: {
    signIn: "/auth/signin",
    // signOut: "/auth/signout",
    // error: "/auth/error",
    // verifyRequest: "/auth/verify-request",
    newUser: "/auth/signup",
  },
};

export default NextAuth(authOptions);
