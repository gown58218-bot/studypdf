import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { dday } from "@/lib/dday";
import UploadPdf from "@/components/UploadPdf";

export default async function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: exam } = await supabase
    .from("exams")
    .select("id, title, exam_date")
    .eq("id", id)
    .maybeSingle();
  if (!exam) notFound();

  const { data: materials } = await supabase
    .from("materials")
    .select("id, file_name")
    .eq("exam_id", id)
    .order("created_at", { ascending: true });

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link href="/" className="text-sm text-gray-500 hover:underline">
          ← 내 시험으로
        </Link>

        <div className="flex items-end justify-between mt-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold">{exam.title}</h1>
            <p className="text-gray-500 mt-1">{exam.exam_date}</p>
          </div>
          <span className="text-3xl font-bold text-blue-600">{dday(exam.exam_date)}</span>
        </div>

        <h2 className="text-xl font-bold mb-4">강의자료</h2>

        {materials && materials.length > 0 && (
          <ul className="grid gap-2 mb-6">
            {materials.map((m) => (
              <li key={m.id} className="rounded-xl bg-white px-5 py-4 shadow-sm">
                📄 {m.file_name}
              </li>
            ))}
          </ul>
        )}

        <UploadPdf examId={exam.id} userId={user.id} />

        <p className="text-sm text-gray-500 mt-6">
          문제 자동 생성은 다음 단계에서 추가돼요.
        </p>
      </div>
    </main>
  );
}