import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "../auth.css";

export const metadata: Metadata = {
  title: "Create Learner Account",
  robots: { index: false, follow: false },
};

export default function SignUpLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/academy"
      signUpFallbackRedirectUrl="/academy"
    >
      {children}
    </ClerkProvider>
  );
}
