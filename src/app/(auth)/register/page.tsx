"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpWithEmail, type AuthResult } from "@/lib/actions/auth";
import { AuthCard, FormError } from "@/components/auth/AuthCard";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: AuthResult | null = null;

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: AuthResult | null, formData: FormData) => signUpWithEmail(formData),
    initialState,
  );

  return (
    <AuthCard
      title="Start for free"
      subtitle="Get free visualisation credits on sign up"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-gold hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <GoogleButton label="Sign up with Google" />

        <div className="flex items-center gap-3 text-xs text-white/30">
          <div className="h-px flex-1 bg-panel-border" />
          or create account with email
          <div className="h-px flex-1 bg-panel-border" />
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          {state && "error" in state && <FormError message={state.error} />}
          <Input label="Full Name" name="name" type="text" placeholder="Your full name" required />
          <Input label="Email Address" name="email" type="email" placeholder="you@example.com" required />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="At least 8 characters"
            minLength={8}
            required
          />
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Repeat password"
            required
          />
          <label className="flex items-start gap-2 text-sm text-white/60">
            <input type="checkbox" name="agreedToTerms" className="mt-1 accent-brand-gold" required />
            I agree to the{" "}
            <Link href="/terms" className="text-brand-gold hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-brand-gold hover:underline">
              Privacy Policy
            </Link>
          </label>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating account..." : "Create Free Account"}
          </Button>
        </form>
      </div>
    </AuthCard>
  );
}
