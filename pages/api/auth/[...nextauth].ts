import { TypeORMAdapter } from "@auth/typeorm-adapter";
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
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
    {
      id: "email",
      type: "email",
      name: "Email",
      server: "",
      from: "",
      maxAge: 24 * 60 * 60,
      options: {},
      sendVerificationRequest({ identifier: email, url, provider }) {
        throw new Error(`sendVerificationRequest email=${email} url=${url} provider=${provider}`);
      },
    },
    // CredentialsProvider({
    //   name: "Email and Password",
    //   credentials: {
    //     email: { label: "Email", type: "email", placeholder: "example@gmail.com" },
    //     password: { label: "Password", type: "password" },
    //   },
    //   async authorize(credentials, req) {
    //     console.log("credentials:");
    //     console.log(credentials);
    //     throw new Error("oops");
    //   },
    // }),
  ],
  callbacks: {
    async session({ session, token, user }): Promise<Session> {
      console.log("session user:");
      console.log(user);
      throw new Error("oops");
    },
  },
};

export default NextAuth(authOptions);
