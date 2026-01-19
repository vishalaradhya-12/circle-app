import OpenAI from 'openai';
import { getPool } from '../config/database';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate a post-session summary using AI
 */
export async function generateSessionSummary(circleId: string): Promise<any> {
    try {
        const pool = getPool();
        const result = await pool.query(
            'SELECT theme, participants FROM circle_sessions WHERE circle_id = $1',
            [circleId]
        );

        if (result.rows.length === 0) {
            throw new Error('Circle not found');
        }

        const { theme, participants } = result.rows[0];

        // Generate validation message using GPT-4
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: `You are a compassionate AI assistant for CIRCLE, an emotional support app. 
          Generate a brief, warm, validation-focused message for users who just completed a voice circle about ${theme}.
          The message should:
          - Be 2-3 sentences
          - Validate their emotions
          - Avoid giving advice
          - Be gentle and reassuring
          - Not mention specific details
          Example: "You were not the only one who felt unheard today. Sharing your experience took courage, and your voice mattered in this space."`
                },
                {
                    role: 'user',
                    content: `Generate a validation message for a circle about ${theme}`
                }
            ],
            temperature: 0.7,
            max_tokens: 150
        });

        const validationMessage = completion.choices[0]?.message?.content ||
            'Thank you for sharing your experience. You were heard, and your presence mattered.';

        // Create mock data for speaking balance (in production, this would come from actual audio analysis)
        const speakingBalance = participants.map(() =>
            Math.floor(Math.random() * 20) + 20 // Random 20-40% per person
        );

        // Normalize to 100%
        const total = speakingBalance.reduce((a: number, b: number) => a + b, 0);
        const normalizedBalance = speakingBalance.map((b: number) => Math.round((b / total) * 100));

        const summary = {
            circleId,
            commonEmotions: [theme, 'connection', 'relief'],
            speakingBalance: normalizedBalance,
            sentimentTrend: 'positive' as const,
            validationMessage,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        };

        // Save to database
        await pool.query(
            `INSERT INTO session_summaries 
       (circle_id, common_emotions, speaking_balance, sentiment_trend, validation_message, created_at, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                summary.circleId,
                summary.commonEmotions,
                summary.speakingBalance,
                summary.sentimentTrend,
                summary.validationMessage,
                summary.createdAt,
                summary.expiresAt
            ]
        );

        return summary;
    } catch (error) {
        console.error('Error generating session summary:', error);

        // Fallback summary if AI fails
        return {
            circleId,
            commonEmotions: ['connection', 'understanding'],
            speakingBalance: [25, 25, 25, 25],
            sentimentTrend: 'positive',
            validationMessage: 'Thank you for sharing your experience. You were heard, and your presence mattered.',
            createdAt: new Date()
        };
    }
}

/**
 * Moderate content for safety
 */
export async function moderateContent(text: string): Promise<boolean> {
    try {
        const moderation = await openai.moderations.create({
            input: text
        });

        const results = moderation.results[0];

        // Check if content is flagged
        return !results.flagged;
    } catch (error) {
        console.error('Error moderating content:', error);
        // Fail safe - allow content if moderation fails
        return true;
    }
}

/**
 * Generate a gentle conversation prompt during silence
 */
export async function generateConversationPrompt(theme: string): Promise<string> {
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: `You are a gentle AI facilitator for CIRCLE emotional support circles.
          Generate a brief, non-intrusive conversation prompt for a circle about ${theme}.
          The prompt should:
          - Be one sentence
          - Be open-ended
          - Not pressure anyone to speak
          - Feel warm and inviting
          - Avoid therapy-speak
          Example: "If anyone feels comfortable, you might share what brought you here today."`
                },
                {
                    role: 'user',
                    content: `Generate a gentle prompt for a circle about ${theme}`
                }
            ],
            temperature: 0.8,
            max_tokens: 50
        });

        return completion.choices[0]?.message?.content ||
            'If anyone would like to share, this is a safe space to do so.';
    } catch (error) {
        console.error('Error generating conversation prompt:', error);
        return 'Take your time. There\'s no pressure to speak.';
    }
}

/**
 * Analyze sentiment from text (for future use with transcriptions)
 */
export async function analyzeSentiment(text: string): Promise<'positive' | 'neutral' | 'negative'> {
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'Analyze the sentiment of the following text. Respond with only one word: positive, neutral, or negative.'
                },
                {
                    role: 'user',
                    content: text
                }
            ],
            temperature: 0.3,
            max_tokens: 10
        });

        const sentiment = completion.choices[0]?.message?.content?.toLowerCase().trim();

        if (sentiment === 'positive' || sentiment === 'negative') {
            return sentiment;
        }
        return 'neutral';
    } catch (error) {
        console.error('Error analyzing sentiment:', error);
        return 'neutral';
    }
}

/**
 * 🎲 EMOTIONAL ROULETTE - Generate deep, progressive questions
 * Questions get more vulnerable as trust level increases
 */
export async function generateEmotionalRouletteQuestion(
    theme: string,
    trustLevel: number = 1, // 1-10 scale
    previousQuestions: string[] = []
): Promise<string> {
    try {
        // Define question depth based on trust level
        const depthGuidelines = {
            low: 'surface-level, gentle, easy to answer',
            medium: 'moderately personal, thought-provoking',
            high: 'deeply vulnerable, potentially life-changing'
        };

        const depth = trustLevel <= 3 ? 'low' : trustLevel <= 7 ? 'medium' : 'high';

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: `You are the "Emotional Roulette" AI for CIRCLE, a mental health support app.
          
Generate ONE deep, vulnerable question for a voice circle about "${theme}".

RULES:
- Question depth: ${depthGuidelines[depth]} (trust level: ${trustLevel}/10)
- Must be open-ended and thought-provoking
- Should encourage vulnerability but not force it
- Avoid therapy-speak or clinical language
- Make it feel like a question a wise friend would ask
- Keep it under 20 words
- Don't repeat these questions: ${previousQuestions.join(', ')}

EXAMPLES by depth:
Low (trust 1-3):
- "What brought you here today?"
- "How has this week been for you?"

Medium (trust 4-7):
- "What's something you wish people understood about you?"
- "When was the last time you felt truly seen?"

High (trust 8-10):
- "What's the lie you tell yourself most often?"
- "If you could tell your younger self one thing, what would it be?"
- "What are you most afraid to admit, even to yourself?"

Generate ONE question appropriate for trust level ${trustLevel}/10:`
                },
                {
                    role: 'user',
                    content: `Theme: ${theme}, Trust Level: ${trustLevel}/10`
                }
            ],
            temperature: 0.9, // Higher creativity for variety
            max_tokens: 60
        });

        const question = completion.choices[0]?.message?.content?.trim() ||
            'If you feel comfortable, what would you like to share?';

        console.log(`🎲 Generated Emotional Roulette question (trust ${trustLevel}/10): ${question}`);
        return question;
    } catch (error) {
        console.error('Error generating Emotional Roulette question:', error);

        // Fallback questions based on trust level
        const fallbackQuestions = {
            low: [
                'What brought you to this circle today?',
                'How are you really feeling right now?',
                'What\'s been on your mind lately?'
            ],
            medium: [
                'What\'s something you wish people understood about you?',
                'When was the last time you felt truly heard?',
                'What would make today feel like a good day?'
            ],
            high: [
                'What are you most afraid to admit?',
                'What would you do if no one was watching?',
                'What truth have you been avoiding?'
            ]
        };

        const depth = trustLevel <= 3 ? 'low' : trustLevel <= 7 ? 'medium' : 'high';
        const questions = fallbackQuestions[depth];
        return questions[Math.floor(Math.random() * questions.length)];
    }
}
