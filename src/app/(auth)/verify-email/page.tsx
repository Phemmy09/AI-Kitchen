import Link from "next/link";
import { MailCheck } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";

export default function VerifyEmailPage() {
  return (
    <AuthCard
      title="Check your inbox"
      subtitle="We've sent you a confirmation link to activate your account"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <MailCheck className="h-12 w-12 text-brand-gold" />
        <p className="text-sm text-white/60">
          Click the link in the email to confirm your address, then verify your phone number to
          unlock the visualiser.
        </p>
        <Link href="/login" className="text-sm font-semibold text-brand-gold hover:underline">
          Back to sign in
        </Link>
      </div>
    </AuthCard>
  );
}
