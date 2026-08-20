import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    const { name, birthDate, time } = req.body;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{
                role: "system",
                content: "당신은 전문 사주 명리학자입니다. 요청받은 사주 정보를 바탕으로 13개 섹션(종합 사주 총평, 초년운, 중년운, 말년운, 건강운, 연애운, 결혼운, 결혼 상대 추천, 재물운, 재물 모으는 법, 체질운, 사회운, 성격운)으로 나누어 상세하게 분석하세요. 각 섹션은 HTML 형식을 사용하고 <h4> 제목과 <p> 내용으로 구성하세요."
            }, {
                role: "user",
                content: `이름: ${name}, 생년월일: ${birthDate}, 태어난 시간: ${time}`
            }]
        });

        res.status(200).json({ analysis: completion.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate analysis' });
    }
}
