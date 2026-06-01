import { AuthForm } from "@/components/AuthForm";
import { AuthPageShell } from "@/components/AuthPageShell";

export default function LoginPage() {
  return (
    <AuthPageShell backHref="/" backLabel="ThreadLens">
      <AuthForm mode="login" />
    </AuthPageShell>
  );
}
