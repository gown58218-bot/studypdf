import Link from "next/link";
import AuthButton from "@/components/AuthButton";
import { createClient } from "@/lib/supabase/server";

function dday(examDate: string) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
  const diff = Math.round((Date.parse(examDate) - Date.parse(today)) / 86400000);
  if (diff > 0) return `D-${diff}`;
  if (diff === 0) return "D-DAY";
  return `D+${-diff}`;
}

export default async function Dashboard({ email }: { email: string }) {
  const supabase = await createClient();
  const { data: exams } = await supabase
    .from("exams")
    .select("id, title, exam_date")
    .order("exam_date", { ascending: true });

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-6 py-4">
          <span className="text-xl font-bold">StudyPDF</span>
          <AuthButton email={email} />
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">내 시험</h1>
          <Link
            href="/exams/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + 시험 만들기
          </Link>
        </div>

        {!exams || exams.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold mb-2">아직 시험이 없어요</p>
            <p className="text-gray-500">다가오는 시험을 추가하고 준비를 시작해보세요.</p>
          </div>
        ) : (
          <ul className="grid gap-4">
            {exams.map((exam) => (
              <li
                key={exam.id}
                className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm"
              >
                <div>
                  <p className="text-lg font-bold">{exam.title}</p>
                  <p className="text-sm text-gray-500">{exam.exam_date}</p>
                </div>
                <span className="text-2xl font-bold text-blue-600">{dday(exam.exam_date)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}