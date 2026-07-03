"use client";

import { useActionState, useState } from "react";
import type { AuthResult } from "@/lib/actions/auth";
import { updateProfileName, changePassword, deleteOwnAccount } from "@/lib/actions/account";
import { FormError, FormNotice } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Profile } from "@/lib/data/profile";

const initialState: AuthResult | null = null;

export function AccountPanel({ profile }: { profile: Profile }) {
  const [nameState, nameAction, nameIsPending] = useActionState(
    async (_prev: AuthResult | null, formData: FormData) => updateProfileName(formData),
    initialState,
  );
  const [pwState, pwAction, pwIsPending] = useActionState(
    async (_prev: AuthResult | null, formData: FormData) => changePassword(formData),
    initialState,
  );
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <div className="mt-6 flex flex-col gap-8">
      <form action={nameAction} className="flex flex-col gap-4 rounded-2xl border border-panel-border bg-white/5 p-6">
        <h2 className="font-display text-lg font-bold text-white">Profile</h2>
        {nameState && "error" in nameState && <FormError message={nameState.error} />}
        {nameState && "success" in nameState && <FormNotice message="Profile updated." />}
        <Input label="Full Name" name="name" type="text" defaultValue={profile.name} required />
        <Input label="Email Address" type="email" defaultValue={profile.email} disabled />
        <Button type="submit" disabled={nameIsPending} className="self-start">
          {nameIsPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>

      <form action={pwAction} className="flex flex-col gap-4 rounded-2xl border border-panel-border bg-white/5 p-6">
        <h2 className="font-display text-lg font-bold text-white">Password & Security</h2>
        {pwState && "error" in pwState && <FormError message={pwState.error} />}
        {pwState && "success" in pwState && <FormNotice message="Password updated." />}
        <Input label="Current Password" name="currentPassword" type="password" required />
        <Input label="New Password" name="newPassword" type="password" minLength={8} required />
        <Input label="Confirm New Password" name="confirmPassword" type="password" required />
        <Button type="submit" disabled={pwIsPending} className="self-start">
          {pwIsPending ? "Updating..." : "Update Password"}
        </Button>
      </form>

      <div className="flex flex-col gap-3 rounded-2xl border border-red-500/30 bg-red-500/5 p-6">
        <h2 className="font-display text-lg font-bold text-red-400">Danger Zone</h2>
        <p className="text-sm text-white/50">Permanently delete your RatedWorktops account and all saved projects.</p>
        {!confirmingDelete ? (
          <Button variant="danger" className="self-start" onClick={() => setConfirmingDelete(true)}>
            Delete Account
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-sm text-red-400">Are you sure? This cannot be undone.</p>
            <form action={deleteOwnAccount}>
              <Button variant="danger" type="submit">
                Yes, delete my account
              </Button>
            </form>
            <Button variant="secondary" onClick={() => setConfirmingDelete(false)}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
