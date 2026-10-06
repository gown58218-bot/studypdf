"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createExam(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const examDate = String(formData.get("exam_date") ?? "");
  if (!title || !examDate) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { error } = await supabase
    .from("exams")
    .insert({ title, exam_date: examDate, user_id: user.id });
  if (error) throw new Error(error.message);

  redirect("/");
}