# VOIX

음성 기반 인터랙티브 설문 시스템. 사용자가 음성으로 대화하듯 설문에 답하면, AI가 답변을 이해하고 자연스럽게 다음 질문을 생성합니다.

## 아키텍처

```
┌─────────────┐     ┌──────────────────────────────────────────┐
│   Browser    │     │           Next.js API Routes             │
│              │     │                                          │
│ VoiceRecorder├────►│ /api/process-answer                      │
│              │     │   ├─ STT (Gemini)  ──┐                   │
│ AudioPlayer ◄─────┤   └─ Storage Upload ─┤ Promise.all       │
│              │     │                      ▼                   │
│ QuestionDisp │     │ /api/generate-question (Gemini)          │
│              │     │ /api/tts (ElevenLabs)                    │
│  Zustand     │     │ /api/responses (Supabase)                │
│  Store       │     └──────────────────────────────────────────┘
└─────────────┘                     │
                                    ▼
                            ┌──────────────┐
                            │   Supabase   │
                            │  - Database  │
                            │  - Storage   │
                            └──────────────┘
```

## 음성 설문 루프

```
idle → recording → uploading → transcribing → generating → speaking → idle (반복)
                                                                    → completed
```

## 기술 스택

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **상태 관리**: Zustand (설문 상태 머신)
- **STT**: Google Gemini API (음성 → 텍스트)
- **질문 생성**: Google Gemini API (컨텍스트 기반 후속 질문)
- **TTS**: ElevenLabs API (텍스트 → 음성)
- **DB/Storage**: Supabase (PostgreSQL + Object Storage)

## 시작하기

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local`에 실제 API 키를 입력하세요.

### 3. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

### 4. Supabase 설정

- `survey_responses` 테이블 생성
- `voice-recordings` Storage 버킷 생성

## 폴더 구조

```
app/
├── page.tsx                     # 랜딩
├── survey/[id]/page.tsx         # 설문 진행
├── survey/[id]/complete/        # 완료 화면
├── admin/page.tsx               # 응답 리스트
├── admin/[responseId]/          # 응답 상세
└── api/
    ├── process-answer/          # STT + Storage (병렬)
    ├── generate-question/       # 다음 질문 생성
    ├── tts/                     # 텍스트 → 음성
    └── responses/               # 응답 CRUD
lib/                             # API 클라이언트
stores/                          # Zustand store
components/                      # UI 컴포넌트
types/                           # TypeScript 타입
```
