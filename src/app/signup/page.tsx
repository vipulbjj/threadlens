import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6">
      <Link href="/" className="mb-8 text-sm text-zinc-500 hover:text-zinc-300">
        ← ThreadLens
      </Link>
      <AuthForm mode="signup" />
    </div>
  );
}
