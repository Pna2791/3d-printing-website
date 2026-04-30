"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { FEATURES } from "@/lib/config";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { MaterialWithPricing, PrinterRow } from "@/lib/supabase/types";

type CreateOrderFormProps = {
  materials: MaterialWithPricing[];
  printers: PrinterRow[];
};

type FormState = "idle" | "submitting" | "success" | "error";

/**
 * Order + auth UI — FEATURE DISABLED: kept for future use.
 * Hidden when `FEATURES.ORDER_ENABLED` or `FEATURES.AUTH_ENABLED` is false.
 */
export function CreateOrderForm(props: CreateOrderFormProps) {
  if (!FEATURES.ORDER_ENABLED || !FEATURES.AUTH_ENABLED) {
    return null;
  }
  return <CreateOrderFormInner {...props} />;
}

function CreateOrderFormInner({ materials, printers }: CreateOrderFormProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  const [materialId, setMaterialId] = useState("");
  const [printerId, setPrinterId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [dimX, setDimX] = useState("");
  const [dimY, setDimY] = useState("");
  const [dimZ, setDimZ] = useState("");

  const [formState, setFormState] = useState<FormState>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getUser();
    setUserId(data.user?.id ?? null);
    setSessionEmail(data.user?.email ?? null);
  }, [supabase]);

  useEffect(() => {
    void refreshUser();
    if (!supabase) return;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refreshUser();
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, refreshUser]);

  const signIn = async () => {
    if (!FEATURES.ORDER_ENABLED || !FEATURES.AUTH_ENABLED) return;
    if (!supabase) {
      setAuthError("Supabase is not configured in the browser.");
      return;
    }
    setAuthBusy(true);
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setAuthBusy(false);
    if (error) setAuthError(error.message);
  };

  const signUp = async () => {
    if (!FEATURES.ORDER_ENABLED || !FEATURES.AUTH_ENABLED) return;
    if (!supabase) {
      setAuthError("Supabase is not configured in the browser.");
      return;
    }
    setAuthBusy(true);
    setAuthError(null);
    const origin =
      typeof window !== "undefined" ? window.location.origin : undefined;
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: origin ? { emailRedirectTo: origin } : undefined,
    });
    setAuthBusy(false);
    if (error) setAuthError(error.message);
    else
      setAuthError(
        "Check your email to confirm the account (if confirmation is enabled), then sign in.",
      );
  };

  const signOut = async () => {
    if (!supabase) return;
    setAuthBusy(true);
    await supabase.auth.signOut();
    setAuthBusy(false);
    setCreatedId(null);
    setFormState("idle");
  };

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!FEATURES.ORDER_ENABLED || !FEATURES.AUTH_ENABLED) return;
    setFormError(null);
    setFormState("submitting");
    setCreatedId(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          material_id: materialId,
          printer_id: printerId,
          quantity: Number(quantity),
          dim_x: dimX === "" ? null : Number(dimX),
          dim_y: dimY === "" ? null : Number(dimY),
          dim_z: dimZ === "" ? null : Number(dimZ),
        }),
      });

      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        order?: { id: string };
      };

      if (!res.ok || !json.ok) {
        setFormState("error");
        setFormError(json.error ?? `Request failed (${res.status})`);
        return;
      }

      setFormState("success");
      setCreatedId(json.order?.id ?? null);
    } catch (err) {
      setFormState("error");
      setFormError(err instanceof Error ? err.message : "Network error");
    }
  };

  if (!supabase) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
        Supabase browser client is not configured. Set{" "}
        <code className="font-mono">NEXT_PUBLIC_SUPABASE_*</code> and rebuild.
      </section>
    );
  }

  if (materials.length === 0 || printers.length === 0) {
    return (
      <section className="rounded-2xl border border-zinc-200 p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
        Add materials and printers in Supabase before creating orders.
      </section>
    );
  }

  return (
    <section
      aria-labelledby="order-form-heading"
      className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8"
    >
      <h2
        id="order-form-heading"
        className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
      >
        Create order
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Orders use your Supabase session so RLS applies to the{" "}
        <code className="font-mono text-xs">orders</code> table. Sign in first,
        then submit.
      </p>

      {!userId ? (
        <div className="mt-6 space-y-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Sign in or create an account
          </p>
          <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          {authError ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {authError}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void signIn()}
              disabled={authBusy}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => void signUp()}
              disabled={authBusy}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Sign up
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex items-center justify-between gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <span>
            Signed in as{" "}
            <span className="font-mono text-zinc-900 dark:text-zinc-200">
              {sessionEmail ?? email ?? "user"}
            </span>
          </span>
          <button
            type="button"
            onClick={() => void signOut()}
            disabled={authBusy}
            className="text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400"
          >
            Sign out
          </button>
        </div>
      )}

      <form onSubmit={submitOrder} className="mt-6 space-y-4">
        <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Material
          <select
            required
            value={materialId}
            onChange={(e) => setMaterialId(e.target.value)}
            disabled={!userId || formState === "submitting"}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">Select material…</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.type}) — ${Number(m.unit_price).toFixed(2)}/unit
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Printer
          <select
            required
            value={printerId}
            onChange={(e) => setPrinterId(e.target.value)}
            disabled={!userId || formState === "submitting"}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">Select printer…</option>
            {printers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.status}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Quantity
          <input
            type="number"
            min={1}
            step={1}
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            disabled={!userId || formState === "submitting"}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Dimensions (mm, optional)
          </p>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            <label className="text-xs text-zinc-500">
              X
              <input
                type="number"
                min={0}
                step={0.01}
                value={dimX}
                onChange={(e) => setDimX(e.target.value)}
                disabled={!userId || formState === "submitting"}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
            </label>
            <label className="text-xs text-zinc-500">
              Y
              <input
                type="number"
                min={0}
                step={0.01}
                value={dimY}
                onChange={(e) => setDimY(e.target.value)}
                disabled={!userId || formState === "submitting"}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
            </label>
            <label className="text-xs text-zinc-500">
              Z
              <input
                type="number"
                min={0}
                step={0.01}
                value={dimZ}
                onChange={(e) => setDimZ(e.target.value)}
                disabled={!userId || formState === "submitting"}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
            </label>
          </div>
        </div>

        {formState === "success" ? (
          <div
            className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-100"
            role="status"
          >
            Order placed.{" "}
            {createdId ? (
              <>
                Reference id:{" "}
                <code className="font-mono text-xs">{createdId}</code>
              </>
            ) : null}
          </div>
        ) : null}

        {formState === "error" && formError ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {formError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!userId || formState === "submitting"}
          className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white sm:w-auto sm:px-8"
        >
          {formState === "submitting" ? "Submitting…" : "Submit order"}
        </button>
      </form>
    </section>
  );
}
