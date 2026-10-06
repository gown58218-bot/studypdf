import { GoogleGenAI, Type } from "@google/genai";

export type GeneratedQuestion = {
  type: "multiple" | "ox";
  question: string;
  choices: string[];
  answer: string;
  explanation: string;
  source_page: number;
};

// 앞의 모델이 붐비면 다음 모델로 자동 전환
const MODELS = [
  process.env.GEMINI_MODEL || "gemini-flash-latest",
  "gemini-flash-lite-latest",
];

const schema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ["multiple", "ox"] },
          question: { type: Type.STRING },
          choices: { type: Type.ARRAY, items: { type: Type.STRING } },
          answer: { type: Type.STRING },
          explanation: { type: Type.STRING },
          source_page: { type: Type.INTEGER },
        },
        required: ["type", "question", "choices", "answer", "explanation", "source_page"],
      },
    },
  },
  required: ["questions"],
};

function buildPrompt(count: number) {
  return `너는 대학 전공 시험의 출제 위원이야. 첨부한 강의자료 PDF만 근거로 시험 대비 문제 ${count}개를 만들어.

규칙:
- 자료에 없는 내용은 절대 문제나 해설에 넣지 마.
- 객관식(multiple)과 O/X(ox)를 대략 7:3 비율로 섞어.
- 객관식은 보기 4개. answer는 정답 보기의 번호("1"~"4").
- O/X는 choices를 빈 배열로 두고, answer는 "O" 또는 "X".
- explanation은 정답인 이유를 1~2문장으로.
- source_page는 근거가 되는 내용이 있는 PDF 페이지 번호(첫 페이지가 1).
- 단순 단어 맞히기보다 핵심 개념을 이해했는지 확인하는 문제 위주로.
- 자료 전체에 골고루 분포되게 만들어.
- 모든 문장은 한국어로.`;
}

function isTemporaryError(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  return /503|429|UNAVAILABLE|RESOURCE_EXHAUSTED|overloaded|high demand/i.test(msg);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function generateQuestionsFromPdf(
  pdf: Buffer,
  count: number
): Promise<GeneratedQuestion[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const contents = [
    {
      role: "user",
      parts: [
        { inlineData: { mimeType: "application/pdf", data: pdf.toString("base64") } },
        { text: buildPrompt(count) },
      ],
    },
  ];

  let lastError: unknown;

  for (const model of MODELS) {
    // 모델마다 최대 3번 시도 (2초, 5초 간격)
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await ai.models.generateContent({
          model,
          contents,
          config: {
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature: 0.4,
          },
        });
        console.log(`[ai] ${model} 성공 (시도 ${attempt + 1})`);
        return parseQuestions(res.text ?? "{}");
      } catch (e) {
        lastError = e;
        if (!isTemporaryError(e)) throw e;
        console.log(`[ai] ${model} 붐빔, 다시 시도 (${attempt + 1}/3)`);
        await sleep(attempt === 0 ? 2000 : 5000);
      }
    }
  }

  throw lastError;
}

function parseQuestions(text: string): GeneratedQuestion[] {
  const parsed = JSON.parse(text);
  const list: GeneratedQuestion[] = Array.isArray(parsed.questions) ? parsed.questions : [];

  // 형식이 이상한 문제는 걸러내기
  return list.filter((q) => {
    if (!q.question || !q.explanation) return false;
    if (q.type === "multiple") {
      return Array.isArray(q.choices) && q.choices.length === 4 && ["1", "2", "3", "4"].includes(q.answer);
    }
    if (q.type === "ox") return q.answer === "O" || q.answer === "X";
    return false;
  });
}