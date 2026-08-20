import OpenAI from 'openai';

// 간단한 만세력(간지 계산) 보조 함수
function getSajuGanji(year, month, day, time) {
  const celestialStems = ['갑(甲)', '을(乙)', '병(丙)', '정(丁)', '무(戊)', '기(己)', '경(庚)', '신(辛)', '임(壬)', '계(癸)'];
  const terrestrialBranches = ['자(子)', '축(丑)', '인(寅)', '묘(卯)', '진(辰)', '사(巳)', '오(午)', '미(未)', '신(申)', '유(酉)', '술(戌)', '해(亥)'];
  
  const yStem = celestialStems[(year - 4) % 10];
  const yBranch = terrestrialBranches[(year - 4) % 12];
  const mStem = celestialStems[(month + 2) % 10];
  const mBranch = terrestrialBranches[(month + 1) % 12];
  const dStem = celestialStems[(day + 5) % 10]; // 예시로 보정
  const dBranch = terrestrialBranches[(day + 3) % 12];

  return {
    year: `${yStem}${yBranch}`,
    month: `${mStem}${mBranch}`,
    day: `${dStem}${dBranch}`,
    time: time === '모름' ? '시간 미상' : time
  };
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { name, birthDate, time } = req.body;
  const [year, month, day] = birthDate.split('-').map(Number);

  try {
    const sajuPillar = getSajuGanji(year, month, day, time);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: `당신은 30년 경력의 정통 명리학 대가입니다. 사용자 정보를 바탕으로 깊이 있고 품격 있는 사주 풀이를 작성하세요.
        
        [필수 지침]
        1. 절대 ```html 이나 ``` 와 같은 마크다운 코드 블록 기호를 사용하지 마세요. 순수 텍스트와 HTML 태그만 사용하세요.
        2. "종합 사주 총평" 타이틀을 중복하지 마세요.
        3. 전문적이고 진중한 어조를 사용하세요.
        4. 다음 섹션 순서대로 작성하세요:
           - 종합 사주 총평
           - 초년운 및 성장기
           - 중년운 (사회적 성취)
           - 말년운 (재물과 안식)
           - 직장 및 사업운 (재물 모으는 비법 포함)
           - 대인관계 및 연애/결혼운
           - 건강 및 체질 조언`
      }, {
        role: "user",
        content: `이름: ${name}, 사주 명식: 년주(${sajuPillar.year}), 월주(${sajuPillar.month}), 일주(${sajuPillar.day}), 시주(${sajuPillar.time})`
      }]
    });

    res.status(200).json({ 
        analysis: completion.choices[0].message.content,
        sajuPillar
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate analysis' });
  }
}
