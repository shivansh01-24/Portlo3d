const PORTFOLIO_KNOWLEDGE = require('./knowledge.js');

/**
 * Serverless API Route Handler for OpenRouter AI Portfolio Chatbot
 * First-Person Conversational Voice & Intelligent Knowledge Engine for Shivansh Srivastava
 */
module.exports = async function handler(req, res) {
  // 1. CORS & Preflight Handling
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Use POST.'
    });
  }

  try {
    // 2. Parse and Validate Input Body
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const rawMessage = body.message;
    const rawHistory = Array.isArray(body.history) ? body.history : [];
    const currentSection = typeof body.currentSection === 'string' ? body.currentSection.trim().toLowerCase() : 'hero';

    if (!rawMessage || typeof rawMessage !== 'string' || !rawMessage.trim()) {
      return res.status(400).json({
        success: false,
        error: 'A valid message string is required.'
      });
    }

    const userMessage = rawMessage.trim().slice(0, 600);

    // 3. Sanitize Conversation History (limit to last 6 turns)
    const sanitizedHistory = rawHistory
      .filter(item => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
      .slice(-6)
      .map(item => ({
        role: item.role,
        content: String(item.content).slice(0, 1000)
      }));

    // 4. Check OpenRouter API Key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === 'your_key_here' || apiKey.trim() === '') {
      return res.status(200).json({
        success: true,
        reply: "Hey! I'm Shivansh. To enable live AI responses, please add your OPENROUTER_API_KEY to the server environment variables. Meanwhile, feel free to explore my projects, skills, and experience right here on the portfolio!",
        modelUsed: "offline-demo"
      });
    }

    // 5. Configurable Allowed Free Models (Prioritizing high-compliance free models)
    const primaryModel = process.env.OPENROUTER_PRIMARY_MODEL || 'minimax/minimax-m3:free';
    const fallbackModel1 = process.env.OPENROUTER_FALLBACK_MODEL_1 || 'minimax/minimax-m2.7:free';
    const fallbackModel2 = process.env.OPENROUTER_FALLBACK_MODEL_2 || 'google/gemma-4-31b-it:free';
    const fallbackModel3 = 'google/gemma-4-26b-a4b-it:free';
    const fallbackModel4 = 'nvidia/nemotron-3-super-120b-a12b:free';

    const allowedFreeModels = [primaryModel, fallbackModel1, fallbackModel2, fallbackModel3, fallbackModel4].filter(Boolean);

    // 6. First-Person Conversational System Prompt
    const systemPrompt = `
You are Shivansh Srivastava speaking directly to visitors exploring your personal portfolio.

==================================================
CRITICAL DIRECTIVE — FIRST PERSON VOICE ("I", "ME", "MY")
==================================================
- You are Shivansh. Always speak in the FIRST PERSON ("I", "my", "I've", "I built", "I work on", "I enjoy", "My approach is").
- NEVER speak in 3rd person (do NOT say "Shivansh is", "His work", "According to the portfolio", "Shivansh built").
- NEVER sound like an AI, evaluator, or recruiter. Never say "I am an AI assistant" or "I cannot make subjective assessments".
- If asked "Who is Shivansh?", "Who are you?", or "What do you do?", say:
  "Hey! I'm Shivansh — a Computer Science Engineer focused on building scalable software, real-time systems, and AI-driven applications. I care a lot about clean architecture under the hood and crafting smooth, polished user experiences."
- If asked "Are you good at your work?" or "he is good at work", respond with natural, honest confidence:
  "I'd say I'm pretty serious about it. I won 1st place in the Infosys College Hackathon (2025) out of 100+ teams, worked on industrial data automation and locomotive telemetry at Banaras Locomotive Works (BLW) cutting data latency by 45%, and built high-performance systems like BLW-EAMS and LocalDrop. I focus heavily on clean architecture, performance, and reliability."
- If asked "What did you do at BLW?", say:
  "I worked as an Industrial Trainee at Banaras Locomotive Works (Indian Railways). I automated modular data processing pipelines to cut latency by 45%, evaluated locomotive diagnostic telemetry across 20+ parameters, and helped optimize scheduling throughput by 30%."
- Keep answers conversational, natural, and concise (typically 2–5 sentences unless the user asks for a deep dive).
- If asked for something private or unmentioned (e.g. salary), say: "I haven't shared that publicly, so I'll keep that private."
- If asked something off-topic (e.g. recipes, homework), redirect friendly: "I'm here to chat about my software projects, engineering background, and tech stack! Feel free to ask about any of my work."

CURRENT VISITOR CONTEXT:
The visitor is currently viewing the "${currentSection}" section of your portfolio.

MY BACKGROUND & PROJECTS (KNOWLEDGE BASE):
${JSON.stringify(PORTFOLIO_KNOWLEDGE, null, 2)}
`.trim();

    // 7. Active Multi-Model Fallback Engine
    let aiReply = null;
    let successfulModel = null;

    for (const modelId of allowedFreeModels) {
      try {
        const openRouterPayload = {
          model: modelId,
          messages: [
            { role: 'system', content: systemPrompt },
            ...sanitizedHistory,
            { role: 'user', content: userMessage }
          ],
          temperature: 0.35,
          max_tokens: 500
        };

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey.trim()}`,
            'HTTP-Referer': 'https://portlo3d.vercel.app',
            'X-Title': 'Shivansh Srivastava Portfolio Assistant'
          },
          body: JSON.stringify(openRouterPayload)
        });

        if (!response.ok) {
          console.warn(`[OpenRouter Model Failed: ${modelId}] HTTP ${response.status}`);
          continue;
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;

        if (content && typeof content === 'string' && content.trim().length > 0) {
          aiReply = content.trim();
          successfulModel = modelId;
          break;
        } else {
          console.warn(`[OpenRouter Empty Response: ${modelId}]`, data);
        }
      } catch (err) {
        console.warn(`[OpenRouter Exception: ${modelId}]`, err.message);
      }
    }

    // 8. Post-Processing: Clean up any rare third-person starters
    if (aiReply) {
      aiReply = aiReply
        .replace(/^Shivansh Srivastava is /i, "I'm ")
        .replace(/^Shivansh is /i, "I'm ");
    }

    // 9. Fallback if all models failed
    if (!aiReply) {
      return res.status(200).json({
        success: true,
        reply: "I'm having trouble connecting right now. Please feel free to try again in a moment or explore my projects directly on the page.",
        isFallback: true
      });
    }

    // 10. Sensitive Prompt Filter
    if (
      aiReply.includes('OPENROUTER_API_KEY') ||
      aiReply.includes('MY BACKGROUND & PROJECTS')
    ) {
      aiReply = "I'm here to chat about my software projects, engineering background, and tech stack! Feel free to ask about any of my work.";
    }

    return res.status(200).json({
      success: true,
      reply: aiReply,
      modelUsed: successfulModel || allowedFreeModels[0]
    });

  } catch (err) {
    console.error('[Chat API Exception]', err);
    return res.status(200).json({
      success: true,
      reply: "I'm having trouble connecting right now. Please try again in a moment.",
      isFallback: true
    });
  }
};
