<div align="center">
  <br/>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/🤖_AI_Telegram_Bot-v2.2.0-22C55E?style=for-the-badge&labelColor=1a1a2e&color=00d4aa">
    <img alt="بوت تليغرام للذكاء الاصطناعي" src="https://img.shields.io/badge/🤖_AI_Telegram_Bot-v2.2.0-22C55E?style=for-the-badge&labelColor=f0f0f0&color=00d4aa" height="40">
  </picture>

  <br/><br/>

  <p><strong>بدون خادم • آمن من حيث الأنواع • متعدد اللغات • ٦٨ شخصية • RAG • بيئة تشغيل الكود</strong></p>

  <p>
    مساعد ذكاء اصطناعي من الدرجة الإنتاجية لتليغرام يعمل بالكامل على Cloudflare Workers.<br/>
    مدعوم من Workers AI — موزع عالميًا، بدون بدء بارد، مكتوب بالكامل بالأنواع.
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
    <a href="#"><img src="https://img.shields.io/badge/tests-173_passing-22C55E?style=flat-square&logo=vitest&logoColor=white" alt="١٧٣ اختبارًا ناجحًا"/></a>
    <a href="#"><img src="https://img.shields.io/badge/coverage-87%25-22C55E?style=flat-square&logo=istanbul&logoColor=white" alt="تغطية ٨٧٪"/></a>
    <a href="#"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="رخصة MIT"/></a>
    <a href="#"><img src="https://img.shields.io/badge/bundle-487_kB-FF6B6B?style=flat-square&logo=esbuild&logoColor=white" alt="حجم الحزمة ٣٧١ كيلوبايت"/></a>
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

<h2>📋 جدول المحتويات</h2>

<p>
  <a href="#-features">الميزات</a> •
  <a href="#-quick-start">البداية السريعة</a> •
  <a href="#-commands">الأوامر</a> •
  <a href="#-ai-models">نماذج الذكاء الاصطناعي</a> •
  <a href="#-personas">الشخصيات</a> •
  <a href="#-architecture">البنية</a> •
  <a href="#-group-context-system">سياق المجموعة</a> •
  <a href="#-configuration">الإعدادات</a> •
  <a href="#-api-endpoints">API</a> •
  <a href="#-project-structure">الهيكل</a> •
  <a href="#-local-development">التطوير</a>
</p>

---

<h2>✨ الميزات</h2>

<table>
  <tr>
    <td align="center" width="14%">💬</td>
    <td width="36%"><strong>الدردشة بالذكاء الاصطناعي</strong><br/><sub>يدرك السياق مع ١٠ نماذج قابلة للاختيار</sub></td>
    <td align="center" width="14%">🎭</td>
    <td width="36%"><strong>٦٨ شخصية</strong><br/><sub>٩ فئات + غير محدودة مخصصة</sub></td>
  </tr>
  <tr>
    <td align="center">🖼️</td>
    <td><strong>توليد الصور</strong><br/><sub>٩ نماذج: SDXL, Flux, Lightning, Lucid, FLUX.2 Klein 4B/9B, Phoenix, Dreamshaper</sub></td>
    <td align="center">👁️</td>
    <td><strong>فهم الصور</strong><br/><sub>الذكاء الاصطناعي يصف أي صورة</sub></td>
  </tr>
  <tr>
    <td align="center">🌐</td>
    <td><strong>البحث على الويب</strong><br/><sub>مدعوم من Brave Search API</sub></td>
    <td align="center">🔗</td>
    <td><strong>تصفح الويب</strong><br/><sub>جلب وتلخيص أي رابط</sub></td>
  </tr>
  <tr>
    <td align="center">📄</td>
    <td><strong>قراءة الملفات</strong><br/><sub>تحليل PDF، TXT، DOC مباشر</sub></td>
    <td align="center">🎙️</td>
    <td><strong>النسخ الصوتي</strong><br/><sub>مدعوم من Whisper</sub></td>
  </tr>
  <tr>
    <td align="center">🗂️</td>
    <td><strong>جلسات متعددة</strong><br/><sub>محادثات مستقلة</sub></td>
    <td align="center">📤</td>
    <td><strong>التصدير</strong><br/><sub>تنزيل السجل بصيغة .txt</sub></td>
  </tr>
  <tr>
    <td align="center">🌍</td>
    <td><strong>٥ لغات</strong><br/><sub>EN · FA · AR · TR · RU</sub></td>
    <td align="center">👍</td>
    <td><strong>أزرار التقييم</strong><br/><sub>تتبع الجودة لكل رد</sub></td>
  </tr>
  <tr>
    <td align="center">🛡️</td>
    <td><strong>تحديد المعدل</strong><br/><sub>تحديد لكل مستخدم + فترة تبريد</sub></td>
    <td align="center">🛠️</td>
    <td><strong>لوحة الإدارة</strong><br/><sub>بث، إحصائيات، حظر، تنظيف</sub></td>
  </tr>
  <tr>
    <td align="center">📊</td>
    <td><strong>التحليلات</strong><br/><sub>مقاييس الاستخدام + المستخدمون النشطون</sub></td>
    <td align="center">🧹</td>
    <td><strong>التنظيف التلقائي</strong><br/><sub>تدوير البيانات القديمة تلقائيًا</sub></td>
  </tr>
  <tr>
    <td align="center">👥</td>
    <td><strong>محرك سياق المجموعة</strong><br/><sub>نوافذ 50 رسالة لكل مستخدم + تتبع الردود</sub></td>
    <td align="center">🧵</td>
    <td><strong>الوعي بالتسلسل</strong><br/><sub>حل كامل لسلسلة الردود حتى 5 مستويات عمق</sub></td>
  </tr>
  <tr>
    <td align="center">@</td>
    <td><strong>الوضع المضمن</strong><br/><sub>اكتب <code>@bot query</code> في أي محادثة</sub></td>
    <td align="center">🔊</td>
    <td><strong>نص إلى كلام</strong><br/><sub>Melo TTS مع دعم 5 لغات</sub></td>
  </tr>
  <tr>
    <td align="center">⚡</td>
    <td><strong>الاستجابات المتدفقة</strong><br/><sub>نص فوري أثناء تفكير AI</sub></td>
    <td align="center">🎭</td>
    <td><strong>التعاون متعدد العوامل</strong><br/><sub><code>/debate</code> شخصيتان تناقشان أي موضوع</sub></td>
  </tr>
  <tr>
    <td align="center">📅</td>
    <td><strong>النصائح اليومية</strong><br/><sub>تحية صباحية ذكية مع مناسبات اليوم</sub></td>
    <td align="center">⏰</td>
    <td><strong>نظام التذكير</strong><br/><sub>تذكيرات مخصصة مع منتقي التاريخ/الوقت والتكرار</sub></td>
  </tr>
  <tr>
    <td align="center">🗳️</td>
    <td><strong>التصويت الجماعي</strong><br/><sub>استعلام ٣ نماذج بالتوازي، اختيار الأفضل عبر الحكم</sub></td>
    <td align="center">🧠</td>
    <td><strong>الشخصية التكيفية</strong><br/><sub>AI يتعلم سمات المستخدم من التعليقات</sub></td>
  </tr>
  <tr>
    <td align="center">🧭</td>
    <td><strong>التوجيه التلقائي</strong><br/><sub>تصنيف الرسائل → توجيه لأفضل نموذج</sub></td>
    <td align="center">📚</td>
    <td><strong>RAG</strong><br/><sub><code>/learn</code> + <code>/forget</code> قاعدة معرفة شخصية</sub></td>
  </tr>
  <tr>
    <td align="center">💻</td>
    <td><strong>بيئة تشغيل الكود</strong><br/><sub><code>/run</code> في ٢٠ لغة عبر Piston API</sub></td>
    <td align="center">🧵</td>
    <td><strong>ذاكرة AI</strong><br/><sub>تلخيص المحادثات التلقائي واستدعاء السياق</sub></td>
  </tr>
  <tr>
    <td align="center">📊</td>
    <td><strong>توقيت المستخدم</strong><br/><sub>تحليل وقت الاستجابة لكل مستخدم</sub></td>
    <td align="center">🛡️</td>
    <td><strong>تقوية الإدخال</strong><br/><sub>حد ١٠k حرف، تسجيل منظم</sub></td>
  </tr>
  <tr>
    <td align="center">🏷️</td>
    <td><strong>ملصق / موقع / جهة اتصال</strong><br/><sub>دعم أنواع الرسائل متعددة الوسائط</sub></td>
    <td align="center"></td>
    <td></td>
  </tr>
