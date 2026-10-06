"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateQuestionsFromPdf } from "@/lib/ai";

const MAX_AI_SIZE = 14 * 1024 * 1024;

export async function generateQuestions(materialId: string, examId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, message: "로그인이 필요해요." };

    const { data: material } = await supabase
      .from("materials")
      .select("id, storage_path, generated_at")
      .eq("id", materialId)
      .maybeSingle();
    if (!material) return { ok: false, message: "자료를 찾을 수 없어요." };
    if (material.generated_at) return { ok: false, message: "이미 문제를 만든 자료예요." };

    const { data: file, error: downloadError } = await supabase.storage
      .from("materials")
      .download(material.storage_path);
    if (downloadError || !file) return { ok: false, message: "파일을 불러오지 못했어요." };

    const pdf = Buffer.from(await file.arrayBuffer());
    if (pdf.length > MAX_AI_SIZE) {
      return { ok: false, message: "지금은 14MB 이하 PDF만 문제를 만들 수 있어요." };
    }

    const questions = await generateQuestionsFromPdf(pdf, 20);
    if (questions.length === 0) {
      return { ok: false, message: "문제를 만들지 못했어요. 잠시 후 다시 시도해주세요." };
    }

    const { error: insertError } = await supabase.from("questions").insert(
      questions.map((q) => ({
        exam_id: examId,
        material_id: materialId,
        user_id: user.id,
        type: q.type,
        question: q.question,
        choices: q.type === "multiple" ? q.choices : [],
        answer: q.answer,
        explanation: q.explanation,
        source_page: q.source_page,
      }))
    );
    if (insertError) return { ok: false, message: `저장 실패: ${insertError.message}` };

    await supabase
      .from("materials")
      .update({ generated_at: new Date().toISOString() })
      .eq("id", materialId);

    revalidatePath(`/exams/${examId}`);
    return { ok: true, message: `${questions.length}문제를 만들었어요.` };
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, message: `오류가 났어요: ${msg.slice(0, 200)}` };
  }
}