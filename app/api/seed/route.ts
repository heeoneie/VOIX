import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SURVEY_ID = "demo-skincare-001";

const dummyResponses = [
  {
    survey_id: SURVEY_ID,
    status: "completed",
    completed_at: "2026-04-06T14:23:00Z",
    answers: [
      {
        question_index: 0,
        question_text: "평소 스킨케어 루틴에 대해 알려주세요.",
        transcript:
          "저는 아침에는 토너랑 수분크림만 간단하게 바르고요, 저녁에는 클렌징 오일로 먼저 지우고 폼 클렌징한 다음에 토너, 세럼, 크림 순서로 발라요. 민감한 피부라서 성분을 되게 꼼꼼히 보는 편이에요.",
        audio_url: "",
      },
      {
        question_index: 1,
        question_text:
          "성분을 꼼꼼히 보신다고 하셨는데, 특별히 선호하시는 성분이 있나요?",
        transcript:
          "세라마이드랑 히알루론산이 들어간 제품을 주로 찾아요. 알코올이나 향료가 들어간 건 피하는 편이고요. 판테놀도 좋아하는데 진정 효과가 확실히 있더라고요.",
        audio_url: "",
      },
      {
        question_index: 2,
        question_text: "현재 사용 중인 제품 중 가장 만족스러운 건 뭔가요?",
        transcript:
          "지금 쓰고 있는 세라마이드 크림이 진짜 좋아요. 가격도 2만원대로 합리적이고 자극 없이 보습이 오래가거든요. 이거 쓰고 나서 피부 트러블이 확실히 줄었어요.",
        audio_url: "",
      },
      {
        question_index: 3,
        question_text: "스킨케어 제품을 고를 때 가장 중요하게 생각하는 기준은?",
        transcript:
          "일단 성분이 첫 번째고요, 그다음이 가격이에요. 아무리 좋은 성분이어도 너무 비싸면 꾸준히 못 쓰니까요. 후기도 많이 보는 편인데 특히 민감 피부 후기를 집중적으로 찾아봐요.",
        audio_url: "",
      },
      {
        question_index: 4,
        question_text:
          "앞으로 스킨케어에서 개선하고 싶은 부분이 있다면 말씀해주세요.",
        transcript:
          "자외선 차단을 좀 더 신경 쓰고 싶어요. 민감 피부용 선크림 중에 마음에 드는 게 없어서 매번 고민이거든요. 백탁 없고 자극 없는 선크림이 있으면 좋겠어요.",
        audio_url: "",
      },
    ],
  },
  {
    survey_id: SURVEY_ID,
    status: "completed",
    completed_at: "2026-04-07T10:15:00Z",
    answers: [
      {
        question_index: 0,
        question_text: "평소 스킨케어 루틴에 대해 알려주세요.",
        transcript:
          "저는 안티에이징에 관심이 많아서 저녁 루틴이 좀 길어요. 클렌징 후에 토너, 비타민C 세럼, 레티놀, 아이크림, 나이트크림까지 다 발라요. 아침에는 좀 간단하게 토너랑 선크림 정도요.",
        audio_url: "",
      },
      {
        question_index: 1,
        question_text:
          "레티놀 제품을 사용하고 계시는군요. 효과는 어떠세요?",
        transcript:
          "확실히 피부결이 좋아진 건 느껴요. 근데 건조함이 좀 심해져서 보습을 더 신경 써야 하더라고요. 레티놀 쓰면서 보습력 좋은 크림을 찾고 있는데 마음에 쏙 드는 게 없어요.",
        audio_url: "",
      },
      {
        question_index: 2,
        question_text: "보습력이 부족하다고 느끼시는 이유가 있을까요?",
        transcript:
          "대부분 크림이 바르고 나면 괜찮은데 2-3시간 지나면 당기기 시작해요. 특히 겨울에는 심해요. 가격대가 좀 있더라도 확실히 보습이 오래가는 제품을 쓰고 싶어요.",
        audio_url: "",
      },
      {
        question_index: 3,
        question_text:
          "제품 구매 시 주로 어디서 정보를 얻으시나요?",
        transcript:
          "피부과 선생님 추천을 제일 많이 참고해요. 유튜브 피부과 전문의 채널도 자주 보고요. 인플루언서 광고는 잘 안 믿는 편이에요. 실제 사용 후기가 중요하죠.",
        audio_url: "",
      },
      {
        question_index: 4,
        question_text: "마지막으로 이상적인 스킨케어 제품은 어떤 건가요?",
        transcript:
          "레티놀과 함께 써도 자극 없고 보습력이 12시간 이상 유지되는 크림이요. 약간 리치한 텍스처인데 끈적이지 않으면 완벽할 것 같아요. 가격은 5만원 이하면 좋겠어요.",
        audio_url: "",
      },
    ],
  },
  {
    survey_id: SURVEY_ID,
    status: "completed",
    completed_at: "2026-04-07T15:42:00Z",
    answers: [
      {
        question_index: 0,
        question_text: "평소 스킨케어 루틴에 대해 알려주세요.",
        transcript:
          "솔직히 스킨케어에 시간을 많이 안 쓰는 편이에요. 클렌징폼으로 세안하고 토너 바르고 바로 선크림 바르고 나가요. 지성 피부라서 무거운 크림은 잘 안 발라요.",
        audio_url: "",
      },
      {
        question_index: 1,
        question_text:
          "지성 피부시라면 특별히 신경 쓰는 부분이 있으신가요?",
        transcript:
          "모공이랑 트러블이요. T존에 피지가 많이 올라오는데 이걸 조절하면서도 피부가 안 당기는 제품을 찾는 게 어려워요. BHA 토너를 써보고 있는데 효과가 있는 것 같기도 하고요.",
        audio_url: "",
      },
      {
        question_index: 2,
        question_text: "제품 정보는 주로 어디서 얻으세요?",
        transcript:
          "인스타그램이랑 틱톡에서 많이 봐요. 숏폼 영상으로 리뷰 보는 게 편하거든요. 올리브영 앱에서 리뷰 평점도 꼭 확인하고요. 4.5 이상인 것만 사는 편이에요.",
        audio_url: "",
      },
      {
        question_index: 3,
        question_text: "텍스처나 사용감에서 중요하게 생각하는 점은?",
        transcript:
          "산뜻한 거요! 끈적이는 건 진짜 못 써요. 젤 타입이나 워터 타입을 좋아하고 발랐을 때 빠르게 흡수되는 게 중요해요. 향은 은은하게 있으면 좋은데 없어도 상관없어요.",
        audio_url: "",
      },
      {
        question_index: 4,
        question_text: "가격대는 보통 어느 정도를 선호하시나요?",
        transcript:
          "1-2만원대요. 학생이라 비싼 건 부담스럽고, 올리브영에서 세일할 때 주로 사요. 가성비 좋은 국내 브랜드를 선호해요. 외국 브랜드는 너무 비싸서 잘 안 써요.",
        audio_url: "",
      },
    ],
  },
  {
    survey_id: SURVEY_ID,
    status: "completed",
    completed_at: "2026-04-08T09:30:00Z",
    answers: [
      {
        question_index: 0,
        question_text: "평소 스킨케어 루틴에 대해 알려주세요.",
        transcript:
          "남자라서 복잡한 건 잘 모르고 올인원 로션 하나만 써요. 세안하고 그거 하나 바르면 끝이에요. 솔직히 귀찮아서 그런 것도 있고, 뭘 더 발라야 하는지도 잘 모르겠어요.",
        audio_url: "",
      },
      {
        question_index: 1,
        question_text:
          "올인원 제품 하나로 관리하시는군요. 만족하시나요?",
        transcript:
          "기본적인 보습은 되는 것 같은데 겨울에는 좀 부족한 느낌이에요. 근데 뭘 더 추가하긴 귀찮고... 올인원인데 보습력이 더 좋은 게 있으면 바꿀 의향은 있어요.",
        audio_url: "",
      },
      {
        question_index: 2,
        question_text: "제품 선택할 때 어떤 걸 가장 중요하게 보세요?",
        transcript:
          "향이요. 너무 화장품 냄새 나는 건 싫어요. 무향이거나 아주 약간 시원한 느낌 정도가 좋아요. 그리고 펌프형이면 좋겠어요. 뚜껑 돌려서 짜는 건 번거로워서요.",
        audio_url: "",
      },
      {
        question_index: 3,
        question_text: "스킨케어 관련 정보는 어디서 얻으시나요?",
        transcript:
          "솔직히 거의 안 찾아봐요. 여자친구가 추천해준 걸 쓰거나 편의점에서 눈에 띄는 거 집어요. 가끔 유튜브에서 남자 그루밍 영상 보면 참고하기도 하는데 자주는 아니에요.",
        audio_url: "",
      },
      {
        question_index: 4,
        question_text: "이상적인 남성 스킨케어 제품이 있다면?",
        transcript:
          "올인원인데 보습이 확실하고 향이 거의 없는 거요. 패키지도 심플한 게 좋고 가격은 만원대면 딱 좋겠어요. 솔직히 비싸면 안 살 것 같아요.",
        audio_url: "",
      },
    ],
  },
  {
    survey_id: SURVEY_ID,
    status: "completed",
    completed_at: "2026-04-08T16:10:00Z",
    answers: [
      {
        question_index: 0,
        question_text: "평소 스킨케어 루틴에 대해 알려주세요.",
        transcript:
          "피부과에서 레이저 시술을 정기적으로 받고 있어서 시술 후 관리에 특히 신경 써요. 시술 다음 날은 진정 세럼이랑 재생 크림만 바르고, 평소에는 기본 루틴에 비타민C 세럼을 추가해요.",
        audio_url: "",
      },
      {
        question_index: 1,
        question_text:
          "시술 후 진정 제품으로 어떤 걸 사용하세요?",
        transcript:
          "센텔라 성분 들어간 시카 크림을 주로 써요. 피부과에서 추천해준 더마 브랜드 제품인데 확실히 진정이 빨라요. 일반 화장품보다 더마코스메틱을 더 신뢰하는 편이에요.",
        audio_url: "",
      },
      {
        question_index: 2,
        question_text: "제품 성분을 확인하실 때 어떤 점을 중점적으로 보시나요?",
        transcript:
          "EWG 등급을 꼭 확인해요. 전성분 분석 앱도 쓰고 있고요. 파라벤이나 인공색소 같은 건 절대 안 쓰려고 해요. 피부과 선생님이 추천한 성분 위주로 고르는 편이에요.",
        audio_url: "",
      },
      {
        question_index: 3,
        question_text: "가격에 대해서는 어떻게 생각하세요?",
        transcript:
          "시술비가 이미 많이 들어가니까 화장품은 적당한 가격이면 좋겠어요. 3-5만원 선이면 괜찮고, 효과가 확실하면 좀 더 비싸도 구매할 의향이 있어요. 품질이 가격보다 중요해요.",
        audio_url: "",
      },
      {
        question_index: 4,
        question_text: "스킨케어에서 가장 아쉬운 점이 있다면?",
        transcript:
          "시술 후 전용 제품이 종류가 너무 적어요. 대부분 진정 크림 하나뿐인데, 시술 후에 쓸 수 있는 토너나 세럼 라인업이 더 있으면 좋겠어요. 시술 횟수가 늘면서 이런 수요가 분명히 있을 거예요.",
        audio_url: "",
      },
    ],
  },
  {
    survey_id: SURVEY_ID,
    status: "completed",
    completed_at: "2026-04-09T11:05:00Z",
    answers: [
      {
        question_index: 0,
        question_text: "평소 스킨케어 루틴에 대해 알려주세요.",
        transcript:
          "비건 뷰티에 관심이 많아서 동물실험 안 하는 브랜드만 써요. 클렌징부터 크림까지 전부 비건 인증 제품으로 쓰고 있어요. 루틴은 클렌징, 토너, 세럼, 크림 순서예요.",
        audio_url: "",
      },
      {
        question_index: 1,
        question_text:
          "비건 뷰티를 선택하게 된 계기가 있나요?",
        transcript:
          "환경 다큐멘터리를 보고 나서 생각이 바뀌었어요. 동물실험도 반대하고 환경에 미치는 영향도 줄이고 싶어서요. 패키지도 재활용 가능한 거 위주로 골라요. 리필 시스템이 있으면 더 좋고요.",
        audio_url: "",
      },
      {
        question_index: 2,
        question_text: "비건 제품 중에 아쉬운 점이 있다면?",
        transcript:
          "선택지가 아직 적은 게 아쉬워요. 특히 색조는 비건 옵션이 별로 없고, 기초도 효과가 좀 약한 느낌이 있어요. 비건이면서도 확실한 효과를 보여주는 제품이 나오면 좋겠어요.",
        audio_url: "",
      },
      {
        question_index: 3,
        question_text: "성분 투명성에 대해서는 어떻게 생각하세요?",
        transcript:
          "진짜 중요해요. 전성분을 공개하는 건 기본이고, 원료의 원산지나 제조 과정까지 투명하게 공개하는 브랜드를 신뢰해요. 그린워싱하는 브랜드가 많아서 꼼꼼히 확인해요.",
        audio_url: "",
      },
      {
        question_index: 4,
        question_text: "패키지 디자인도 구매에 영향을 미치나요?",
        transcript:
          "네, 꽤 영향 있어요. 미니멀하고 자연친화적인 디자인을 좋아해요. 플라스틱 사용을 최소화한 패키지면 더 끌리고요. 인스타에 올리고 싶은 예쁜 디자인이면 솔직히 더 사고 싶어져요.",
        audio_url: "",
      },
    ],
  },
];

export async function GET() {
  try {
    const supabase = createClient();

    // 기존 더미 데이터 삭제 후 재삽입
    await supabase
      .from("survey_responses")
      .delete()
      .eq("survey_id", SURVEY_ID);

    const { data, error } = await supabase
      .from("survey_responses")
      .insert(dummyResponses)
      .select();

    if (error) throw error;

    return NextResponse.json({
      message: `${data.length}개 더미 응답 삽입 완료`,
      survey_id: SURVEY_ID,
      ids: data.map((d) => d.id),
    });
  } catch (error) {
    console.error("seed error:", error);
    return NextResponse.json(
      { error: "더미 데이터 삽입 실패" },
      { status: 500 }
    );
  }
}
