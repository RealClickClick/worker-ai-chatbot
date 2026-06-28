<div align="center">
  <br/>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/🤖_AI_Telegram_Bot-v2.1.0-22C55E?style=for-the-badge&labelColor=1a1a2e&color=00d4aa">
    <img alt="AI Telegram Bot" src="https://img.shields.io/badge/🤖_AI_Telegram_Bot-v2.3.0-22C55E?style=for-the-badge&labelColor=f0f0f0&color=00d4aa" height="40">
  </picture>

  <br/><br/>

  <p><strong>Serverless • Type-Safe • Multi-Lingual • 68 Personas • RAG • Code Sandbox • Tool-Use • Modes</strong></p>

  <p>
    A production-grade Telegram AI assistant running entirely on Cloudflare Workers.<br/>
    Powered by Workers AI — globally distributed, zero cold starts, fully typed.
  </p>

  <br/>

  <!-- Badges Row 1: Tech -->
  <p>
    <a href="#"><img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/></a>
    <a href="#"><img src="https://img.shields.io/badge/Cloudflare_Workers-deployed-F38020?style=flat-square&logo=cloudflare&logoColor=white" alt="Cloudflare"/></a>
    <a href="#"><img src="https://img.shields.io/badge/D1_(SQLite)-database-003056?style=flat-square&logo=cloudflare&logoColor=white" alt="D1"/></a>
    <a href="#"><img src="https://img.shields.io/badge/Workers_AI-inference-8B5CF6?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWdvbiBwb2ludHM9IjEyIDIgMTUgOSAyMiA5IDE2LjUgMTQgMTguNSAyMSAxMiAxNyA1LjUgMjEgNy41IDE0IDIgOSA5IDkiLz48L3N2Zz4=&logoColor=white" alt="Workers AI"/></a>
  </p>

  <!-- Badges Row 2: Quality -->
  <p>
    <a href="#"><img src="https://img.shields.io/badge/tests-173_passing-22C55E?style=flat-square&logo=vitest&logoColor=white" alt="Tests"/></a>
    <a href="#"><img src="https://img.shields.io/badge/coverage-87%25-22C55E?style=flat-square&logo=istanbul&logoColor=white" alt="Coverage"/></a>
    <a href="#"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License"/></a>
    <a href="#"><img src="https://img.shields.io/badge/bundle-487_kB-FF6B6B?style=flat-square&logo=esbuild&logoColor=white" alt="Bundle Size"/></a>
  </p>

  <!-- Language flags -->
  <p>
    <a href="README.md">🇬🇧 English</a> ·
    <a href="README.fa.md">🇮🇷 فارسی</a> ·
    <a href="README.ar.md">🇸🇦 العربية</a> ·
    <a href="README.tr.md">🇹🇷 Türkçe</a> ·
    <a href="README.ru.md">🇷🇺 Русский</a>
  </p>

  <br/>
</div>

---

<h2>📋 Table of Contents</h2>

<p>
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-commands">Commands</a> •
  <a href="#-ai-models">AI Models</a> •
  <a href="#-personas">Personas</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-group-context-system">Group Context</a> •
  <a href="#-configuration">Configuration</a> •
  <a href="#-api-endpoints">API</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-local-development">Development</a>
</p>

---

<h2>✨ Features</h2>