</table>

---

<h2>🚀 البداية السريعة</h2>

<h3>المتطلبات الأساسية</h3>

<table>
  <tr>
    <td>☁️</td>
    <td><a href="https://dash.cloudflare.com/">حساب Cloudflare</a></td>
  </tr>
  <tr>
    <td>🤖</td>
    <td><a href="https://t.me/botfather">رمز بوت تليغرام</a> من @BotFather</td>
  </tr>
  <tr>
    <td>📦</td>
    <td><a href="https://nodejs.org/">Node.js</a> ١٨+ (نشر CLI فقط)</td>
  </tr>
</table>

<br/>

<h3>انشر في ٣ دقائق</h3>

<table>
  <tr>
    <th>الخطوة</th>
    <th>الأمر</th>
    <th>الوصف</th>
  </tr>
  <tr>
    <td>١</td>
    <td><code>git clone https://github.com/RealClickClick/worker-ai-chatbot.git && cd worker-ai-chatbot && npm install</code></td>
    <td>استنساخ وتثبيت</td>
  </tr>
  <tr>
    <td>٢</td>
    <td><code>npx wrangler d1 create ai-telegram-bot-db</code></td>
    <td>إنشاء قاعدة D1 → <b>انسخ المعرف في <code>wrangler.toml</code></b></td>
  </tr>
  <tr>
    <td>٣</td>
    <td>
      <code>npx wrangler secret put TELEGRAM_BOT_TOKEN</code><br/>
      <code>npx wrangler secret put BRAVE_API_KEY</code>  <i>(اختياري)</i><br/>
      <code>npx wrangler secret put GOOGLE_GEMINI_API_KEY</code>  <i>(اختياري)</i><br/>
      <code>npx wrangler secret put WEBHOOK_SECRET</code> <i>(اختياري)</i><br/>
      <code>npx wrangler secret put ADMIN_IDS</code>     <i>(اختياري)</i>
    </td>
    <td>تعيين الأسرار</td>
  </tr>
  <tr>
    <td>٤</td>
    <td><code>npx wrangler deploy</code></td>
    <td>النشر على Cloudflare</td>
  </tr>
</table>

<br/>

<details>
<summary><strong>☁️ بديل: لوحة تحكم Cloudflare (لا يتطلب أدوات سطر أوامر)</strong></summary>

<br/>

