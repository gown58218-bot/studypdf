"use client";

import { useState, useTransition } from "react";
import { generateQuestions } from "@/app/exams/[id]/actions";

export default function GenerateButton({ materialId, examId }: { materialId: string; examId: string }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function handleClick() {
    setMessage("");
    startTransition(async () => {
      const result = await generateQuestions(materialId, examId);
      if (!result.ok) setMessage(result.message);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={pending}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "만드는 중... (1~2분)" : "문제 만들기"}
      </button>
      {message && <span className="text-xs text-red-600">{message}</span>}
    </div>
  );
}