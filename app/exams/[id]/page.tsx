import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { dday } from "@/lib/dday";
import UploadPdf from "@/components/UploadPdf";
import GenerateButton from "@/components/GenerateButton";

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
    .select("id, file_name, generated_at")
    .eq("exam_id", id)
    .order("created_at", { ascending: true });

  const { data: questions } = await supabase
    .from("questions")
    .select("id, type, question, choices, answer, explanation, source_page")
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
              <li
                key={m.id}
                className="flex items-center justify-between gap-4 rounded-xl bg-white px-5 py-4 shadow-sm"
              >
                <span className="truncate">📄 {m.file_name}</span>
                {m.generated_at ? (
                  <span className="text-sm font-semibold text-green-700 shrink-0">✓ 문제 생성됨</span>
                ) : (
                  <GenerateButton materialId={m.id} examId={exam.id} />
                )}
              </li>
            ))}
          </ul>
        )}

        <UploadPdf examId={exam.id} userId={user.id} />

        {questions && questions.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold mb-1">생성된 문제 ({questions.length})</h2>
            <p className="text-sm text-gray-500 mb-4">
              AI가 만든 문제예요. 정답과 근거 쪽을 실제 자료와 비교해서 확인해보세요.
            </p>
            <ol className="grid gap-4">
              {questions.map((q, i) => (
                <li key={q.id} className="rounded-xl bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold text-blue-600 mb-1">
                    {q.type === "ox" ? "O/X" : "객관식"} · 자료 {q.source_page}쪽
                  </p>
                  <p className="font-semibold mb-3">
                    {i + 1}. {q.question}
                  </p>
                  {q.type === "multiple" && (
                    <ol className="grid gap-1 text-sm text-gray-700 mb-3">
                      {(q.choices as string[]).map((c, j) => (
                        <li
                          key={j}
                          className={String(j + 1) === q.answer ? "font-semibold text-green-700" : ""}
                        >
                          {j + 1}. {c}
                        </li>
                      ))}
                    </ol>
                  )}
                  <p className="text-sm">
                    <span className="font-semibold">정답:</span> {q.answer}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{q.explanation}</p>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </main>
  );
}