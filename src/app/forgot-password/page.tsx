import { AuthForm } from "@/components/AuthForm";
import { AuthPageShell } from "@/components/AuthPageShell";

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell backHref="/login" backLabel="Sign in">
      <AuthForm mode="forgot" />
    </AuthPageShell>
  );
}
