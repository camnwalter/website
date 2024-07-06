import { route, setSession } from "app/api";
import { NextResponse } from "next/server";

export const POST = route(async () => {
  setSession(null);
  return new Response("Logged out");
});
