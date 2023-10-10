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
      async authorize(credentials, req) {
        const isSignUp = credentials.
        console.log("authorize:");
        console.log(credentials);
        if (!credentials) return null;

        const user = await api.auth.verify(credentials?.email, credentials?.password);
        if (user) return user.public();

        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log("sign in:");
      console.log(user);
      console.log(account);
      console.log(profile);
      console.log(email);
      console.log(credentials);
      throw new Error("sign in");
    },
    async session({ session, token, user }): Promise<Session> {
      console.log("session user:");
      console.log(user);
      throw new Error("oops");
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/signUp",
  },
};

export default NextAuth(authOptions);
