import { LoginForm } from "@/components/auth/LoginForm";

// Depends on the Firebase client SDK (useAuth) — can't be statically
// prerendered without real .env.local credentials at build time.
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return <LoginForm />;
}