<table>
  <tr>
    <td align="center" width="14%">💬</td>
    <td width="36%"><strong>AI Chat</strong><br/><sub>Context‑aware with 10 selectable models</sub></td>
    <td align="center" width="14%">🎭</td>
    <td width="36%"><strong>68 Personas</strong><br/><sub>9 categories + unlimited custom</sub></td>
  </tr>
  <tr>
    <td align="center">🖼️</td>
    <td><strong>Image Generation</strong><br/><sub>9 models: SDXL, Flux, Lightning, Lucid, FLUX.2 Klein 4B/9B, Phoenix, Dreamshaper</sub></td>
    <td align="center">👁️</td>
    <td><strong>Image Understanding</strong><br/><sub>AI describes any photo</sub></td>
  </tr>
  <tr>
    <td align="center">🌐</td>
    <td><strong>Web Search</strong><br/><sub>Powered by Brave Search API</sub></td>
    <td align="center">🔗</td>
    <td><strong>Web Browsing</strong><br/><sub>Fetch & summarize any URL</sub></td>
  </tr>
  <tr>
    <td align="center">📄</td>
    <td><strong>File Reading</strong><br/><sub>PDF, TXT, DOC inline parsing</sub></td>
    <td align="center">🎙️</td>
    <td><strong>Voice Transcription</strong><br/><sub>Whisper‑powered</sub></td>
  </tr>
  <tr>
    <td align="center">🗂️</td>
    <td><strong>Multi‑Session</strong><br/><sub>Independent chat threads</sub></td>
    <td align="center">📤</td>
    <td><strong>Export</strong><br/><sub>Download .txt history</sub></td>
  </tr>
  <tr>
    <td align="center">🌍</td>
    <td><strong>5 Languages</strong><br/><sub>EN · FA · AR · TR · RU</sub></td>
    <td align="center">👍</td>
    <td><strong>Feedback Buttons</strong><br/><sub>Quality tracking per response</sub></td>
  </tr>
  <tr>
    <td align="center">🛡️</td>
    <td><strong>Rate Limiting</strong><br/><sub>Per‑user throttling + cooldown</sub></td>
    <td align="center">🛠️</td>
    <td><strong>Admin Panel</strong><br/><sub>Broadcast, stats, blocks, cleanup</sub></td>
  </tr>
  <tr>
    <td align="center">📊</td>
    <td><strong>Analytics</strong><br/><sub>Usage metrics + active users</sub></td>
    <td align="center">🧹</td>
    <td><strong>Auto Cleanup</strong><br/><sub>Automatic old‑data rotation</sub></td>
  </tr>
  <tr>
    <td align="center">👥</td>
    <td><strong>Group Context Engine</strong><br/><sub>Per‑user 50‑msg windows + reply chain tracking</sub></td>
    <td align="center">🧵</td>
    <td><strong>Thread Awareness</strong><br/><sub>Full reply chain resolution up to 5 levels deep</sub></td>
  </tr>
  <tr>
    <td align="center">@</td>
    <td><strong>Inline Mode</strong><br/><sub>Type <code>@bot query</code> in any chat</sub></td>
    <td align="center">🔊</td>
    <td><strong>Text‑to‑Speech</strong><br/><sub>Melo TTS with 5‑language support</sub></td>
  </tr>
  <tr>
    <td align="center">⚡</td>
    <td><strong>Streaming Responses</strong><br/><sub>Real‑time text appear as AI thinks</sub></td>
    <td align="center">🎭</td>
    <td><strong>Multi‑Agent Collaboration</strong><br/><sub><code>/debate</code> two personas discuss any topic</sub></td>
  </tr>
  <tr>
    <td align="center">📅</td>
    <td><strong>Daily Tips</strong><br/><sub>AI‑generated morning greetings with occasion highlights</sub></td>
    <td align="center">⏰</td>
    <td><strong>Reminder System</strong><br/><sub>Custom reminders with date/time picker & recurrence</sub></td>
  </tr>
  <tr>
    <td align="center">🗳️</td>
    <td><strong>Ensemble Voting</strong><br/><sub>Query 3 models in parallel, pick best via judge</sub></td>
    <td align="center">🧠</td>
    <td><strong>Adaptive Persona</strong><br/><sub>AI learns user traits from feedback over time</sub></td>
  </tr>
  <tr>
    <td align="center">🧭</td>
    <td><strong>Auto‑Routing</strong><br/><sub>Classifies messages → routes to best model</sub></td>
    <td align="center">📚</td>
    <td><strong>Retrieval‑Augmented Gen (RAG)</strong><br/><sub><code>/learn</code> + <code>/forget</code> knowledge base</sub></td>
  </tr>
  <tr>
    <td align="center">💻</td>
    <td><strong>Code Sandbox</strong><br/><sub><code>/run</code> code in 20 languages via Piston API</sub></td>
    <td align="center">🧵</td>
    <td><strong>AI Memory</strong><br/><sub>Automatic conversation summarization & recall</sub></td>
  </tr>
  <tr>
    <td align="center">📊</td>
    <td><strong>Per‑User Timing</strong><br/><sub>Response‑time analytics per user</sub></td>
    <td align="center">🛡️</td>
    <td><strong>Input Hardening</strong><br/><sub>10k char limit, structured logging</sub></td>
  </tr>
  <tr>
    <td align="center">🏷️</td>
    <td><strong>Sticker / Location / Contact</strong><br/><sub>Multi‑modal message type support</sub></td>
    <td align="center">🔧</td>
    <td><strong>Tool‑Use (Function Calling)</strong><br/><sub>Weather, calculator, dictionary, crypto, news, timezone</sub></td>
  </tr>
  <tr>
    <td align="center">📋</td>
    <td><strong>Prompt Chains / Workflows</strong><br/><sub>Multi‑step AI workflows with variable substitution</sub></td>
    <td align="center">📝</td>
    <td><strong>Quiz Mode</strong><br/><sub>6‑category quiz with streak tracking & scoring</sub></td>
  </tr>
  <tr>
    <td align="center">👨‍🏫</td>
    <td><strong>Teacher Mode</strong><br/><sub>3‑level auto‑lessons with exercises & summaries</sub></td>
    <td align="center">💡</td>
    <td><strong>Brainstorm Mode</strong><br/><sub>Expand, categorize, evaluate & combine ideas</sub></td>
  </tr>
  <tr>
    <td align="center">🧬</td>
    <td><strong>Vector RAG</strong><br/><sub>Embedding‑based semantic search with cosine similarity</sub></td>
    <td align="center">🔊</td>
    <td><strong>Multi‑Lingual TTS</strong><br/><sub>Language‑aware model selection (EN, PT, ES, JA, FA, AR)</sub></td>
  </tr>
  <tr>
    <td align="center">🎨</td>
    <td><strong>AI Image in Responses</strong><br/><sub>Auto‑generate images from <code>[GENERATE_IMAGE]</code> markers</sub></td>
    <td align="center">🗣️</td>
    <td><strong>AI Speech in Responses</strong><br/><sub>Auto‑generate speech from <code>[GENERATE_SPEECH]</code> markers</sub></td>
  </tr>
  <tr>
    <td align="center">✏️</td>
    <td><strong>Edited Message Support</strong><br/><sub>AI re‑responds when user edits a message</sub></td>
    <td align="center">⚡</td>
    <td><strong>KV Cache Layer</strong><br/><sub>Optional KV‑backed 3‑tier caching (KV → memory → DB)</sub></td>
  </tr>
  <tr>
    <td align="center">🔒</td>
    <td><strong>Message Mutex</strong><br/><sub>D1‑based lock prevents race conditions</sub></td>
    <td align="center"></td>
    <td></td>
  </tr>
</table>

---

<h2>🚀 Quick Start</h2>

<h3>Prerequisites</h3>

<table>
  <tr>
    <td>☁️</td>
    <td><a href="https://dash.cloudflare.com/">Cloudflare account</a></td>
  </tr>
  <tr>
    <td>🤖</td>
    <td><a href="https://t.me/botfather">Telegram Bot Token</a> from @BotFather</td>
  </tr>
  <tr>
    <td>📦</td>
    <td><a href="https://nodejs.org/">Node.js</a> 18+ (CLI deployment only)</td>
  </tr>
</table>

<br/>

<h3>Deploy in 3 Minutes (CLI)</h3>

<table>
  <tr>
    <th>Step</th>
    <th>Command</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>1</td>
    <td><code>git clone https://github.com/RealClickClick/worker-ai-chatbot.git && cd worker-ai-chatbot && npm install</code></td>
    <td>Clone & install</td>
  </tr>
  <tr>
    <td>2</td>
    <td><code>npx wrangler d1 create ai-telegram-bot-db</code></td>
    <td>Create D1 database → <b>copy the id into <code>wrangler.toml</code></b></td>
  </tr>
  <tr>
    <td>3</td>
    <td>
      <code>npx wrangler secret put TELEGRAM_BOT_TOKEN</code><br/>
      <code>npx wrangler secret put BRAVE_API_KEY</code>  <i>(optional)</i><br/>
      <code>npx wrangler secret put GOOGLE_GEMINI_API_KEY</code>  <i>(optional)</i><br/>
      <code>npx wrangler secret put WEBHOOK_SECRET</code> <i>(optional)</i><br/>
      <code>npx wrangler secret put ADMIN_IDS</code>     <i>(optional)</i>
    </td>
    <td>Set secrets</td>
  </tr>
  <tr>
    <td>4</td>
    <td><code>npx wrangler deploy</code></td>
    <td>Deploy to Cloudflare</td>
  </tr>
</table>

<br/>

<details>
<summary><strong>☁️ Alternative: Cloudflare Dashboard (no CLI tools required)</strong></summary>

<br/>

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create Application** → **Create Worker**

   ![Step 1: Create Application](docs/setup-screenshots/01-create-application.png)

2. Keep the default **"Hello World"** template and click **Deploy**

   ![Step 2: Start with Hello World](docs/setup-screenshots/02-start-hello-world.png)
   ![Step 3: Deploy](docs/setup-screenshots/03-deploy-hello-world.png)

3. On the worker dashboard, click **Edit code**

   ![Step 4: Dashboard Edit Code](docs/setup-screenshots/04-dashboard-edit-code.png)

4. Select all the default Hello World code → paste the entire contents of [`dist/worker.bundle.js`](dist/worker.bundle.js) → click **Save and Deploy**

   ![Step 5: Paste code and deploy](docs/setup-screenshots/05-paste-code-deploy.png)

