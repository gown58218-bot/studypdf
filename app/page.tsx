import { createClient } from "@/lib/supabase/server";
import AuthButton from "@/components/AuthButton";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* 상단 바 */}
      <header className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <span className="text-xl font-bold">StudyPDF</span>
        <AuthButton email={user?.email ?? null} />
      </header>

      {/* 메인 소개 */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
        <p className="text-sm font-semibold text-blue-600 mb-4">
          시험 D-day까지 함께하는 공부 관리
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
          시험날까지,
          <br />
          공부는 알아서 관리해줄게요
        </h1>
        <p className="text-lg text-gray-600 mb-10">
          강의자료와 시험 날짜만 넣으세요.
          <br />
          매일 열면 오늘 풀 문제가 준비되어 있어요.
        </p>
        <a
          href="#"
          className="inline-block rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-700"
        >
          무료로 시작하기
        </a>
      </section>

      {/* 핵심 기능 3가지 */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6 grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-2">오늘의 학습</h3>
            <p className="text-gray-600">
              뭘 공부할지 고민하지 마세요. 새 문제와 복습 문제가 매일 준비돼요.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-2">잊을 때쯤 다시</h3>
            <p className="text-gray-600">
              틀린 문제는 사라지지 않아요. 간격을 두고 다시 나와서 확실히 외워져요.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-2">근거까지 확인</h3>
            <p className="text-gray-600">
              모든 문제에 자료 몇 쪽에서 나왔는지 표시돼요. 믿고 공부할 수 있어요.
            </p>
          </div>
        </div>
      </section>

      {/* 사용 방법 */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-10">이렇게 사용해요</h2>
        <ol className="grid gap-6 sm:grid-cols-3 text-center">
          <li>
            <div className="text-3xl font-bold text-blue-600 mb-2">1</div>
            <p className="font-semibold">시험 만들기</p>
            <p className="text-gray-600 text-sm">시험 이름과 날짜, PDF 업로드</p>
          </li>
          <li>
            <div className="text-3xl font-bold text-blue-600 mb-2">2</div>
            <p className="font-semibold">매일 15분</p>
            <p className="text-gray-600 text-sm">오늘의 학습 목록 풀기</p>
          </li>
          <li>
            <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
            <p className="font-semibold">시험 전날까지</p>
            <p className="text-gray-600 text-sm">약한 부분 위주로 최종 점검</p>
          </li>
        </ol>
      </section>

      <footer className="border-t py-8 text-center text-sm text-gray-500">
        © 2026 StudyPDF
      </footer>
    </main>
  );
}