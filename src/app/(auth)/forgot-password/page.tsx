"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type AuthResult } from "@/lib/actions/auth";
import { AuthCard, FormError, FormNotice } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: AuthResult | null = null;

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: AuthResult | null, formData: FormData) => requestPasswordReset(formData),
    initialState,
  );

  const sent = state && "success" in state;

  return (
    <AuthCard
      title="Reset your password"
      subtitle="We'll email you a link to set a new password"
      footer={
        <Link href="/login" className="font-semibold text-brand-gold hover:underline">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <FormNotice message="If an account exists for that email, a reset link is on its way." />
      ) : (
        <form action={formAction} className="flex flex-col gap-4">
          {state && "error" in state && <FormError message={state.error} />}
          <Input label="Email Address" name="email" type="email" placeholder="you@example.com" required />
          <Button type="submit" disabled={isPending}>
            {isPending ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
