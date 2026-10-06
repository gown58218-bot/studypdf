import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createExam } from "./actions";

export default async function NewExamPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-md mx-auto px-6 py-12">
        <Link href="/" className="text-sm text-gray-500 hover:underline">
          ← 내 시험으로
        </Link>
        <h1 className="text-2xl font-bold mt-4 mb-8">시험 만들기</h1>

        <form action={createExam} className="grid gap-6 rounded-2xl bg-white p-6 shadow-sm">
          <label className="grid gap-2">
            <span className="font-semibold">시험 이름</span>
            <input
              name="title"
              required
              maxLength={50}
              placeholder="예: 신경해부학 중간고사"
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="grid gap-2">
            <span className="font-semibold">시험 날짜</span>
            <input
              type="date"
              name="exam_date"
              required
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
          >
            저장하기
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-4">PDF 업로드는 다음 단계에서 추가돼요.</p>
      </div>
    </main>
  );
}