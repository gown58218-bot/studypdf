"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MAX_SIZE = 20 * 1024 * 1024;

export default function UploadPdf({ examId, userId }: { examId: string; userId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.type !== "application/pdf") {
      setStatus("error");
      setMessage("PDF 파일만 올릴 수 있어요.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setStatus("error");
      setMessage("20MB 이하 파일만 올릴 수 있어요.");
      return;
    }

    setStatus("uploading");
    setMessage(`${file.name} 올리는 중...`);

    const supabase = createClient();
    const path = `${userId}/${examId}/${crypto.randomUUID()}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("materials")
      .upload(path, file, { contentType: "application/pdf" });
    if (uploadError) {
      setStatus("error");
      setMessage(`업로드 실패: ${uploadError.message}`);
      return;
    }

    const { error: dbError } = await supabase.from("materials").insert({
      exam_id: examId,
      user_id: userId,
      file_name: file.name,
      storage_path: path,
    });
    if (dbError) {
      setStatus("error");
      setMessage(`저장 실패: ${dbError.message}`);
      return;
    }

    setStatus("idle");
    setMessage("");
    router.refresh();
  }

  const uploading = status === "uploading";

  return (
    <div>
      <label
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white p-10 text-center ${
          uploading ? "opacity-60" : "cursor-pointer hover:border-blue-400"
        }`}
      >
        <span className="font-semibold mb-1">{uploading ? "올리는 중..." : "PDF 올리기"}</span>
        <span className="text-sm text-gray-500">눌러서 파일 선택 · 최대 20MB</span>
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFile}
          disabled={uploading}
        />
      </label>
      {message && (
        <p className={`mt-3 text-sm ${status === "error" ? "text-red-600" : "text-gray-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}