5. Go to **Settings → Variables and Secrets** → click **Add** to add these environment variables:

   - `TELEGRAM_BOT_TOKEN` — your bot token from [@BotFather](https://t.me/BotFather)
   - `WORKER_DOMAIN` — `your-worker-name.your-subdomain.workers.dev`
   - `ADMIN_IDS` — your Telegram user ID (optional)
   - `BRAVE_API_KEY` — for web search (optional)
   - `GOOGLE_GEMINI_API_KEY` — for Gemini models (optional)
   - `WEBHOOK_SECRET` — for webhook verification (optional)
   - `BOT_NAME` — custom bot name (optional, overrides persona name)
   - `BOT_DESCRIPTION` — extra system prompt instructions (optional)

   ![Step 6: Settings Variables](docs/setup-screenshots/06-settings-variables.png)
   ![Step 7: Add Telegram Token](docs/setup-screenshots/07-add-telegram-token.png)
   ![Step 8: Add Worker Domain](docs/setup-screenshots/08-add-worker-domain.png)

6. Go to **Workers & Pages** → your worker → **Settings** → **Bindings** → **Add binding** → select **D1 Database** → name it `DB`

   ![Step 9: Bindings Add Binding](docs/setup-screenshots/09-bindings-add-binding.png)
   ![Step 10: Add D1 Database](docs/setup-screenshots/10-add-d1-database.png)

7. Go to **Bindings** → **Add binding** → select **Workers AI** → name it `AI`

   ![Step 11: Add Workers AI](docs/setup-screenshots/11-add-workers-ai.png)
   ![Step 12: Configure AI Binding](docs/setup-screenshots/12-configure-ai-binding.png)

8. Visit `https://your-worker.workers.dev/init` — creates all database tables

   ![Step 13: Init database](docs/setup-screenshots/13-init-database.png)

9. Visit `https://your-worker.workers.dev/setWebhook` — registers the webhook URL with Telegram

   ![Step 14: Set webhook](docs/setup-screenshots/14-set-webhook.png)

</details>

<br/>

<h3>Post‑Deploy</h3>

<table>
  <tr>
    <th>Endpoint</th>
    <th>Purpose</th>
  </tr>
  <tr>
    <td><code>https://your-worker.workers.dev/init</code></td>
    <td>Initialize database tables & run migrations</td>
  </tr>
  <tr>
    <td><code>https://your-worker.workers.dev/setWebhook</code></td>
    <td>Register webhook URL with Telegram</td>
  </tr>
</table>

> ✅ **Done.** Your bot is live — no further setup needed.

---

<h2>🎮 Commands</h2>

<table>
  <tr>
    <th>Command</th>
    <th>Arguments</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>/start</code></td>
    <td>—</td>
    <td>Welcome message with settings menu</td>
  </tr>
  <tr>
    <td><code>/help</code></td>
    <td>—</td>
    <td>Complete command reference</td>
  </tr>
  <tr>
    <td><code>/mode</code></td>
    <td>—</td>
    <td>Open persona & settings selection</td>
  </tr>
  <tr>
    <td><code>/model</code></td>
    <td>—</td>
    <td>Switch AI model</td>
  </tr>
  <tr>
    <td><code>/lang</code></td>
    <td>—</td>
    <td>Change language</td>
  </tr>
  <tr>
    <td><code>/image</code></td>
    <td><code>&lt;prompt&gt;</code></td>
    <td>Generate an image</td>
  </tr>
  <tr>
    <td><code>/search</code></td>
    <td><code>&lt;query&gt;</code></td>
    <td>Search the web via Brave</td>
  </tr>
  <tr>
    <td><code>/translate</code></td>
    <td><code>&lt;text&gt;</code></td>
    <td>Translate to current language</td>
  </tr>
  <tr>
    <td><code>/summarize</code></td>
    <td>—</td>
    <td>Summarize recent conversation</td>
  </tr>
  <tr>
    <td><code>/instructions</code></td>
    <td><code>&lt;text&gt;</code> · <code>reset</code></td>
    <td>Set custom AI behavior</td>
  </tr>
  <tr>
    <td><code>/setname</code></td>
    <td><code>&lt;name&gt;</code> · <code>reset</code></td>
    <td>Set custom bot name (overrides persona name)</td>
  </tr>
  <tr>
    <td><code>/newpersona</code></td>
    <td><code>Name \| Desc</code> · <code>list</code> · <code>del &lt;n&gt;</code></td>
    <td>Create / manage custom personas</td>
  </tr>
  <tr>
    <td><code>/session</code></td>
    <td><code>new &lt;n&gt;</code> · <code>&lt;id&gt;</code> · <code>list</code> · <code>rename</code> · <code>del</code></td>
    <td>Multi‑session management</td>
  </tr>
  <tr>
    <td><code>/export</code></td>
    <td>—</td>
    <td>Download conversation as <code>.txt</code></td>
  </tr>
  <tr>
    <td><code>/clear</code></td>
    <td>—</td>
    <td>Reset memory, settings, sessions</td>
  </tr>
  <tr>
    <td><code>/stats</code></td>
    <td>—</td>
    <td>Show current profile & usage</td>
  </tr>
  <tr>
    <td><code>/tts</code></td>
    <td><code>&lt;text&gt;</code></td>
    <td>Convert text to speech (Farsi, English, Arabic, Turkish, Russian)</td>
  </tr>
  <tr>
    <td><code>/debate</code></td>
    <td><code>&lt;topic&gt;</code></td>
    <td>Start a multi‑agent debate between two personas</td>
  </tr>
  <tr>
    <td><code>/daily</code></td>
    <td>—</td>
    <td>Toggle daily AI‑generated tips & occasion highlights</td>
  </tr>
  <tr>
    <td><code>/remind</code></td>
    <td>—</td>
    <td>Create a custom reminder (4‑step wizard: title → date → time → recurrence)</td>
  </tr>
  <tr>
    <td><code>/reminders</code></td>
    <td>—</td>
    <td>List and manage active reminders</td>
  </tr>
  <tr>
    <td><code>/cancel</code></td>
    <td>—</td>
    <td>Cancel current reminder creation wizard</td>
  </tr>
  <tr>
    <td><code>/learn</code></td>
    <td><code>&lt;text&gt;</code></td>
    <td>Teach the bot — saves to personal knowledge base (RAG)</td>
  </tr>
  <tr>
    <td><code>/forget</code></td>
    <td>—</td>
    <td>Clear learned knowledge</td>
  </tr>
  <tr>
    <td><code>/run</code></td>
    <td><code>&lt;lang&gt; &lt;code&gt;</code></td>
    <td>Execute code in 20 languages via Piston API sandbox</td>
  </tr>
  <tr>
    <td><code>/feedback</code></td>
    <td><code>&lt;message&gt;</code></td>
    <td>Send feedback to developer</td>
  </tr>
  <tr>
    <td><code>/tools</code></td>
    <td>—</td>
    <td>Toggle Tool‑Use (weather, calculator, dictionary, crypto, news, timezone)</td>
  </tr>
  <tr>
    <td><code>/workflow</code></td>
    <td><code>create &lt;n&gt; | &lt;s1&gt; | ...</code> · <code>list</code> · <code>view</code> · <code>run</code> · <code>delete</code></td>
    <td>Create & run multi‑step prompt chains</td>
  </tr>
  <tr>
    <td><code>/mode_quiz</code></td>
    <td>—</td>
    <td>Start quiz mode (6 categories, streak tracking)</td>
  </tr>
  <tr>
    <td><code>/mode_teacher</code></td>
    <td>—</td>
    <td>Start teacher mode (3 levels, auto‑lessons)</td>
  </tr>
  <tr>
    <td><code>/mode_brainstorm</code></td>
    <td>—</td>
    <td>Start brainstorm mode (idea expand, categorize, evaluate, combine)</td>
  </tr>
  <tr>
    <td><code>/adapt</code></td>
    <td>—</td>
    <td>Show adaptive persona profile & traits</td>
  </tr>
  <tr>
    <td><code>/adapt reset</code></td>
    <td>—</td>
    <td>Reset adaptive persona learning data</td>
  </tr>
  <tr>
    <td><code>/admin</code></td>
    <td><code>stats</code> · <code>broadcast</code> · <code>block</code> · <code>unblock</code> · <code>blocked</code> · <code>cleanup</code></td>
    <td>Admin panel <sub>(restricted)</sub></td>
  </tr>
</table>

---

<h2>🤖 AI Models</h2>

<table>
  <tr>
    <th></th>
    <th>Key</th>
    <th>Model ID</th>
    <th>Params</th>
    <th>Vision</th>
    <th>Best For</th>
  </tr>
  <tr>
    <td>⚡</td>
    <td><code>fast</code></td>
    <td><code>@cf/meta/llama-3.1-8b-instruct-fast</code></td>
    <td>8B</td>
    <td align="center">—</td>
    <td>High‑throughput, quick replies</td>
  </tr>
  <tr>
    <td>⚖️</td>
    <td><code>balanced</code></td>
    <td><code>@cf/deepseek-ai/deepseek-r1-distill-qwen-32b</code></td>
    <td>32B</td>
    <td align="center">—</td>
    <td>General‑purpose, quality/speed balance</td>
  </tr>
  <tr>
    <td>🧠</td>
    <td><code>powerful</code></td>
    <td><code>@cf/meta/llama-3.3-70b-instruct-fp8-fast</code></td>
    <td>70B</td>
    <td align="center">—</td>
    <td>Complex reasoning, deep analysis</td>
  </tr>
  <tr>
    <td>🇨🇳</td>
    <td><code>glm</code></td>
    <td><code>@cf/zai-org/glm-4.7-flash</code></td>
    <td>—</td>
    <td align="center">—</td>
    <td>Multilingual, fast inference</td>
  </tr>
  <tr>
    <td>👁️</td>
    <td><code>vision</code></td>
    <td><code>@cf/meta/llama-3.2-11b-vision-instruct</code></td>
    <td>11B</td>
    <td align="center">✅</td>
    <td>Image understanding & description</td>
  </tr>
  <tr>
    <td>🦙</td>
    <td><code>llama4</code></td>
    <td><code>@cf/meta/llama-4-scout-17b-16e-instruct</code></td>
    <td>17B</td>
    <td align="center">—</td>
    <td>Latest generation MoE</td>
  </tr>
  <tr>
    <td>🔬</td>
    <td><code>gemma4</code></td>
    <td><code>@cf/google/gemma-4-26b-a4b-it</code></td>
    <td>26B</td>
    <td align="center">—</td>
    <td>Compact, efficient</td>
  </tr>
  <tr>
    <td>💻</td>
    <td><code>qwen_coder</code></td>
    <td><code>@cf/qwen/qwen2.5-coder-32b-instruct</code></td>
    <td>32B</td>
    <td align="center">—</td>
    <td>Code generation & technical tasks</td>
  </tr>
  <tr>
    <td>✨</td>
    <td><code>gemini_flash</code></td>
    <td><code>gemini-2.5-flash</code></td>
    <td>—</td>
    <td align="center">—</td>
    <td>Fast & cost‑efficient (via Google API)</td>
  </tr>
  <tr>
    <td>✨</td>
    <td><code>gemini_flash_3</code></td>
    <td><code>gemini-3-flash</code></td>
    <td>—</td>
    <td align="center">—</td>
    <td>Latest Gemini, multimodal (via Google API)</td>
  </tr>
</table>

<br/>

<h3>Image Generation Models</h3>

<table>
  <tr>
    <th></th>
    <th>Key</th>
    <th>Model ID</th>
  </tr>
  <tr>
    <td>🎨</td>
    <td><code>sdxl</code></td>
    <td><code>@cf/stabilityai/stable-diffusion-xl-base-1.0</code></td>
  </tr>
  <tr>
    <td>🌊</td>
    <td><code>flux</code></td>
    <td><code>@cf/black-forest-labs/flux-1-schnell</code></td>
  </tr>
  <tr>
    <td>⚡</td>
    <td><code>lightning</code></td>
    <td><code>@cf/bytedance/stable-diffusion-xl-lightning</code></td>
  </tr>
  <tr>
    <td>🔮</td>
    <td><code>flux2_dev</code></td>
    <td><code>@cf/black-forest-labs/flux-2-dev</code></td>
  </tr>
  <tr>
    <td>💎</td>
    <td><code>lucid</code></td>
    <td><code>@cf/leonardo/lucid-origin</code></td>
  </tr>
  <tr>
    <td>🔥</td>
    <td><code>klein4b</code></td>
    <td><code>@cf/black-forest-labs/flux-2-klein-4b</code></td>
  </tr>
  <tr>
    <td>🔥</td>
    <td><code>klein9b</code></td>
    <td><code>@cf/black-forest-labs/flux-2-klein-9b</code></td>
  </tr>
  <tr>
    <td>🔥</td>
    <td><code>phoenix</code></td>
    <td><code>@cf/leonardo/phoenix-1.0</code></td>
  </tr>
  <tr>
    <td>🎨</td>
    <td><code>dreamshaper</code></td>
    <td><code>@cf/lykon/dreamshaper-8-lcm</code></td>
  </tr>
</table>

---

<h2>🎭 Personas</h2>

<p>
  <strong>68 personas</strong> across <strong>9 categories</strong> — each fully described in 5 languages.<br/>
  Select via <code>/mode</code> or create your own with <code>/newpersona Name | Description</code>.
</p>

<br/>

<table>
  <tr>
    <th>Category</th>
    <th align="center">#</th>
    <th>Personas</th>
  </tr>
  <tr>
    <td>💼 Business & Law</td>
    <td align="center">8</td>
    <td>Lawyer, CEO, Accountant, Marketer, Entrepreneur, Investor, Consultant, HR Manager</td>
  </tr>
  <tr>
    <td>💻 Science & Tech</td>
    <td align="center">8</td>
    <td>Hacker, Developer, Data Scientist, Cybersecurity, Physicist, Chemist, Astronomer, Mathematician</td>
  </tr>
  <tr>
    <td>🏥 Health & Wellness</td>
    <td align="center">6</td>
    <td>Doctor, Therapist, Nutritionist, Psychiatrist, Trainer, Yogi</td>
  </tr>
  <tr>
    <td>🎨 Arts & Culture</td>
    <td align="center">8</td>
    <td>Poet, Writer, Musician, Painter, Designer, Architect, Filmmaker, Photographer</td>
  </tr>
  <tr>
    <td>🌍 Fantasy & Adventure</td>
    <td align="center">8</td>
    <td>Wizard, Knight, Pirate, Alien, Vampire, Elf, Dragon, Witch</td>
  </tr>
  <tr>
    <td>🎭 Personality & Humor</td>
    <td align="center">10</td>
    <td>Savage, Depressed, Motivational, Karen, Nerd, Gen Z, Grandpa, Romantic, Comedian, Conspiracy</td>
  </tr>
  <tr>
    <td>🐾 Animals & Nature</td>
    <td align="center">6</td>
    <td>Cat, Dog, Lion, Owl, Dolphin, Panda</td>
  </tr>
  <tr>
    <td>👑 History & Society</td>
    <td align="center">8</td>
    <td>King, Queen, Samurai, Explorer, Detective, Spy, Journalist, Philosopher</td>
  </tr>
  <tr>
    <td>🙏 Spiritual & Mystical</td>
    <td align="center">6</td>
    <td>Monk, Prophet, Shaman, Oracle, Mystic, Sage</td>
  </tr>
</table>

---

<h2>🏗️ Architecture</h2>

<pre>
                           ┌─────────────────────────────────────┐
                           │        Cloudflare Worker            │
                           │     (edge — 50+ locations)          │
                           │                                     │
  Telegram ──POST /──►     │  src/index.ts                       │
   (webhook)     │         │  ├─ secret validation               │
                 │         │  ├─ route dispatch                  │
                 ▼         │  │  /init, /setWebhook,             │
                           │  │  /health, /cleanup, POST /       │
                           │  └──────────────────┬───────────────│
                           │                     │               │
                           │             ┌───────▼────────┐      │
                           │             │  handleMessage  │      │
                           │             │  handleCommand  │      │
                           │             │ handleCallback  │      │
                           │             └───────┬────────┘      │
                           │                     │               │
                           │    ┌────────────────▼───────────┐   │
                           │    │  ai.ts ──── Workers AI     │   │
                           │    │  db.ts ──── D1 (SQLite)    │   │
                           │    │  telegram.ts ── Telegram   │   │
                           │    └────────────────────────────┘   │
                           │            │                        │
                           └────────────┼────────────────────────┘
                                        │
                          Telegram API ◄┘
                              │
                              ▼
                           Telegram User
</pre>

<h3>Data Flow</h3>

<pre>
  ① Telegram → POST /  (verified via secret_token)
  ② index.ts → deduplicate via update_id cache + initCache(env)
  ③ message.ts → classify: text / photo / voice / file / URL / command / sticker / video_note / location / contact / edited_message
    ④ media-pipeline → processMedia(): download, save metadata to D1, build context
  ⑤ load settings (persona, model, session, lang, tools, mode, ensemble, routing) + RAG (vector or LIKE) + memory summary + persona adaptation
    ⑥ tools_enabled → inject tool descriptions (weather, calc, crypto, etc.)
  ⑦ ai.ts → build system prompt + retrieve recent chat history
  ⑧ Workers AI → run inference with optional tool re‑prompt loop (up to 5 turns)
  ⑨ post‑process: [GENERATE_IMAGE] → SDXL · [GENERATE_SPEECH] → TTS · [TOOL_CALL] → execute tool
   ⑩ htmlParser.ts → convert Markdown → Telegram HTML
   ⑪ telegram.ts → send formatted response + feedback buttons
   ⑫ persist user message + AI response to D1
   ⑬ recordInteraction() → adaptive persona trait analysis (every 15 messages)
</pre>

<h3>Tech Stack</h3>

<table>
  <tr>
    <th>Layer</th>
    <th>Technology</th>
    <th>Why</th>
  </tr>
  <tr>
    <td>⚡ Runtime</td>
    <td><a href="https://workers.cloudflare.com/">Cloudflare Workers</a></td>
    <td>Global edge compute, zero cold starts (ES2022)</td>
  </tr>
  <tr>
    <td>📝 Language</td>
    <td><a href="https://www.typescriptlang.org/">TypeScript</a> 5.7</td>
    <td>Fully typed — <code>noImplicitAny</code> enforced, 0 tsc errors</td>
  </tr>
  <tr>
    <td>📦 Bundler</td>
    <td><a href="https://esbuild.github.io/">esbuild</a></td>
    <td>Instant builds, 305 kB minified output</td>
  </tr>
  <tr>
    <td>🗄️ Database</td>
    <td><a href="https://developers.cloudflare.com/d1/">D1 (SQLite)</a></td>
    <td>Auto‑migrations, 3 indexes, automated old‑data cleanup</td>
  </tr>
  <tr>
    <td>🤖 AI</td>
    <td><a href="https://developers.cloudflare.com/workers-ai/">Workers AI</a></td>
    <td>10 chat models + 5 image models + Whisper</td>
  </tr>
  <tr>
    <td>🧪 Testing</td>
    <td><a href="https://vitest.dev/">Vitest</a></td>
    <td>173 tests (unit + integration webhook flow)</td>
  </tr>
  <tr>
    <td>🔍 Linting</td>
    <td>ESLint (tests) + <code>tsc --noEmit</code> (src)</td>
    <td>Separate concerns — type safety + code quality</td>
  </tr>
  <tr>
    <td>🎨 Formatting</td>
    <td><a href="https://prettier.io/">Prettier</a></td>
    <td>Consistent code style</td>
  </tr>
</table>

<h3>Group Context System</h3>

<p>The bot features a professional <strong>Group Context Engine</strong> for intelligent group chat participation. When added to a group, it tracks per-user message windows (50 messages each), resolves reply chains, and builds structured context for accurate AI responses.</p>

<h4>Database Layer — <code>group_messages</code> Table</h4>

<pre>
group_messages (
  id                  INTEGER PRIMARY KEY    -- Auto-increment
  chat_id             TEXT NOT NULL           -- Group ID (e.g. -100123456)
  user_id             TEXT NOT NULL           -- Sender's Telegram user ID
  message_id          INTEGER NOT NULL       -- Telegram message ID
  role                TEXT NOT NULL           -- 'user' | 'assistant'
  content             TEXT NOT NULL           -- Processed message text
  reply_to_message_id INTEGER                -- Parent message ID (nullable)
  reply_to_user_id    TEXT                    -- Parent message sender (nullable)
  reply_to_content    TEXT                    -- Snapshot of parent text (nullable)
  thread_id           TEXT                    -- Reply chain group ID (nullable)
  user_name           TEXT NOT NULL DEFAULT ''-- Display name
  created_at          TEXT DEFAULT (datetime('now'))
)
</pre>

<p><strong>4 indexes</strong> for optimal queries:</p>
<ul>
  <li><code>(chat_id, user_id, created_at)</code> — per-user 50-message window (O(1))</li>
  <li><code>(chat_id, message_id)</code> — reply dependency resolution</li>
  <li><code>(chat_id, created_at)</code> — global group ambient context</li>
  <li><code>(chat_id, thread_id, created_at)</code> — full reply chain queries</li>
</ul>

<h4>Core Module — <code>src/group-context.ts</code></h4>

<p><strong>Three-Layer Context Building</strong> — Every group message triggers a prioritized context assembly:</p>

<pre>
buildGroupContext(chatId, userId, message)
  │
  ├── Layer 1: Reply Chain (highest priority)
  │   ├── resolveReplyChain() — follows reply_to up to 5 levels deep
  │   └── format: "[Reply Chain] @user: msg → @user2: reply → Bot: response"
  │
  ├── Layer 2: User Window (medium priority)
  │   ├── getUserWindow() — last 50 messages from the specific user
  │   └── format: "[User History (last 50)] @user: text  @user: text  Bot: text"
  │
  └── Layer 3: Ambient Context (low priority)
      ├── getAmbientContext() — last 5 global group messages
      └── format: "[Recent Group Activity] @user3: msg  @user4: msg"
</pre>

<p><strong>Key design decisions:</strong></p>
<ul>
  <li><strong>Snapshots</strong>: <code>reply_to_content</code> is captured from Telegram's <code>reply_to_message</code> object, not the database — preserving context even if the parent message falls outside the 50-message window</li>
  <li><strong>Thread Inheritance</strong>: When a user replies to a message, the <code>thread_id</code> is inherited from the parent (or generated if none exists), keeping entire reply chains grouped</li>
  <li><strong>Auto-trim</strong>: Each insert triggers <code>trimGroupHistory()</code>, ensuring every user's window stays at exactly 50 messages</li>
  <li><strong>Message Truncation</strong>: Each message in context is truncated to 200 characters (<code>GROUP_MSG_TRUNCATE</code>) for token efficiency</li>
</ul>

<h4>Group-Aware System Prompt</h4>

<p>The <code>buildGroupSystemPrompt()</code> function in <code>src/ai.ts</code> generates a specialized system prompt with group rules in 5 languages (EN/FA/AR/TR/RU):</p>

<pre>
[GROUP CHAT RULES]
- This is a group chat with multiple users. Each message is prefixed with the sender's name.
- Pay attention to who said what and maintain conversation context.
- When replying to a specific user, address them by name.
- Use the reply chain context to understand threaded conversations.
- Only respond when directly addressed or when you have something valuable to add.
</pre>

<h4>Complete Group Flow</h4>

<pre>
① Telegram sends group message
② Group filter: mentioned / reply to bot / command?
③ storeGroupMessageAndGetInfo() — persist + resolve thread_id + trim
④ Process media (photo → Vision, voice → Whisper, file → extract)
⑤ buildGroupContext() — assemble 3-layer context
⑥ buildGroupSystemPrompt() — persona + group rules + context
⑦ runChat() → Workers AI with enriched system prompt
⑧ storeBotGroupMessage() — persist bot response
⑨ sendMessage() — formatted response with feedback buttons
</pre>

<h4>DM vs Group Comparison</h4>

<table>
  <tr>
    <th>Aspect</th>
    <th>Direct Message</th>
    <th>Group Chat</th>
  </tr>
  <tr>
    <td>History source</td>
    <td><code>chat_history</code> table (last 8 messages)</td>
    <td><code>group_messages</code> table (50 per user + chain + ambient)</td>
  </tr>
  <tr>
    <td>System prompt</td>
    <td><code>buildSystemPrompt()</code> — standard</td>
    <td><code>buildGroupSystemPrompt()</code> — with group rules</td>
  </tr>
  <tr>
    <td>Reply tracking</td>
    <td>None</td>
    <td>Full chain resolution (up to 5 levels)</td>
  </tr>
  <tr>
    <td>Storage</td>
    <td><code>addChatMessage()</code> → <code>chat_history</code></td>
    <td><code>addGroupMessage()</code> → <code>group_messages</code></td>
  </tr>
  <tr>
    <td>User isolation</td>
    <td>Single user</td>
    <td>Per-user 50-message window</td>
  </tr>
  <tr>
    <td>History cleanup</td>
    <td><code>trimHistory()</code> — global cap</td>
    <td><code>trimGroupHistory()</code> — per-user cap + <code>cleanupOldGroupData()</code></td>
  </tr>
</table>

---

<h2>⚙️ Configuration</h2>

<table>
  <tr>
    <th>Variable</th>
    <th align="center">Required</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>TELEGRAM_BOT_TOKEN</code></td>
    <td align="center">✅</td>
    <td>Bot token from <a href="https://t.me/botfather">@BotFather</a></td>
  </tr>
  <tr>
    <td><code>WORKER_DOMAIN</code></td>
    <td align="center">✅</td>
    <td>Your worker URL (set in <code>wrangler.toml</code>)</td>
  </tr>
  <tr>
    <td><code>WEBHOOK_SECRET</code></td>
    <td align="center">—</td>
    <td>Secret token for webhook request verification</td>
  </tr>
  <tr>
    <td><code>ADMIN_IDS</code></td>
    <td align="center">—</td>
    <td>Comma‑separated Telegram user IDs with admin access</td>
  </tr>
  <tr>
    <td><code>BRAVE_API_KEY</code></td>
    <td align="center">—</td>
    <td>API key for <code>/search</code> from <a href="https://brave.com/search/api/">Brave Search</a></td>
  </tr>
  <tr>
    <td><code>GOOGLE_GEMINI_API_KEY</code></td>
    <td align="center">—</td>
    <td>Google AI Studio API key for Gemini models (<a href="https://aistudio.google.com/apikey">get one</a>)</td>
  </tr>
  <tr>
    <td><code>NEWS_API_KEY</code></td>
    <td align="center">—</td>
    <td>API key for news tool from <a href="https://newsapi.org/">NewsAPI</a></td>
  </tr>
</table>

<p>A D1 binding named <code>DB</code> and a Workers AI binding named <code>AI</code> are required. Optionally, a KV namespace binding named <code>KV_CACHE</code> enables persistent cross‑isolate caching. The database schema (16+ tables) is auto‑created on first <code>/init</code> via the built‑in migration system (v1–v28).</p>

---

<h2>🔌 API Endpoints</h2>

<table>
  <tr>
    <th>Endpoint</th>
    <th>Method</th>
    <th>Purpose</th>
  </tr>
  <tr>
    <td><code>/</code></td>
    <td><code>POST</code></td>
    <td>Telegram webhook receiver</td>
  </tr>
  <tr>
    <td><code>/</code></td>
    <td><code>GET</code></td>
    <td>Status page</td>
  </tr>
  <tr>
    <td><code>/init</code></td>
    <td><code>GET</code></td>
    <td>Initialize / migrate D1 schema</td>
  </tr>
  <tr>
    <td><code>/setWebhook</code></td>
    <td><code>GET</code></td>
    <td>Register webhook with Telegram</td>
  </tr>
  <tr>
    <td><code>/health</code></td>
    <td><code>GET</code></td>
    <td>JSON health, version & uptime</td>
  </tr>
  <tr>
    <td><code>/cleanup</code></td>
    <td><code>GET</code></td>
    <td>Manual old‑data cleanup (<code>?days=30</code>)</td>
  </tr>
  <tr>
    <td><code>/daily-cron</code></td>
    <td><code>GET</code></td>
    <td>Trigger daily tips for all enabled chats</td>
  </tr>
  <tr>
    <td><code>/reminder-cron</code></td>
    <td><code>GET</code></td>
    <td>Trigger processing of due reminders</td>
  </tr>
</table>

---

<h2>📁 Project Structure</h2>

<details>
<summary><strong>Click to expand</strong></summary>

<br/>

<pre>
<b>src/</b>
├── <b>index.ts</b>              #  Worker entry — routing, webhook validation
├── <b>ai.ts</b>                 #  AI inference, system prompt builder, web search
├── <b>db.ts</b>                 #  Backward-compat re-exports (legacy)
├── <b>locales.ts</b>            #  i18n — 5 languages, template interpolation
├── <b>locales/</b>              #  Split locale data per language
│   ├── <b>en.ts</b>              #  English (355+ keys)
│   ├── <b>fa.ts</b>              #  فارسی (354+ keys)
│   ├── <b>ar.ts</b>              #  العربية (345+ keys)
│   ├── <b>tr.ts</b>              #  Türkçe (345+ keys)
│   └── <b>ru.ts</b>              #  Русский (345+ keys)
├── <b>telegram.ts</b>           #  Telegram API client — retry, chunking, uploads
├── <b>constants.ts</b>          #  Shared constants (rate limits, RAG, Piston, etc.)
├── <b>model-config.ts</b>       #  Model registry, capabilities, cost config
├── <b>types/</b>
│   ├── <b>env.d.ts</b>           #  Env interface, Telegram types, UserSettings
│   └── <b>d1.ts</b>              #  D1 row type definitions
├── <b>handlers/</b>
│   ├── <b>message.ts</b>        #  Message classifier + AI response pipeline
│   ├── <b>command.ts</b>        #  All /slash command implementations
│   ├── <b>callback.ts</b>       #  Inline keyboard callback routing
│   ├── <b>admin.ts</b>          #  Admin panel (stats, broadcast, blocks, cleanup)
│   ├── <b>session.ts</b>        #  Multi-session management
│   ├── <b>persona.ts</b>        #  Custom persona creation
│   ├── <b>daily.ts</b>          #  Daily tips cron handler
│   ├── <b>reminder.ts</b>       #  Reminder wizard + cron processing
│   ├── <b>debate.ts</b>         #  Multi-agent debate wizard
│   ├── <b>inline.ts</b>         #  Inline query handler
│   ├── <b>adapt.ts</b>          #  /adapt & /adapt reset commands
│   └── <b>workflow.ts</b>       #  /workflow command (create/list/view/run/delete)
├── <b>menus/</b>
│   ├── <b>modeMenu.ts</b>       #  Dynamic persona/model/language/keyboard menus
│   ├── <b>debateMenu.ts</b>     #  Debate flow keyboard menus
│   └── <b>reminderMenu.ts</b>   #  Date/time/recurrence picker keyboards
├── <b>modes/</b>
│   ├── <b>types.ts</b>          #  Mode system type definitions
│   ├── <b>registry.ts</b>       #  Mode registry & Lookup
│   ├── <b>exam.ts</b>           #  Exam mode implementation
│   ├── <b>quiz.ts</b>           #  Quiz mode (6 categories, streak tracking)
│   ├── <b>teacher.ts</b>        #  Teacher mode (3 levels, auto‑lessons)
│   └── <b>brainstorm.ts</b>     #  Brainstorm mode (expand/categorize/evaluate/combine)
├── <b>parsers/</b>
│   └── <b>htmlParser.ts</b>     #  Markdown → Telegram HTML converter
├── <b>repositories/</b>
│   ├── <b>settings.repo.ts</b>  #  User settings + migrations (v1–v28)
│   ├── <b>chat.repo.ts</b>      #  Chat history + group messages
│   ├── <b>admin.repo.ts</b>     #  Rate limiting, blocks, analytics, timing
│   ├── <b>cache.ts</b>          #  DB cache layer (KV-backed TTL cache)
│   ├── <b>persona.repo.ts</b>   #  Custom personas + adaptation feedback
│   ├── <b>debate.repo.ts</b>    #  Debate sessions + messages
│   ├── <b>reminder.repo.ts</b>  #  Reminders CRUD
│   ├── <b>documents.repo.ts</b> #  RAG document storage & search
│   ├── <b>memory.repo.ts</b>    #  Memory summaries storage
│   ├── <b>media.repo.ts</b>     #  Media metadata (photos, docs, voice, etc.)
│   ├── <b>embeddings.repo.ts</b> #  Vector embeddings for RAG
│   └── <b>workflow.repo.ts</b>  #  Workflow CRUD
├── <b>services/</b>
│   ├── <b>index.ts</b>          #  Centralized service-layer re-exports
│   ├── <b>settings.service.ts</b>  #  User settings business logic
│   ├── <b>debate.service.ts</b>    #  Debate orchestration logic
│   ├── <b>ensemble.service.ts</b>  #  Parallel model query + judge selection
│   ├── <b>persona-adaptive.service.ts</b>  #  AI trait extraction from feedback
│   ├── <b>router.service.ts</b>  #  Message classifier → model routing
│   ├── <b>rag.service.ts</b>     #  Text chunking, indexing, retrieval
│   ├── <b>sandbox.service.ts</b> #  Piston API code execution (20 languages)
│   ├── <b>memory.service.ts</b>  #  AI summarization & context recall
│   ├── <b>media-pipeline.service.ts</b>  #  Multi-modal media processing & output
│   └── <b>workflow.service.ts</b>  #  Workflow execution engine
└── <b>utils/</b>
    ├── <b>logger.ts</b>         #  Structured JSON logging with request IDs
    ├── <b>mutex.ts</b>          #  D1‑based mutex for race condition prevention
    ├── <b>cache.ts</b>          #  3‑tier KV cache (KV → in‑memory → DB), response/search/response caches
    ├── <b>error.ts</b>          #  AppError hierarchy, safe/retry wrappers
    ├── <b>file.ts</b>           #  Telegram file download, PDF text extraction
    ├── <b>media.ts</b>          #  Photo/document/voice/sticker/video_note/location/contact handlers
    ├── <b>validate.ts</b>       #  Input validation helpers
    └── <b>occasions.ts</b>      #  Holiday/occasion calendar for daily tips

<b>tools/</b>
├── <b>types.ts</b>              #  ToolDefinition & ToolCall types, [TOOL_CALL] markers
├── <b>registry.ts</b>           #  Tool registration, parsing, execution
├── <b>index.ts</b>              #  Tool initialization & re‑exports
└── <b>builtins/</b>
    ├── <b>weather.ts</b>        #  Weather tool (Open‑Meteo, no API key needed)
    ├── <b>calculator.ts</b>     #  Math calculator tool
    ├── <b>time.ts</b>           #  Timezone / world clock tool
    ├── <b>define.ts</b>         #  Dictionary tool
    ├── <b>crypto.ts</b>         #  Cryptocurrency price tool
    └── <b>news.ts</b>           #  News headlines tool (NEWS_API_KEY)

<b>config/</b>
├── <b>personas.ts</b>           #  68 persona definitions (5 languages each)
└── <b>persona-emojis.ts</b>     #  Emoji mappings for persona thinking states

<b>tests/</b>
├── <b>unit/</b>                 #  164 unit tests (all modules)
└── <b>integration/</b>          #  9 integration tests (webhook flow)
</pre>

</details>

---

<h2>🧪 Local Development</h2>

<table>
  <tr>
    <th>Command</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>npm install</code></td>
    <td>Install dependencies</td>
  </tr>
  <tr>
    <td><code>npm run typecheck</code></td>
    <td><code>tsc --noEmit</code> — zero errors</td>
  </tr>
  <tr>
    <td><code>npm test</code></td>
    <td><code>vitest --run</code> — 173 tests</td>
  </tr>
  <tr>
    <td><code>npm run test:watch</code></td>
    <td><code>vitest</code> — watch mode</td>
  </tr>
  <tr>
    <td><code>npm run build</code></td>
    <td><code>esbuild</code> → <code>dist/worker.bundle.js</code></td>
  </tr>
  <tr>
    <td><code>npm run lint</code></td>
    <td>ESLint (tests) + tsc (src)</td>
  </tr>
  <tr>
    <td><code>npm run format</code></td>
    <td>Prettier — write all</td>
  </tr>
  <tr>
    <td><code>npx wrangler dev --remote</code></td>
    <td>Local dev server (remote bindings)</td>
  </tr>
</table>

<br/>

<h3>Local Webhook Testing</h3>

<pre>
npx wrangler dev --remote           # http://localhost:8787
ngrok http 8787                     # public HTTPS URL
curl http://localhost:8787/setWebhook
</pre>

---

<h2>📊 Project Status</h2>

<table>
  <tr>
    <th>Phase</th>
    <th>Description</th>
    <th align="center">Status</th>
  </tr>
  <tr>
    <td>1</td>
    <td>JS → TypeScript migration, tsconfig, CI pipeline</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>2</td>
    <td>Full type annotations — <code>noImplicitAny: true</code>, 0 tsc errors</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>3</td>
    <td>D1 indexes, auto‑cleanup, integration tests (173 total)</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>4</td>
    <td>Inline mode, TTS, streaming responses, group reply fix, Multi‑Agent Collaboration (<code>/debate</code>)</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>5</td>
    <td>9 image models, Daily Tips (AI cron + occasion calendar), Reminder System (date/time picker, recurrence, notification)</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>6</td>
    <td>Ensemble Voting — parallel 3-model query + judge/random strategy</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>7</td>
    <td>Adaptive Persona — AI extracts traits from user feedback over time</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>8</td>
    <td>Auto-Routing — message classifier routes to best-fit model</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>9</td>
    <td>RAG Knowledge Base — <code>/learn</code> + <code>/forget</code>, LIKE-based retrieval</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>10</td>
    <td>Code Sandbox — <code>/run</code> in 20 languages via Piston API</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>11</td>
    <td>AI Memory — automatic conversation summarization & context recall</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>12</td>
    <td>Multi-modal — sticker, video_note, location, contact support</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>13</td>
    <td>Analytics — per-user response timing & tracking</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>14</td>
    <td>Performance — instrumentation around streaming + input hardening</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>15</td>
    <td>Tool‑Use (Function Calling) — weather, calculator, dictionary, crypto, news, timezone with ReAct loop</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>16</td>
    <td>Multi‑modal Pipeline — media metadata storage, [GENERATE_IMAGE] & [GENERATE_SPEECH] output, edited_message support</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>17</td>
    <td>Prompt Chains / Workflows — create/list/view/run/delete with variable substitution</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>18</td>
    <td>Modes — Quiz (6 categories), Teacher (3 levels), Brainstorm (expand/categorize/evaluate/combine)</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>19</td>
    <td>Adaptive Persona v2 — 5‑trait structured analysis, `/adapt` profile visualization</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>20</td>
    <td>Vector RAG — embedding‑based semantic search with cosine similarity scoring</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>21</td>
    <td>KV Cache Layer — 3‑tier caching (KV → in‑memory → DB), optional KV_CACHE binding</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>22</td>
    <td>Message Mutex — D1‑based lock prevents concurrent processing race conditions</td>
    <td align="center">✅</td>
  </tr>
</table>

---

<h2>🤝 Contributing</h2>

<ol>
  <li>Fork the repository</li>
  <li>Create a feature branch: <code>git checkout -b feature/your-idea</code></li>
  <li>Commit changes: <code>git commit -m 'Add feature X'</code></li>
  <li>Push: <code>git push origin feature/your-idea</code></li>
  <li>Open a Pull Request</li>
</ol>

<p>Please ensure:</p>
<ul>
  <li>✅ <code>npm run typecheck</code> passes (zero tsc errors)</li>
  <li>✅ <code>npm test</code> passes (all 173 tests)</li>
  <li>✅ Code follows existing patterns (fully typed, no runtime changes)</li>
  <li>✅ Update <code>README.md</code> if adding features</li>
</ul>

---

<h2>📄 License</h2>

<p>
  <a href="LICENSE">MIT</a> — use freely, modify, and share.
</p>

<br/>

<div align="center">
  <sub>
    Built with ⚡ on <a href="https://workers.cloudflare.com/">Cloudflare Workers</a> ·
    Powered by <a href="https://developers.cloudflare.com/workers-ai/">Workers AI</a> ·
    Stored in <a href="https://developers.cloudflare.com/d1/">D1 Database</a>
  </sub>
  <br/><br/>
  <sub>
    <a href="https://github.com/RealClickClick/worker-ai-chatbot">GitHub</a> ·
    <a href="https://t.me/botfather">@BotFather</a> ·
    <a href="https://dash.cloudflare.com/">Cloudflare Dashboard</a>
  </sub>
</div>
