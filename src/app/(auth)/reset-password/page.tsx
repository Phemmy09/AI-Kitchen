"use client";

import { useActionState } from "react";
import { updatePassword, type AuthResult } from "@/lib/actions/auth";
import { AuthCard, FormError } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: AuthResult | null = null;

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: AuthResult | null, formData: FormData) => updatePassword(formData),
    initialState,
  );

  return (
    <AuthCard title="Set a new password" subtitle="Choose a strong password for your account">
      <form action={formAction} className="flex flex-col gap-4">
        {state && "error" in state && <FormError message={state.error} />}
        <Input
          label="New Password"
          name="password"
          type="password"
          placeholder="At least 8 characters"
          minLength={8}
          required
        />
        <Input
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          placeholder="Repeat new password"
          required
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </AuthCard>
  );
}
