"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signInWithEmail, type AuthResult } from "@/lib/actions/auth";
import { AuthCard, FormError, FormNotice } from "@/components/auth/AuthCard";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: AuthResult | null = null;

function LoginNotice() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  return message ? <FormNotice message={message} /> : null;
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: AuthResult | null, formData: FormData) => signInWithEmail(formData),
    initialState,
  );

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to continue visualising your kitchen"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-brand-gold hover:underline">
            Sign up free
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <GoogleButton label="Sign in with Google" />

        <div className="flex items-center gap-3 text-xs text-white/30">
          <div className="h-px flex-1 bg-panel-border" />
          or sign in with email
          <div className="h-px flex-1 bg-panel-border" />
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          {state && "error" in state && <FormError message={state.error} />}
          <Suspense fallback={null}>
            <LoginNotice />
          </Suspense>
          <Input label="Email Address" name="email" type="email" placeholder="you@example.com" required />
          <div className="flex flex-col gap-2">
            <Input label="Password" name="password" type="password" placeholder="Your password" required />
            <Link
              href="/forgot-password"
              className="self-end text-xs font-semibold text-brand-gold hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </AuthCard>
  );
}
