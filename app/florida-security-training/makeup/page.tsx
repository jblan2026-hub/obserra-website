import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import MakeupPortal from "./MakeupPortal";
import "../live-classroom.css";
import "./makeup.css";

export default async function FloridaClassDMakeupPage() {
  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent("/florida-security-training/makeup")}`);
  return <MakeupPortal />;
}
