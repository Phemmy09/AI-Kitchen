"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendPhoneOtp, verifyPhoneOtp } from "@/lib/actions/phone";
import { AuthCard, FormError } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function VerifyPhonePage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  function handleSendCode(formData: FormData) {
    setError(undefined);
    startTransition(async () => {
      const result = await sendPhoneOtp(formData);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setPhone(String(formData.get("phone")));
      setStep("code");
    });
  }

  function handleVerifyCode(formData: FormData) {
    setError(undefined);
    formData.set("phone", phone);
    startTransition(async () => {
      const result = await verifyPhoneOtp(formData);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push("/visualiser");
    });
  }

  return (
    <AuthCard
      title="Verify your phone"
      subtitle={
        step === "phone"
          ? "We'll text you a one-time code to confirm your number"
          : `Enter the code we sent to ${phone}`
      }
    >
      {step === "phone" ? (
        <form action={handleSendCode} className="flex flex-col gap-4">
          <FormError message={error} />
          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            placeholder="+14155552671"
            pattern="\+[1-9]\d{7,14}"
            required
          />
          <p className="text-xs text-white/40">Include your country code, e.g. +1 for the US, +44 for the UK.</p>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Sending code..." : "Send Verification Code"}
          </Button>
        </form>
      ) : (
        <form action={handleVerifyCode} className="flex flex-col gap-4">
          <FormError message={error} />
          <Input label="Verification Code" name="token" type="text" inputMode="numeric" placeholder="123456" required />
          <Button type="submit" disabled={isPending}>
            {isPending ? "Verifying..." : "Verify & Continue"}
          </Button>
          <button
            type="button"
            onClick={() => setStep("phone")}
            className="text-xs text-white/40 hover:text-white/70"
          >
            Use a different number
          </button>
        </form>
      )}
    </AuthCard>
  );
}
