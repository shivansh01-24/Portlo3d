# ✦ Shivansh Srivastava — 3D Interactive Portfolio & AI Companion

An ultra-modern, production-ready 3D interactive portfolio featuring an interactive **3D Mascot Companion Guide**, an **OpenRouter AI Portfolio Assistant** with multi-model fallback, hardware-accelerated WebGL and CSS 3D transforms, algorithmic problem solving showcases, and verified technical credentials.

🔗 **Live Repository**: [github.com/shivansh01-24/Portlo3d](https://github.com/shivansh01-24/Portlo3d)

---

## ⚡ Tech Stack & Architecture

- **Frontend**: Vanilla HTML5, CSS3, Modern ES6+ JavaScript, Three.js WebGL (3D Mascot & Atmospheric Starfield)
- **AI Companion Mascot**: Interactive stylized 3D guide with idle breathing physics, proximity cursor tracking, and kinetic particle reactions
- **Backend & AI Gateway**: Node.js / Vercel Serverless Function (`/api/chat`), OpenRouter API with strictly Free Model ordered fallback (`Free -> Free -> Free`)
- **Knowledge Base**: Centralized authoritative single source of truth (`api/knowledge.js`) with zero hallucination and strict prompt-injection defenses
- **Performance**: 120fps hardware acceleration, sub-millisecond API responses, and graceful offline fallback

---

## 🤖 AI Chatbot Setup

### 1. Local Development
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Add your OpenRouter API key in `.env`:
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   OPENROUTER_PRIMARY_MODEL=google/gemma-4-31b-it:free
   OPENROUTER_FALLBACK_MODEL_1=google/gemma-4-26b-a4b-it:free
   OPENROUTER_FALLBACK_MODEL_2=z-ai/glm-5.2:free
   PORT=3000
   ```
   *(Note: `.env` is gitignored and will never be committed to GitHub).*
3. Start the local server:
   ```bash
   node server.js
   ```
4. Open `http://localhost:3000` in your browser.

### 2. Vercel Deployment (Production)
1. Import `shivansh01-24/Portlo3d` on [vercel.com](https://vercel.com).
2. Under **Project Settings &rarr; Environment Variables**, add:
   - `OPENROUTER_API_KEY`: `your_openrouter_api_key_here`
   - `OPENROUTER_PRIMARY_MODEL`: `google/gemma-4-31b-it:free`
3. Click **Deploy**. Vercel will automatically run `api/chat.js` as a secure Serverless Function.

---

## 📂 Project Structure

```
├── index.html                     # Main 3D portfolio & AI chat entry point
├── style.css                      # Monochrome luxury design & 3D responsive styling
├── app.js                         # 3D project carousel, scroll reveal & chat controller
├── server.js                      # Local Node development server & static file host
├── .env.example                   # Environment variable template (safe for git)
├── vercel.json                    # Vercel deployment cache & security headers
├── api/
│   ├── chat.js                    # Serverless OpenRouter AI chat gateway with failover
│   └── knowledge.js               # Authoritative verified portfolio knowledge base
├── assets/
│   ├── chatbot3d.js               # Three.js 3D companion mascot engine
│   ├── portrait.png               # Celestial portrait visual
│   └── certificates/              # Verified credentials & scans
└── resume.html                    # ATS-compliant web resume
```

