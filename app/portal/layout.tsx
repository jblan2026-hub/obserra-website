import { ClerkProvider } from "@clerk/nextjs";
import "../auth.css";

export default function PortalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/portal"
      signUpFallbackRedirectUrl="/portal"
    >
      {children}
    </ClerkProvider>
  );
}
