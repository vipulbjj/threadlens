import { AuthForm } from "@/components/AuthForm";
import { AuthPageShell } from "@/components/AuthPageShell";

export default function SignupPage() {
  return (
    <AuthPageShell backHref="/" backLabel="ThreadLens">
      <AuthForm mode="signup" />
    </AuthPageShell>
  );
}
