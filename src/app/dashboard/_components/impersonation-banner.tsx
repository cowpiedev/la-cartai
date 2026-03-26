"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, X } from "lucide-react";
import { stopImpersonation } from "@/actions/admin";

export function ImpersonationBanner({ businessName }: { businessName: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleStop() {
    startTransition(async () => {
      await stopImpersonation();
      router.push("/admin");
      router.refresh();
    });
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-tertiary text-on-tertiary h-12 px-6 flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <ShieldAlert className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
        <span>
          Viendo panel de:{" "}
          <strong className="font-extrabold">{businessName}</strong>
        </span>
      </div>
      <button
        onClick={handleStop}
        disabled={isPending}
        className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 rounded-full px-3 py-1 text-sm font-bold transition-colors disabled:opacity-60"
      >
        <X className="w-4 h-4" strokeWidth={2.5} />
        Salir de impersonación
      </button>
    </div>
  );
}
