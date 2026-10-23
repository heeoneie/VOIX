import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// gemini-2.0-flash는 서비스 종료되어 404를 반환한다. 모델이 다시 바뀌면 GEMINI_MODEL로 교체
export const geminiModel = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
});

export { genAI };
