"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthButton({ email }: { email: string | null }) {
  const router = useRouter();
  const supabase = createClient();

  async function login() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function logout() {
    await supabase.auth.signOut();
    router.refresh();
  }

  if (email) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{email}</span>
        <button
          onClick={logout}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
    >
      Google로 로그인
    </button>
  );
}