1. اذهب إلى [لوحة تحكم Cloudflare](https://dash.cloudflare.com/) → **Workers & Pages** → **Create Application** → **Create Worker**

   ![الخطوة ١: إنشاء التطبيق](docs/setup-screenshots/01-create-application.png)

2. احتفظ بالقالب الافتراضي **"Hello World"** وانقر **Deploy**

   ![الخطوة ٢: البدء مع Hello World](docs/setup-screenshots/02-start-hello-world.png)
   ![الخطوة ٣: النشر](docs/setup-screenshots/03-deploy-hello-world.png)

3. في لوحة تحكم worker، انقر **Edit code**

   ![الخطوة ٤: تعديل الكود في لوحة التحكم](docs/setup-screenshots/04-dashboard-edit-code.png)

4. حدد كل كود Hello World الافتراضي → الصق محتوى [`dist/worker.bundle.js`](dist/worker.bundle.js) → انقر **Save and Deploy**

   ![الخطوة ٥: لصق الكود والنشر](docs/setup-screenshots/05-paste-code-deploy.png)

5. اذهب إلى **Settings → Variables and Secrets** ← **Add** لإضافة متغيرات البيئة هذه:

   - `TELEGRAM_BOT_TOKEN` — رمز البوت من [@BotFather](https://t.me/BotFather)
   - `WORKER_DOMAIN` — `your-worker-name.your-subdomain.workers.dev`
   - `ADMIN_IDS` — معرف مستخدم تليغرام الخاص بك (اختياري)
   - `BRAVE_API_KEY` — للبحث على الويب (اختياري)
   - `GOOGLE_GEMINI_API_KEY` — لنماذج Gemini (اختياري)
   - `WEBHOOK_SECRET` — للتحقق من webhook (اختياري)
   - `BOT_NAME` — اسم مخصص للبوت (اختياري)
   - `BOT_DESCRIPTION` — تعليمات إضافية للنظام (اختياري)

   ![الخطوة ٦: إعدادات المتغيرات](docs/setup-screenshots/06-settings-variables.png)
   ![الخطوة ٧: إضافة رمز تليغرام](docs/setup-screenshots/07-add-telegram-token.png)
   ![الخطوة ٨: إضافة نطاق Worker](docs/setup-screenshots/08-add-worker-domain.png)

6. اذهب إلى **Workers & Pages** → العامل الخاص بك → **Settings** → **Bindings** → **Add binding** → اختر **D1 Database** → سمِّه `DB`

   ![الخطوة ٩: إضافة binding](docs/setup-screenshots/09-bindings-add-binding.png)
   ![الخطوة ١٠: إضافة D1 Database](docs/setup-screenshots/10-add-d1-database.png)

7. اذهب إلى **Bindings** → **Add binding** → اختر **Workers AI** → سمِّه `AI`

   ![الخطوة ١١: إضافة Workers AI](docs/setup-screenshots/11-add-workers-ai.png)
   ![الخطوة ١٢: تكوين AI Binding](docs/setup-screenshots/12-configure-ai-binding.png)

8. زر `https://your-worker.workers.dev/init` — ينشئ جميع جداول قاعدة البيانات

   ![الخطوة ١٣: تهيئة قاعدة البيانات](docs/setup-screenshots/13-init-database.png)

9. زر `https://your-worker.workers.dev/setWebhook` — يسجل رابط webhook مع تلغرام

   ![الخطوة ١٤: تعيين webhook](docs/setup-screenshots/14-set-webhook.png)

</details>

<br/>

<h3>بعد النشر</h3>

<table>
  <tr>
    <th>نقطة النهاية</th>
    <th>الغرض</th>
  </tr>
  <tr>
    <td><code>https://your-worker.workers.dev/init</code></td>
    <td>تهيئة جداول قاعدة البيانات وتشغيل الترحيلات</td>
  </tr>
  <tr>
    <td><code>https://your-worker.workers.dev/setWebhook</code></td>
    <td>تسجيل رابط webhook مع تليغرام</td>
  </tr>
</table>

> ✅ **تم.** البوت الخاص بك نشط — لا حاجة لإعدادات إضافية.

---

<h2>🎮 الأوامر</h2>

<table>
  <tr>
    <th>الأمر</th>
    <th>الوسائط</th>
    <th>الوصف</th>
  </tr>
  <tr>
    <td><code>/start</code></td>
    <td>—</td>
    <td>رسالة ترحيب مع قائمة الإعدادات</td>
  </tr>
  <tr>
    <td><code>/help</code></td>
    <td>—</td>
    <td>مرجع كامل للأوامر</td>
  </tr>
  <tr>
    <td><code>/mode</code></td>
    <td>—</td>
    <td>فتح اختيار الشخصية والإعدادات</td>
  </tr>
  <tr>
    <td><code>/model</code></td>
    <td>—</td>
    <td>تبديل نموذج الذكاء الاصطناعي</td>
  </tr>
  <tr>
    <td><code>/lang</code></td>
    <td>—</td>
    <td>تغيير اللغة</td>
  </tr>
  <tr>
    <td><code>/image</code></td>
    <td><code>&lt;prompt&gt;</code></td>
    <td>توليد صورة</td>
  </tr>
  <tr>
    <td><code>/search</code></td>
    <td><code>&lt;query&gt;</code></td>
    <td>البحث على الويب عبر Brave</td>
  </tr>
  <tr>
    <td><code>/translate</code></td>
    <td><code>&lt;text&gt;</code></td>
    <td>الترجمة إلى اللغة الحالية</td>
  </tr>
  <tr>
    <td><code>/summarize</code></td>
    <td>—</td>
    <td>تلخيص المحادثة الأخيرة</td>
  </tr>
  <tr>
    <td><code>/instructions</code></td>
    <td><code>&lt;text&gt;</code> · <code>reset</code></td>
    <td>تعيين سلوك مخصص للذكاء الاصطناعي</td>
  </tr>
  <tr>
    <td><code>/newpersona</code></td>
    <td><code>Name \| Desc</code> · <code>list</code> · <code>del &lt;n&gt;</code></td>
    <td>إنشاء / إدارة الشخصيات المخصصة</td>
  </tr>
  <tr>
    <td><code>/session</code></td>
    <td><code>new &lt;n&gt;</code> · <code>&lt;id&gt;</code> · <code>list</code> · <code>rename</code> · <code>del</code></td>
    <td>إدارة الجلسات المتعددة</td>
  </tr>
  <tr>
    <td><code>/export</code></td>
    <td>—</td>
    <td>تنزيل المحادثة بصيغة <code>.txt</code></td>
  </tr>
  <tr>
    <td><code>/clear</code></td>
    <td>—</td>
    <td>إعادة ضبط الذاكرة والإعدادات والجلسات</td>
  </tr>
  <tr>
    <td><code>/stats</code></td>
    <td>—</td>
    <td>عرض الملف الشخصي والاستخدام الحالي</td>
  </tr>
  <tr>
    <td><code>/tts</code></td>
    <td><code>&lt;text&gt;</code></td>
    <td>تحويل النص إلى كلام (فارسي، إنجليزي، عربي، تركي، روسي)</td>
  </tr>
  <tr>
    <td><code>/debate</code></td>
    <td><code>&lt;topic&gt;</code></td>
    <td>بدء مناظرة متعددة العوامل بين شخصيتين</td>
  </tr>
  <tr>
    <td><code>/daily</code></td>
    <td>—</td>
    <td>تشغيل/إيقاف النصائح اليومية</td>
  </tr>
  <tr>
    <td><code>/remind</code></td>
    <td>—</td>
    <td>إنشاء تذكير جديد (٤ خطوات: العنوان ← التاريخ ← الوقت ← التكرار)</td>
  </tr>
  <tr>
    <td><code>/reminders</code></td>
    <td>—</td>
    <td>عرض وإدارة التذكيرات النشطة</td>
  </tr>
  <tr>
    <td><code>/cancel</code></td>
    <td>—</td>
    <td>إلغاء إنشاء التذكير</td>
  </tr>
  <tr>
    <td><code>/learn</code></td>
    <td><code>&lt;text&gt;</code></td>
    <td>تعليم البوت — حفظ في قاعدة المعرفة الشخصية (RAG)</td>
  </tr>
  <tr>
    <td><code>/forget</code></td>
    <td>—</td>
    <td>مسح المعرفة المخزنة</td>
  </tr>
  <tr>
    <td><code>/run</code></td>
    <td><code>&lt;lang&gt; &lt;code&gt;</code></td>
    <td>تشغيل الكود في ٢٠ لغة عبر Piston API</td>
  </tr>
  <tr>
    <td><code>/feedback</code></td>
    <td><code>&lt;message&gt;</code></td>
    <td>إرسال ملاحظات</td>
  </tr>
  <tr>
    <td><code>/admin</code></td>
    <td><code>stats</code> · <code>broadcast</code> · <code>block</code> · <code>unblock</code> · <code>blocked</code> · <code>cleanup</code></td>
    <td>لوحة الإدارة <sub>(مقيد)</sub></td>
  </tr>
</table>

---

<h2>🤖 نماذج الذكاء الاصطناعي</h2>

<table>
  <tr>
    <th></th>
    <th>المفتاح</th>
    <th>معرف النموذج</th>
    <th>المعاملات</th>
    <th>الرؤية</th>
    <th>الأفضل لـ</th>
  </tr>
  <tr>
    <td>⚡</td>
    <td><code>fast</code></td>
    <td><code>@cf/meta/llama-3.1-8b-instruct-fast</code></td>
    <td>8B</td>
    <td align="center">—</td>
    <td>إنتاجية عالية، ردود سريعة</td>
  </tr>
  <tr>
    <td>⚖️</td>
    <td><code>balanced</code></td>
    <td><code>@cf/deepseek-ai/deepseek-r1-distill-qwen-32b</code></td>
    <td>32B</td>
    <td align="center">—</td>
    <td>للأغراض العامة، توازن الجودة/السرعة</td>
  </tr>
  <tr>
    <td>🧠</td>
    <td><code>powerful</code></td>
    <td><code>@cf/meta/llama-3.3-70b-instruct-fp8-fast</code></td>
    <td>70B</td>
    <td align="center">—</td>
    <td>التفكير المعقد، التحليل العميق</td>
  </tr>
  <tr>
    <td>🇨🇳</td>
    <td><code>glm</code></td>
    <td><code>@cf/zai-org/glm-4.7-flash</code></td>
    <td>—</td>
    <td align="center">—</td>
    <td>متعدد اللغات، استدلال سريع</td>
  </tr>
  <tr>
    <td>👁️</td>
    <td><code>vision</code></td>
    <td><code>@cf/meta/llama-3.2-11b-vision-instruct</code></td>
    <td>11B</td>
    <td align="center">✅</td>
    <td>فهم الصور ووصفها</td>
  </tr>
  <tr>
    <td>🦙</td>
    <td><code>llama4</code></td>
    <td><code>@cf/meta/llama-4-scout-17b-16e-instruct</code></td>
    <td>17B</td>
    <td align="center">—</td>
    <td>أحدث جيل MoE</td>
  </tr>
  <tr>
    <td>🔬</td>
    <td><code>gemma4</code></td>
    <td><code>@cf/google/gemma-4-26b-a4b-it</code></td>
    <td>26B</td>
    <td align="center">—</td>
    <td>مضغوط، فعال</td>
  </tr>
  <tr>
    <td>💻</td>
    <td><code>qwen_coder</code></td>
    <td><code>@cf/qwen/qwen2.5-coder-32b-instruct</code></td>
    <td>32B</td>
    <td align="center">—</td>
    <td>توليد الكود والمهام التقنية</td>
  </tr>
  <tr>
    <td>✨</td>
    <td><code>gemini_flash</code></td>
    <td><code>gemini-2.5-flash</code></td>
    <td>—</td>
    <td align="center">—</td>
    <td>سريع وفعال من حيث التكلفة (عبر API جوجل)</td>
  </tr>
  <tr>
    <td>✨</td>
    <td><code>gemini_flash_3</code></td>
    <td><code>gemini-3-flash</code></td>
    <td>—</td>
    <td align="center">—</td>
    <td>أحدث Gemini، متعدد الوسائط (عبر API جوجل)</td>
  </tr>
</table>

<br/>

<h3>نماذج توليد الصور</h3>

<table>
  <tr>
    <th></th>
    <th>المفتاح</th>
    <th>معرف النموذج</th>
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

<h2>🎭 الشخصيات</h2>

<p>
  <strong>٦٨ شخصية</strong> عبر <strong>٩ فئات</strong> — كل منها موصوفة بالكامل بـ ٥ لغات.<br/>
  اختر عبر <code>/mode</code> أو أنشئ شخصيتك الخاصة بـ <code>/newpersona الاسم | الوصف</code>.
</p>

<br/>

<table>
  <tr>
    <th>الفئة</th>
    <th align="center">#</th>
    <th>الشخصيات</th>
  </tr>
  <tr>
    <td>💼 الأعمال والقانون</td>
    <td align="center">٨</td>
    <td>محامٍ، مدير تنفيذي، محاسب، مسوق، رائد أعمال، مستثمر، مستشار، مدير موارد بشرية</td>
  </tr>
  <tr>
    <td>💻 العلوم والتقنية</td>
    <td align="center">٨</td>
    <td>هاكر، مطور، عالم بيانات، أمن سيبراني، فيزيائي، كيميائي، عالم فلك، عالم رياضيات</td>
  </tr>
  <tr>
    <td>🏥 الصحة والعافية</td>
    <td align="center">٦</td>
    <td>طبيب، معالج، أخصائي تغذية، طبيب نفسي، مدرب، يوغي</td>
  </tr>
  <tr>
    <td>🎨 الفنون والثقافة</td>
    <td align="center">٨</td>
    <td>شاعر، كاتب، موسيقي، رسام، مصمم، مهندس معماري، صانع أفلام، مصور</td>
  </tr>
  <tr>
    <td>🌍 الخيال والمغامرة</td>
    <td align="center">٨</td>
    <td>ساحر، فارس، قرصان، كائن فضائي، مصاص دماء، قزم، تنين، ساحرة</td>
  </tr>
  <tr>
    <td>🎭 الشخصية والفكاهة</td>
    <td align="center">١٠</td>
    <td>وحشي، مكتئب، محفز، كارين، مهووس، الجيل Z، جد، رومانسي، كوميدي، تآمري</td>
  </tr>
  <tr>
    <td>🐾 الحيوانات والطبيعة</td>
    <td align="center">٦</td>
    <td>قطة، كلب، أسد، بومة، دولفين، باندا</td>
  </tr>
  <tr>
    <td>👑 التاريخ والمجتمع</td>
    <td align="center">٨</td>
    <td>ملك، ملكة، ساموراي، مستكشف، محقق، جاسوس، صحفي، فيلسوف</td>
  </tr>
  <tr>
    <td>🙏 الروحانيات والتصوف</td>
    <td align="center">٦</td>
    <td>راهب، نبي، شامان، عراف، صوفي، حكيم</td>
  </tr>
</table>

---

<h2>🏗️ البنية</h2>

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

<h3>تدفق البيانات</h3>

<pre>
  ① Telegram → POST /  (verified via secret_token)
  ② index.ts → parse JSON, validate payload
  ③ message.ts → classify: text / photo / voice / file / URL / command
  ④ db.ts → load user settings (persona, model, session, language)
  ⑤ ai.ts → build system prompt + retrieve recent chat history
  ⑥ Workers AI → run inference (LLM / vision / Whisper / SDXL)
  ⑦ htmlParser.ts → convert Markdown → Telegram HTML
  ⑧ telegram.ts → send formatted response + feedback buttons
  ⑨ db.ts → persist user message + AI response to D1
</pre>

<h3>الرصة التقنية</h3>

<table>
  <tr>
    <th>الطبقة</th>
    <th>التقنية</th>
    <th>لماذا</th>
  </tr>
  <tr>
    <td>⚡ وقت التشغيل</td>
    <td><a href="https://workers.cloudflare.com/">Cloudflare Workers</a></td>
    <td>حوسبة حافة عالمية، بدون بدء بارد (ES2022)</td>
  </tr>
  <tr>
    <td>📝 اللغة</td>
    <td><a href="https://www.typescriptlang.org/">TypeScript</a> 5.7</td>
    <td>مكتوب بالكامل بالأنواع — <code>noImplicitAny</code> مفعل، ٠ أخطاء tsc</td>
  </tr>
  <tr>
    <td>📦 أداة التجميع</td>
    <td><a href="https://esbuild.github.io/">esbuild</a></td>
    <td>بناء فوري، مخرج مضغوط ٣٠٥ kB</td>
  </tr>
  <tr>
    <td>🗄️ قاعدة البيانات</td>
    <td><a href="https://developers.cloudflare.com/d1/">D1 (SQLite)</a></td>
    <td>ترحيل تلقائي، ٣ فهارس، تنظيف تلقائي للبيانات القديمة</td>
  </tr>
  <tr>
    <td>🤖 الذكاء الاصطناعي</td>
    <td><a href="https://developers.cloudflare.com/workers-ai/">Workers AI</a></td>
    <td>١٠ نماذج محادثة + ٥ نماذج صور + Whisper</td>
  </tr>
  <tr>
    <td>🧪 الاختبارات</td>
    <td><a href="https://vitest.dev/">Vitest</a></td>
    <td>١٧٣ اختبارًا (وحدة + تدفق webhook تكاملي)</td>
  </tr>
  <tr>
    <td>🔍 التحليل البرمجي</td>
    <td>ESLint (اختبارات) + <code>tsc --noEmit</code> (مصدر)</td>
    <td>فصل الاهتمامات — أمان الأنواع + جودة الكود</td>
  </tr>
  <tr>
    <td>🎨 التنسيق</td>
    <td><a href="https://prettier.io/">Prettier</a></td>
    <td>نمط كود متناسق</td>
  </tr>
</table>

---

<h3>نظام سياق المجموعة</h3>

<p>يتميز البوت بـ <strong>محرك سياق المجموعة</strong> احترافي للمشاركة الذكية في الدردشات الجماعية. عند إضافته إلى مجموعة، يتتبع نوافذ الرسائل لكل مستخدم (٥٠ رسالة لكل مستخدم)، ويحل سلاسل الردود، ويبني سياقًا منظمًا لاستجابات دقيقة للذكاء الاصطناعي.</p>

<h4>طبقة قاعدة البيانات — جدول <code>group_messages</code></h4>

<pre>
group_messages (
  id                  INTEGER PRIMARY KEY    -- تلقائي الزيادة
  chat_id             TEXT NOT NULL           -- معرف المجموعة
  user_id             TEXT NOT NULL           -- معرف مرسل الرسالة
  message_id          INTEGER NOT NULL       -- معرف رسالة تليغرام
  role                TEXT NOT NULL           -- 'user' | 'assistant'
  content             TEXT NOT NULL           -- النص المعالج
  reply_to_message_id INTEGER                -- معرف الرسالة الأم (اختياري)
  reply_to_user_id    TEXT                    -- مرسل الرسالة الأم (اختياري)
  reply_to_content    TEXT                    -- لقطة من نص الأم (اختياري)
  thread_id           TEXT                    -- معرف مجموعة السلسلة (اختياري)
  user_name           TEXT NOT NULL DEFAULT ''-- اسم العرض
  created_at          TEXT DEFAULT (datetime('now'))
)
</pre>

<p><strong>٤ فهارس</strong> للاستعلامات المثلى:</p>
<ul>
  <li><code>(chat_id, user_id, created_at)</code> — نافذة ٥٠ رسالة لكل مستخدم</li>
  <li><code>(chat_id, message_id)</code> — حل تبعية الرد</li>
  <li><code>(chat_id, created_at)</code> — سياق المجموعة المحيطي</li>
  <li><code>(chat_id, thread_id, created_at)</code> — استعلام السلسلة الكامل</li>
</ul>

<h4>الوحدة الأساسية — <code>src/group-context.ts</code></h4>

<p><strong>بناء السياق ثلاثي الطبقات</strong> — يتم تجميع سياق ذي أولوية لكل رسالة جماعية:</p>

<pre>
buildGroupContext(chatId, userId, message)
  │
  ├── الطبقة ١: سلسلة الرد (أعلى أولوية)
  │   ├── resolveReplyChain() — تتبع reply_to حتى ٥ مستويات عمق
  │   └── تنسيق: "[Reply Chain] @user: msg → @user2: reply → Bot: response"
  │
  ├── الطبقة ٢: نافذة المستخدم (أولوية متوسطة)
  │   ├── getUserWindow() — آخر ٥٠ رسالة لذلك المستخدم
  │   └── تنسيق: "[User History (last 50)] @user: text  @user: text  Bot: text"
  │
  └── الطبقة ٣: السياق المحيطي (أولوية منخفضة)
      ├── getAmbientContext() — آخر ٥ رسائل جماعية
      └── تنسيق: "[Recent Group Activity] @user3: msg  @user4: msg"
</pre>

<p><strong>قرارات التصميم الرئيسية:</strong></p>
<ul>
  <li><strong>اللقطات</strong>: يتم التقاط <code>reply_to_content</code> من كائن <code>reply_to_message</code> في تليغرام، وليس من قاعدة البيانات — الحفاظ على السياق حتى لو كانت الرسالة الأم خارج نافذة الـ ٥٠</li>
  <li><strong>وراثة الخيط</strong>: عندما يرد مستخدم على رسالة، يتم توريث <code>thread_id</code> من الأصل (أو إنشاؤه إذا لم يكن موجودًا)</li>
  <li><strong>القص التلقائي</strong>: كل إدراج ينشط <code>trimGroupHistory()</code> للحفاظ على نافذة كل مستخدم عند ٥٠ رسالة بالضبط</li>
  <li><strong>اقتطاع الرسائل</strong>: كل رسالة في السياق تُقتطع إلى ٢٠٠ حرف لكفاءة التوكنات</li>
</ul>

<h4>موجه النظام الواعي بالمجموعة</h4>

<p>دالة <code>buildGroupSystemPrompt()</code> في <code>src/ai.ts</code> تنشئ موجه نظام متخصص بقواعد المجموعة بـ ٥ لغات:</p>

<pre>
[GROUP CHAT RULES]
- This is a group chat with multiple users. Each message is prefixed with the sender's name.
- Pay attention to who said what and maintain conversation context.
- When replying to a specific user, address them by name.
- Use the reply chain context to understand threaded conversations.
- Only respond when directly addressed or when you have something valuable to add.
</pre>

<h4>التدفق الكامل للمجموعة</h4>

<pre>
① يرسل تليغرام رسالة جماعية
② فلتر المجموعة: تم التنبيه / رد على البوت / أمر؟
③ storeGroupMessageAndGetInfo() — حفظ + تحديد thread_id + قص
④ معالجة الوسائط (صورة ← Vision، صوت ← Whisper، ملف ← استخراج)
⑤ buildGroupContext() — بناء السياق ثلاثي الطبقات
⑥ buildGroupSystemPrompt() — شخصية + قواعد مجموعة + سياق
⑦ runChat() → Workers AI مع موجه نظام مُغنى
⑧ storeBotGroupMessage() — حفظ رد البوت
⑨ sendMessage() — رد منسق مع أزرار التقييم
</pre>

<h4>مقارنة DM vs Group</h4>

<table>
  <tr>
    <th>الجانب</th>
    <th>رسالة خاصة</th>
    <th>مجموعة</th>
  </tr>
  <tr>
    <td>مصدر التاريخ</td>
    <td>جدول <code>chat_history</code> (آخر ٨ رسائل)</td>
    <td>جدول <code>group_messages</code> (٥٠ لكل مستخدم + سلسلة + محيط)</td>
  </tr>
  <tr>
    <td>موجه النظام</td>
    <td><code>buildSystemPrompt()</code> — قياسي</td>
    <td><code>buildGroupSystemPrompt()</code> — مع قواعد المجموعة</td>
  </tr>
  <tr>
    <td>تتبع الردود</td>
    <td>لا يوجد</td>
    <td>حل كامل للسلسلة (حتى ٥ مستويات)</td>
  </tr>
  <tr>
    <td>التخزين</td>
    <td><code>addChatMessage()</code> → <code>chat_history</code></td>
    <td><code>addGroupMessage()</code> → <code>group_messages</code></td>
  </tr>
  <tr>
    <td>عزل المستخدم</td>
    <td>مستخدم واحد</td>
    <td>نافذة ٥٠ رسالة لكل مستخدم</td>
  </tr>
  <tr>
    <td>تنظيف التاريخ</td>
    <td><code>trimHistory()</code> — سقف عام</td>
    <td><code>trimGroupHistory()</code> — سقف لكل مستخدم + <code>cleanupOldGroupData()</code></td>
  </tr>
</table>

---

<h2>⚙️ الإعدادات</h2>

<table>
  <tr>
    <th>المتغير</th>
    <th align="center">مطلوب</th>
    <th>الوصف</th>
  </tr>
  <tr>
    <td><code>TELEGRAM_BOT_TOKEN</code></td>
    <td align="center">✅</td>
    <td>رمز البوت من <a href="https://t.me/botfather">@BotFather</a></td>
  </tr>
  <tr>
    <td><code>WORKER_DOMAIN</code></td>
    <td align="center">✅</td>
    <td>رابط العامل الخاص بك (محدد في <code>wrangler.toml</code>)</td>
  </tr>
  <tr>
    <td><code>WEBHOOK_SECRET</code></td>
    <td align="center">—</td>
    <td>رمز سري للتحقق من طلب webhook</td>
  </tr>
  <tr>
    <td><code>ADMIN_IDS</code></td>
    <td align="center">—</td>
    <td>معرفات مستخدمي تليغرام مفصولة بفواصل مع صلاحية المشرف</td>
  </tr>
  <tr>
    <td><code>BRAVE_API_KEY</code></td>
    <td align="center">—</td>
    <td>مفتاح API لـ <code>/search</code> من <a href="https://brave.com/search/api/">Brave Search</a></td>
  </tr>
  <tr>
    <td><code>GOOGLE_GEMINI_API_KEY</code></td>
    <td align="center">—</td>
    <td>مفتاح API Google AI Studio لنماذج Gemini (<a href="https://aistudio.google.com/apikey">احصل عليه</a>)</td>
  </tr>
</table>

<p>ربط D1 باسم <code>DB</code> وربط Workers AI باسم <code>AI</code> مطلوبان. يتم إنشاء مخطط قاعدة البيانات (١٢ جدول) تلقائيًا عند أول <code>/init</code> عبر نظام الترحيل المدمج.</p>

---

<h2>🔌 نقاط نهاية API</h2>

<table>
  <tr>
    <th>نقطة النهاية</th>
    <th>الطريقة</th>
    <th>الغرض</th>
  </tr>
  <tr>
    <td><code>/</code></td>
    <td><code>POST</code></td>
    <td>مستقبل webhook تليغرام</td>
  </tr>
  <tr>
    <td><code>/</code></td>
    <td><code>GET</code></td>
    <td>صفحة الحالة</td>
  </tr>
  <tr>
    <td><code>/init</code></td>
    <td><code>GET</code></td>
    <td>تهيئة / ترحيل مخطط D1</td>
  </tr>
  <tr>
    <td><code>/setWebhook</code></td>
    <td><code>GET</code></td>
    <td>تسجيل webhook مع تليغرام</td>
  </tr>
  <tr>
    <td><code>/health</code></td>
    <td><code>GET</code></td>
    <td>JSON للصحة والإصدار ووقت التشغيل</td>
  </tr>
  <tr>
    <td><code>/cleanup</code></td>
    <td><code>GET</code></td>
    <td>تنظيف يدوي للبيانات القديمة (<code>?days=30</code>)</td>
  </tr>
  <tr>
    <td><code>/daily-cron</code></td>
    <td><code>GET</code></td>
    <td>تشغيل النصائح اليومية لجميع الدردشات المفعلة</td>
  </tr>
  <tr>
    <td><code>/reminder-cron</code></td>
    <td><code>GET</code></td>
    <td>معالجة التذكيرات المستحقة</td>
  </tr>
</table>

---

<h2>📁 هيكل المشروع</h2>

<details>
<summary><strong>اضغط للتوسيع</strong></summary>

<br/>

<pre>
<b>src/</b>
├── <b>index.ts</b>              #  Worker entry — routing, webhook validation
├── <b>ai.ts</b>                 #  AI inference, system prompt builder, web search
├── <b>db.ts</b>                 #  D1 layer — migrations, queries, caching, rate limiting
├── <b>locales.ts</b>            #  i18n — 5 languages, template interpolation
├── <b>locales/</b>              #  Split locale data per language
│   ├── <b>en.ts</b>              #  English (317 keys)
│   ├── <b>fa.ts</b>              #  فارسی (316 keys)
│   ├── <b>ar.ts</b>              #  العربية (291 keys)
│   ├── <b>tr.ts</b>              #  Türkçe (291 keys)
│   └── <b>ru.ts</b>              #  Русский (300 keys)
├── <b>telegram.ts</b>           #  Telegram API client — retry, chunking, uploads
├── <b>constants.ts</b>          #  Shared constants (rate limits, RAG, Piston, etc.)
├── <b>model-config.ts</b>       #  Model registry, capabilities, cost config
├── <b>types/</b>
│   ├── <b>env.d.ts</b>           #  Env interface, Telegram types, UserSettings
│   └── <b>d1.ts</b>              #  D1 row type definitions
├── <b>handlers/</b>
│   ├── <b>message.ts</b>        #  Message classifier (text/photo/voice/file/URL)
│   ├── <b>command.ts</b>        #  All /slash command implementations
│   ├── <b>callback.ts</b>       #  Inline keyboard callback routing
│   ├── <b>admin.ts</b>          #  Admin panel (stats, broadcast, blocks, cleanup)
│   ├── <b>session.ts</b>        #  Multi-session management
│   ├── <b>persona.ts</b>        #  Custom persona creation
│   ├── <b>daily.ts</b>          #  Daily tips management
│   ├── <b>reminder.ts</b>       #  Reminder wizard + cron processing
│   ├── <b>debate.ts</b>         #  Multi-agent debate wizard
│   └── <b>inline.ts</b>         #  Inline query handler
├── <b>menus/</b>
│   ├── <b>modeMenu.ts</b>       #  Dynamic persona/model/language/keyboard menus
│   ├── <b>debateMenu.ts</b>     #  Debate flow keyboard menus
│   └── <b>reminderMenu.ts</b>   #  Reminder date/time picker and repeat menus
├── <b>modes/</b>
│   ├── <b>types.ts</b>          #  Mode system type definitions
│   ├── <b>registry.ts</b>       #  Mode registry & lookup
│   └── <b>exam.ts</b>           #  Exam mode implementation
├── <b>parsers/</b>
│   └── <b>htmlParser.ts</b>     #  Markdown → Telegram HTML converter
├── <b>repositories/</b>
│   ├── <b>settings.repo.ts</b>  #  User settings + migrations (v1–v21)
│   ├── <b>chat.repo.ts</b>      #  Chat history + group messages
│   ├── <b>admin.repo.ts</b>     #  Rate limiting, blocks, analytics, timing
│   ├── <b>cache.ts</b>          #  In-memory TTL cache
│   ├── <b>persona.repo.ts</b>   #  Custom personas + adaptation feedback
│   ├── <b>debate.repo.ts</b>    #  Debate sessions + messages
│   ├── <b>reminder.repo.ts</b>  #  Reminders CRUD
│   ├── <b>documents.repo.ts</b> #  RAG document storage & search
│   └── <b>memory.repo.ts</b>    #  Memory summaries storage
├── <b>services/</b>
│   ├── <b>index.ts</b>          #  Centralized service-layer re-exports
│   ├── <b>settings.service.ts</b>  #  User settings business logic
│   ├── <b>debate.service.ts</b>    #  Debate orchestration logic
│   ├── <b>ensemble.service.ts</b>  #  Parallel model query + judge selection
│   ├── <b>persona-adaptive.service.ts</b>  #  AI trait extraction from feedback
│   ├── <b>router.service.ts</b>  #  Message classifier → model routing
│   ├── <b>rag.service.ts</b>     #  Text chunking, indexing, retrieval
│   ├── <b>sandbox.service.ts</b> #  Piston API code execution (20 languages)
│   └── <b>memory.service.ts</b>  #  AI summarization & context recall
└── <b>utils/</b>
    ├── <b>logger.ts</b>         #  Structured JSON logging with request IDs
    ├── <b>error.ts</b>          #  AppError hierarchy, safe/retry wrappers
    ├── <b>file.ts</b>           #  Telegram file download, PDF text extraction
    ├── <b>cache.ts</b>          #  In-memory TTL cache
    ├── <b>validate.ts</b>       #  Input validation helpers
    └── <b>occasions.ts</b>      #  Occasions calendar for daily tips

<b>config/</b>
├── <b>personas.ts</b>           #  68 persona definitions (5 languages each)
└── <b>persona-emojis.ts</b>     #  Emoji mappings for persona thinking states

<b>tests/</b>
├── <b>unit/</b>                 #  164 unit tests (all modules)
└── <b>integration/</b>          #  9 integration tests (webhook flow)
</pre>

</details>

---

<h2>🧪 التطوير المحلي</h2>

<table>
  <tr>
    <th>الأمر</th>
    <th>الوصف</th>
  </tr>
  <tr>
    <td><code>npm install</code></td>
    <td>تثبيت التبعيات</td>
  </tr>
  <tr>
    <td><code>npm run typecheck</code></td>
    <td><code>tsc --noEmit</code> — بدون أخطاء</td>
  </tr>
  <tr>
    <td><code>npm test</code></td>
    <td><code>vitest --run</code> — ١٧٣ اختبارًا</td>
  </tr>
  <tr>
    <td><code>npm run test:watch</code></td>
    <td><code>vitest</code> — وضع المراقبة</td>
  </tr>
  <tr>
    <td><code>npm run build</code></td>
    <td><code>esbuild</code> → <code>dist/worker.bundle.js</code></td>
  </tr>
  <tr>
    <td><code>npm run lint</code></td>
    <td>ESLint (اختبارات) + tsc (مصدر)</td>
  </tr>
  <tr>
    <td><code>npm run format</code></td>
    <td>Prettier — كتابة الكل</td>
  </tr>
  <tr>
    <td><code>npx wrangler dev --remote</code></td>
    <td>خادم تطوير محلي (ارتباطات عن بعد)</td>
  </tr>
</table>

<br/>

<h3>اختبار Webhook محلي</h3>

<pre>
npx wrangler dev --remote           # http://localhost:8787
ngrok http 8787                     # public HTTPS URL
curl http://localhost:8787/setWebhook
</pre>

---

<h2>📊 حالة المشروع</h2>

<table>
  <tr>
    <th>المرحلة</th>
    <th>الوصف</th>
    <th align="center">الحالة</th>
  </tr>
  <tr>
    <td>١</td>
    <td>ترحيل JS → TypeScript، tsconfig، خط أنابيب CI</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>٢</td>
    <td>تعليقات الأنواع الكاملة — <code>noImplicitAny: true</code>، ٠ أخطاء tsc</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>٣</td>
    <td>فهارس D1، تنظيف تلقائي، اختبارات تكامل (١٧٣ إجمالاً)</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>٤</td>
    <td>الوضع المضمن، TTS، الاستجابات المتدفقة، إصلاح الرد في المجموعات، التعاون متعدد العوامل (<code>/debate</code>)</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>٥</td>
    <td>٩ نماذج صور، نصائح يومية (كرون ذكي + تقويم مناسبات)، نظام تذكير (منتقي تاريخ/وقت، تكرار، إشعارات)</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>٦</td>
    <td>التصويت الجماعي — استعلام ٣ نماذج بالتوازي + استراتيجية حكم/عشوائي</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>٧</td>
    <td>الشخصية التكيفية — AI يستخرج سمات المستخدم من التعليقات</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>٨</td>
    <td>التوجيه التلقائي — مصنف رسائل يوجه لأفضل نموذج</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>٩</td>
    <td>قاعدة المعرفة RAG — <code>/learn</code> + <code>/forget</code>، استرجاع بـ LIKE</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>١٠</td>
    <td>صندوق رمل الكود — <code>/run</code> في ٢٠ لغة عبر Piston API</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>١١</td>
    <td>ذاكرة AI — تلخيص المحادثات التلقائي واستدعاء السياق</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>١٢</td>
    <td>متعدد الوسائط — دعم ملصق، فيديو، موقع، جهة اتصال</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>١٣</td>
    <td>تحليلات — توقيت الاستجابة لكل مستخدم وتتبعه</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>١٤</td>
    <td>أداء — قياسات حول التدفق + تقوية الإدخال</td>
    <td align="center">✅</td>
  </tr>
</table>

---

<h2>🤝 المساهمة</h2>

<ol>
  <li>انسخ المستودع (Fork)</li>
  <li>أنشئ فرع ميزة: <code>git checkout -b feature/فكرتك</code></li>
  <li>احفظ التغييرات: <code>git commit -m 'إضافة ميزة X'</code></li>
  <li>ادفع: <code>git push origin feature/فكرتك</code></li>
  <li>افتح طلب سحب (Pull Request)</li>
</ol>

<p>يرجى التأكد من:</p>
<ul>
  <li>✅ <code>npm run typecheck</code> ناجح (بدون أخطاء tsc)</li>
  <li>✅ <code>npm test</code> ناجح (جميع الاختبارات ١٧٣)</li>
  <li>✅ الكود يتبع الأنماط الحالية (مكتوب بالكامل بالأنواع، بدون تغييرات وقت التشغيل)</li>
  <li>✅ حدث <code>README.md</code> إذا أضفت ميزات</li>
</ul>

---

<h2>📄 الرخصة</h2>

<p>
  <a href="LICENSE">MIT</a> — استخدم بحرية، وعدل، وشارك.
</p>

<br/>

<div align="center">
  <sub>
    مبني بـ ⚡ على <a href="https://workers.cloudflare.com/">Cloudflare Workers</a> ·
    مدعوم من <a href="https://developers.cloudflare.com/workers-ai/">Workers AI</a> ·
    مخزن في <a href="https://developers.cloudflare.com/d1/">D1 Database</a>
  </sub>
  <br/><br/>
  <sub>
    <a href="https://github.com/RealClickClick/worker-ai-chatbot">GitHub</a> ·
    <a href="https://t.me/botfather">@BotFather</a> ·
    <a href="https://dash.cloudflare.com/">لوحة تحكم Cloudflare</a>
  </sub>
</div>
