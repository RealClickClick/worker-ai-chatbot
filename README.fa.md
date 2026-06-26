<div align="center">
  <br/>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/🤖_AI_Telegram_Bot-v2.2.0-22C55E?style=for-the-badge&labelColor=1a1a2e&color=00d4aa">
    <img alt="AI Telegram Bot" src="https://img.shields.io/badge/🤖_AI_Telegram_Bot-v2.2.0-22C55E?style=for-the-badge&labelColor=f0f0f0&color=00d4aa" height="40">
  </picture>

  <br/><br/>

  <p><strong>سرورلس • نوع‑ایمن • چند‑زبانه • ۶۸ شخصیت • RAG • محیط اجرای کد</strong></p>

  <p>
    یک دستیار هوش مصنوعی تلگرام در سطح تولید که کاملاً روی Cloudflare Workers اجرا می‌شود.<br/>
    نیروگرفته از Workers AI — توزیع‌شده جهانی، بدون سردی راه‌اندازی، کاملاً تایپ‌شده.
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

<h2>📋 فهرست مطالب</h2>

<p>
  <a href="#-features">ویژگی‌ها</a> •
  <a href="#-quick-start">شروع سریع</a> •
  <a href="#-commands">دستورات</a> •
  <a href="#-ai-models">مدل‌های هوش مصنوعی</a> •
  <a href="#-personas">شخصیت‌ها</a> •
  <a href="#-architecture">معماری</a> •
  <a href="#-group-context-system">سیاق گروه</a> •
  <a href="#-configuration">پیکربندی</a> •
  <a href="#-api-endpoints">API</a> •
  <a href="#-project-structure">ساختار</a> •
  <a href="#-local-development">توسعه محلی</a>
</p>

---

<h2>✨ ویژگی‌ها</h2>

<table>
  <tr>
    <td align="center" width="14%">💬</td>
    <td width="36%"><strong>گفتگوی هوش مصنوعی</strong><br/><sub>آگاه از بافتار با ۱۰ مدل قابل انتخاب</sub></td>
    <td align="center" width="14%">🎭</td>
    <td width="36%"><strong>۶۸ شخصیت</strong><br/><sub>۹ دسته + شخصیت‌های سفارشی نامحدود</sub></td>
  </tr>
  <tr>
    <td align="center">🖼️</td>
    <td><strong>تولید تصویر</strong><br/><sub>۹ مدل: SDXL, Flux, Lightning, Lucid, FLUX.2 Klein 4B/9B, Phoenix, Dreamshaper</sub></td>
    <td align="center">👁️</td>
    <td><strong>درک تصویر</strong><br/><sub>هوش مصنوعی هر عکسی را توصیف می‌کند</sub></td>
  </tr>
  <tr>
    <td align="center">🌐</td>
    <td><strong>جستجوی وب</strong><br/><sub>نیروگرفته از Brave Search API</sub></td>
    <td align="center">🔗</td>
    <td><strong>مرور وب</strong><br/><sub>دریافت و خلاصه‌سازی هر URL</sub></td>
  </tr>
  <tr>
    <td align="center">📄</td>
    <td><strong>خواندن فایل</strong><br/><sub>تجزیه درون‌خطی PDF, TXT, DOC</sub></td>
    <td align="center">🎙️</td>
    <td><strong>رونویسی صدا</strong><br/><sub>نیروگرفته از Whisper</sub></td>
  </tr>
  <tr>
    <td align="center">🗂️</td>
    <td><strong>چند‑نشست</strong><br/><sub>رشته‌های گفتگوی مستقل</sub></td>
    <td align="center">📤</td>
    <td><strong>خروجی</strong><br/><sub>دانلود تاریخچه با فرمت .txt</sub></td>
  </tr>
  <tr>
    <td align="center">🌍</td>
    <td><strong>۵ زبان</strong><br/><sub>EN · FA · AR · TR · RU</sub></td>
    <td align="center">👍</td>
    <td><strong>دکمه‌های بازخورد</strong><br/><sub>ردیابی کیفیت به ازای هر پاسخ</sub></td>
  </tr>
  <tr>
    <td align="center">🛡️</td>
    <td><strong>محدودیت نرخ</strong><br/><sub>محدودسازی به‌ازای کاربر + زمان استراحت</sub></td>
    <td align="center">🛠️</td>
    <td><strong>پنل مدیریت</strong><br/><sub>ارسال همگانی، آمار، مسدودسازی، پاکسازی</sub></td>
  </tr>
  <tr>
    <td align="center">📊</td>
    <td><strong>تحلیل</strong><br/><sub>معیارهای مصرف + کاربران فعال</sub></td>
    <td align="center">🧹</td>
    <td><strong>پاکسازی خودکار</strong><br/><sub>چرخش خودکار داده‌های قدیمی</sub></td>
  </tr>
  <tr>
    <td align="center">👥</td>
    <td><strong>موتور سیاق گروه</strong><br/><sub>پنجره ۵۰ پیام به‌ازای کاربر + ردیابی ریپلای</sub></td>
    <td align="center">🧵</td>
    <td><strong>آگاهی از زنجیره</strong><br/><sub>حل کامل زنجیره ریپلای تا ۵ سطح عمق</sub></td>
  </tr>
  <tr>
    <td align="center">@</td>
    <td><strong>حالت Inline</strong><br/><sub>تایپ <code>@bot query</code> در هر چتی</sub></td>
    <td align="center">🔊</td>
    <td><strong>متن به گفتار</strong><br/><sub>Melo TTS با پشتیبانی ۵ زبان</sub></td>
  </tr>
  <tr>
    <td align="center">⚡</td>
    <td><strong>پاسخ‌های Streaming</strong><br/><sub>متن لحظه‌ای هنگام فکر کردن AI</sub></td>
    <td align="center">🎭</td>
    <td><strong>همکاری چندعامله</strong><br/><sub><code>/debate</code> بحث دو شخصیت درباره هر موضوعی</sub></td>
  </tr>
  <tr>
    <td align="center">📅</td>
    <td><strong>نکات روزانه</strong><br/><sub>پیام صبحگاهی هوشمند با مناسبت‌های روز</sub></td>
    <td align="center">⏰</td>
    <td><strong>سیستم یادآور</strong><br/><sub>یادآور سفارشی با انتخابگر تاریخ/زمان و تکرار</sub></td>
  </tr>
  <tr>
    <td align="center">🗳️</td>
    <td><strong>رأی‌گیری گروهی</strong><br/><sub>پرس‌وجوی ۳ مدل به موازات، انتخاب بهترین با داور</sub></td>
    <td align="center">🧠</td>
    <td><strong>شخصیت تطبیقی</strong><br/><sub>AI از بازخورد کاربر ویژگی‌ها را یاد می‌گیرد</sub></td>
  </tr>
  <tr>
    <td align="center">🧭</td>
    <td><strong>مسیریابی خودکار</strong><br/><sub>طبقه‌بندی پیام‌ها و هدایت به بهترین مدل</sub></td>
    <td align="center">📚</td>
    <td><strong>RAG</strong><br/><sub><code>/learn</code> + <code>/forget</code> پایگاه دانش شخصی</sub></td>
  </tr>
  <tr>
    <td align="center">💻</td>
    <td><strong>محیط اجرای کد</strong><br/><sub><code>/run</code> در ۲۰ زبان از طریق Piston API</sub></td>
    <td align="center">🧵</td>
    <td><strong>حافظه AI</strong><br/><sub>خلاصه‌سازی و یادآوری خودکار گفتگوها</sub></td>
  </tr>
  <tr>
    <td align="center">📊</td>
    <td><strong>زمان‌بندی کاربر</strong><br/><sub>تحلیل زمان پاسخ به‌ازای کاربر</sub></td>
    <td align="center">🛡️</td>
    <td><strong>سخت‌سازی ورودی</strong><br/><sub>محدودیت ۱۰k کاراکتر، ثبت وقایع ساختاریافته</sub></td>
  </tr>
  <tr>
    <td align="center">🏷️</td>
    <td><strong>استیکر / موقعیت / مخاطب</strong><br/><sub>پشتیبانی از انواع پیام چندحالته</sub></td>
    <td align="center"></td>
    <td></td>
  </tr>
</table>

---

<h2>🚀 شروع سریع</h2>

<h3>پیش‌نیازها</h3>

<table>
  <tr>
    <td>☁️</td>
    <td><a href="https://dash.cloudflare.com/">حساب Cloudflare</a></td>
  </tr>
  <tr>
    <td>🤖</td>
    <td><a href="https://t.me/botfather">توکن ربات تلگرام</a> از @BotFather</td>
  </tr>
  <tr>
    <td>📦</td>
    <td><a href="https://nodejs.org/">Node.js</a> ۱۸+ (فقط برای استقرار خط‌فرمان)</td>
  </tr>
</table>

<br/>

<h3>استقرار در ۳ دقیقه</h3>

<table>
  <tr>
    <th>مرحله</th>
    <th>دستور</th>
    <th>توضیحات</th>
  </tr>
  <tr>
    <td>۱</td>
    <td><code>git clone https://github.com/RealClickClick/worker-ai-chatbot.git && cd worker-ai-chatbot && npm install</code></td>
    <td>کلون و نصب</td>
  </tr>
  <tr>
    <td>۲</td>
    <td><code>npx wrangler d1 create ai-telegram-bot-db</code></td>
    <td>ایجاد پایگاه داده D1 → <b>شناسه را در <code>wrangler.toml</code> کپی کنید</b></td>
  </tr>
  <tr>
    <td>۳</td>
    <td>
      <code>npx wrangler secret put TELEGRAM_BOT_TOKEN</code><br/>
      <code>npx wrangler secret put BRAVE_API_KEY</code>  <i>(اختیاری)</i><br/>
      <code>npx wrangler secret put GOOGLE_GEMINI_API_KEY</code>  <i>(اختیاری)</i><br/>
      <code>npx wrangler secret put WEBHOOK_SECRET</code> <i>(اختیاری)</i><br/>
      <code>npx wrangler secret put ADMIN_IDS</code>     <i>(اختیاری)</i>
    </td>
    <td>تنظیم اسرار</td>
  </tr>
  <tr>
    <td>۴</td>
    <td><code>npx wrangler deploy</code></td>
    <td>استقرار روی Cloudflare</td>
  </tr>
</table>

<br/>

<details>
<summary><strong>☁️ روش جایگزین: داشبورد Cloudflare (بدون نیاز به ابزار خط‌فرمان)</strong></summary>

<br/>

1. به [داشبورد Cloudflare](https://dash.cloudflare.com/) بروید → **Workers & Pages** → **Create Application** → **Create Worker**

   ![مرحله ۱: ایجاد اپلیکیشن](docs/setup-screenshots/01-create-application.png)

2. قالب پیش‌فرض **"Hello World"** را نگه دارید و روی **Deploy** کلیک کنید

   ![مرحله ۲: شروع با Hello World](docs/setup-screenshots/02-start-hello-world.png)
   ![مرحله ۳: استقرار](docs/setup-screenshots/03-deploy-hello-world.png)

3. در داشبورد worker، روی **Edit code** کلیک کنید

   ![مرحله ۴: ویرایش کد در داشبورد](docs/setup-screenshots/04-dashboard-edit-code.png)

4. همه کد پیش‌فرض Hello World را انتخاب کنید → محتوای [`dist/worker.bundle.js`](dist/worker.bundle.js) را جایگذین کنید → روی **Save and Deploy** کلیک کنید

   ![مرحله ۵: جایگذینی کد و استقرار](docs/setup-screenshots/05-paste-code-deploy.png)

5. به **Settings → Variables and Secrets** بروید و این متغیرهای محیطی را اضافه کنید:

   - `TELEGRAM_BOT_TOKEN` — توکن ربات از [@BotFather](https://t.me/BotFather)
   - `WORKER_DOMAIN` — `your-worker-name.your-subdomain.workers.dev`
   - `ADMIN_IDS` — آیدی عددی تلگرام شما (اختیاری)
   - `BRAVE_API_KEY` — برای جستجوی وب (اختیاری)
   - `GOOGLE_GEMINI_API_KEY` — برای مدل‌های Gemini (اختیاری)
   - `WEBHOOK_SECRET` — برای تایید webhook (اختیاری)
   - `BOT_NAME` — اسم دلخواه برای ربات (اختیاری، جایگزین اسم شخصیت)
   - `BOT_DESCRIPTION` — دستورالعمل اضافی برای system prompt (اختیاری)

   ![مرحله ۶: تنظیمات متغیرها](docs/setup-screenshots/06-settings-variables.png)
   ![مرحله ۷: افزودن توکن تلگرام](docs/setup-screenshots/07-add-telegram-token.png)
   ![مرحله ۸: افزودن دامنه Worker](docs/setup-screenshots/08-add-worker-domain.png)

6. به **Workers & Pages** → worker شما → **Settings** → **Bindings** → **Add binding** بروید → **D1 Database** را انتخاب کنید → نام آن را `DB` بگذارید

   ![مرحله ۹: افزودن binding](docs/setup-screenshots/09-bindings-add-binding.png)
   ![مرحله ۱۰: افزودن D1 Database](docs/setup-screenshots/10-add-d1-database.png)

7. به **Bindings** → **Add binding** بروید → **Workers AI** را انتخاب کنید → نام آن را `AI` بگذارید

   ![مرحله ۱۱: افزودن Workers AI](docs/setup-screenshots/11-add-workers-ai.png)
   ![مرحله ۱۲: تنظیم AI Binding](docs/setup-screenshots/12-configure-ai-binding.png)

8. وارد `https://your-worker.workers.dev/init` شوید — تمام جداول پایگاه داده ساخته می‌شود

   ![مرحله ۱۳: مقداردهی پایگاه داده](docs/setup-screenshots/13-init-database.png)

9. وارد `https://your-worker.workers.dev/setWebhook` شوید — webhook تلگرام ثبت می‌شود

   ![مرحله ۱۴: تنظیم webhook](docs/setup-screenshots/14-set-webhook.png)

</details>

<br/>

<h3>پس از استقرار</h3>

<table>
  <tr>
    <th>نقطه پایانی</th>
    <th>هدف</th>
  </tr>
  <tr>
    <td><code>https://your-worker.workers.dev/init</code></td>
    <td>ایجاد جداول پایگاه داده و اجرای مهاجرت‌ها</td>
  </tr>
  <tr>
    <td><code>https://your-worker.workers.dev/setWebhook</code></td>
    <td>ثبت آدرس webhook در تلگرام</td>
  </tr>
</table>

> ✅ **انجام شد.** ربات شما فعال است — نیاز به تنظیمات دیگری نیست.

---

<h2>🎮 دستورات</h2>

<table>
  <tr>
    <th>دستور</th>
    <th>آرگومان‌ها</th>
    <th>توضیحات</th>
  </tr>
  <tr>
    <td><code>/start</code></td>
    <td>—</td>
    <td>پیام خوش‌آمدگویی با منوی تنظیمات</td>
  </tr>
  <tr>
    <td><code>/help</code></td>
    <td>—</td>
    <td>راهنمای کامل دستورات</td>
  </tr>
  <tr>
    <td><code>/mode</code></td>
    <td>—</td>
    <td>انتخاب شخصیت و تنظیمات</td>
  </tr>
  <tr>
    <td><code>/model</code></td>
    <td>—</td>
    <td>تغییر مدل هوش مصنوعی</td>
  </tr>
  <tr>
    <td><code>/lang</code></td>
    <td>—</td>
    <td>تغییر زبان</td>
  </tr>
  <tr>
    <td><code>/image</code></td>
    <td><code>&lt;prompt&gt;</code></td>
    <td>تولید تصویر</td>
  </tr>
  <tr>
    <td><code>/search</code></td>
    <td><code>&lt;query&gt;</code></td>
    <td>جستجوی وب از طریق Brave</td>
  </tr>
  <tr>
    <td><code>/translate</code></td>
    <td><code>&lt;text&gt;</code></td>
    <td>ترجمه به زبان فعلی</td>
  </tr>
  <tr>
    <td><code>/summarize</code></td>
    <td>—</td>
    <td>خلاصه‌سازی گفتگوی اخیر</td>
  </tr>
  <tr>
    <td><code>/instructions</code></td>
    <td><code>&lt;text&gt;</code> · <code>reset</code></td>
    <td>تنظیم رفتار سفارشی هوش مصنوعی</td>
  </tr>
  <tr>
    <td><code>/setname</code></td>
    <td><code>&lt;name&gt;</code> · <code>reset</code></td>
    <td>تنظیم اسم دلخواه برای ربات (جایگزین اسم شخصیت)</td>
  </tr>
  <tr>
    <td><code>/newpersona</code></td>
    <td><code>Name \| Desc</code> · <code>list</code> · <code>del &lt;n&gt;</code></td>
    <td>ایجاد / مدیریت شخصیت‌های سفارشی</td>
  </tr>
  <tr>
    <td><code>/session</code></td>
    <td><code>new &lt;n&gt;</code> · <code>&lt;id&gt;</code> · <code>list</code> · <code>rename</code> · <code>del</code></td>
    <td>مدیریت چند‑نشست</td>
  </tr>
  <tr>
    <td><code>/export</code></td>
    <td>—</td>
    <td>دانلود گفتگو با فرمت <code>.txt</code></td>
  </tr>
  <tr>
    <td><code>/clear</code></td>
    <td>—</td>
    <td>بازنشانی حافظه، تنظیمات و نشست‌ها</td>
  </tr>
  <tr>
    <td><code>/stats</code></td>
    <td>—</td>
    <td>نمایش پروفایل و آمار مصرف فعلی</td>
  </tr>
  <tr>
    <td><code>/tts</code></td>
    <td><code>&lt;text&gt;</code></td>
    <td>تبدیل متن به گفتار (فارسی، انگلیسی، عربی، ترکی، روسی)</td>
  </tr>
  <tr>
    <td><code>/debate</code></td>
    <td><code>&lt;topic&gt;</code></td>
    <td>شروع مناظره چندعامله بین دو شخصیت</td>
  </tr>
  <tr>
    <td><code>/daily</code></td>
    <td>—</td>
    <td>فعال/غیرفعال کردن نکات روزانه</td>
  </tr>
  <tr>
    <td><code>/remind</code></td>
    <td>—</td>
    <td>ساخت یادآور جدید (۴ مرحله: عنوان ← تاریخ ← زمان ← تکرار)</td>
  </tr>
  <tr>
    <td><code>/reminders</code></td>
    <td>—</td>
    <td>مشاهده و مدیریت یادآورهای فعال</td>
  </tr>
  <tr>
    <td><code>/cancel</code></td>
    <td>—</td>
    <td>لغو ساخت یادآور</td>
  </tr>
  <tr>
    <td><code>/learn</code></td>
    <td><code>&lt;text&gt;</code></td>
    <td>آموزش به بات — ذخیره در پایگاه دانش شخصی (RAG)</td>
  </tr>
  <tr>
    <td><code>/forget</code></td>
    <td>—</td>
    <td>پاک کردن دانش ذخیره شده</td>
  </tr>
  <tr>
    <td><code>/run</code></td>
    <td><code>&lt;lang&gt; &lt;code&gt;</code></td>
    <td>اجرای کد در ۲۰ زبان از طریق Piston API</td>
  </tr>
  <tr>
    <td><code>/feedback</code></td>
    <td><code>&lt;message&gt;</code></td>
    <td>ارسال بازخورد</td>
  </tr>
  <tr>
    <td><code>/admin</code></td>
    <td><code>stats</code> · <code>broadcast</code> · <code>block</code> · <code>unblock</code> · <code>blocked</code> · <code>cleanup</code></td>
    <td>پنل مدیریت <sub>(محدود)</sub></td>
  </tr>
</table>

---

<h2>🤖 مدل‌های هوش مصنوعی</h2>

<table>
  <tr>
    <th></th>
    <th>کلید</th>
    <th>شناسه مدل</th>
    <th>پارامترها</th>
    <th>بینایی</th>
    <th>مناسب برای</th>
  </tr>
  <tr>
    <td>⚡</td>
    <td><code>fast</code></td>
    <td><code>@cf/meta/llama-3.1-8b-instruct-fast</code></td>
    <td>۸B</td>
    <td align="center">—</td>
    <td>توان عملیاتی بالا، پاسخ‌های سریع</td>
  </tr>
  <tr>
    <td>⚖️</td>
    <td><code>balanced</code></td>
    <td><code>@cf/deepseek-ai/deepseek-r1-distill-qwen-32b</code></td>
    <td>۳۲B</td>
    <td align="center">—</td>
    <td>همه‌منظوره، توازن کیفیت/سرعت</td>
  </tr>
  <tr>
    <td>🧠</td>
    <td><code>powerful</code></td>
    <td><code>@cf/meta/llama-3.3-70b-instruct-fp8-fast</code></td>
    <td>۷۰B</td>
    <td align="center">—</td>
    <td>استدلال پیچیده، تحلیل عمیق</td>
  </tr>
  <tr>
    <td>🇨🇳</td>
    <td><code>glm</code></td>
    <td><code>@cf/zai-org/glm-4.7-flash</code></td>
    <td>—</td>
    <td align="center">—</td>
    <td>چندزبانه، استنتاج سریع</td>
  </tr>
  <tr>
    <td>👁️</td>
    <td><code>vision</code></td>
    <td><code>@cf/meta/llama-3.2-11b-vision-instruct</code></td>
    <td>۱۱B</td>
    <td align="center">✅</td>
    <td>درک و توصیف تصویر</td>
  </tr>
  <tr>
    <td>🦙</td>
    <td><code>llama4</code></td>
    <td><code>@cf/meta/llama-4-scout-17b-16e-instruct</code></td>
    <td>۱۷B</td>
    <td align="center">—</td>
    <td>آخرین نسل MoE</td>
  </tr>
  <tr>
    <td>🔬</td>
    <td><code>gemma4</code></td>
    <td><code>@cf/google/gemma-4-26b-a4b-it</code></td>
    <td>۲۶B</td>
    <td align="center">—</td>
    <td>فشرده، کارآمد</td>
  </tr>
  <tr>
    <td>💻</td>
    <td><code>qwen_coder</code></td>
    <td><code>@cf/qwen/qwen2.5-coder-32b-instruct</code></td>
    <td>۳۲B</td>
    <td align="center">—</td>
    <td>تولید کد و وظایف فنی</td>
  </tr>
  <tr>
    <td>✨</td>
    <td><code>gemini_flash</code></td>
    <td><code>gemini-2.5-flash</code></td>
    <td>—</td>
    <td align="center">—</td>
    <td>سریع و مقرون‌به‌صرفه (از طریق API گوگل)</td>
  </tr>
  <tr>
    <td>✨</td>
    <td><code>gemini_flash_3</code></td>
    <td><code>gemini-3-flash</code></td>
    <td>—</td>
    <td align="center">—</td>
    <td>آخرین Gemini، چندحالته (از طریق API گوگل)</td>
  </tr>
</table>

<br/>

<h3>مدل‌های تولید تصویر</h3>

<table>
  <tr>
    <th></th>
    <th>کلید</th>
    <th>شناسه مدل</th>
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

<h2>🎭 شخصیت‌ها</h2>

<p>
  <strong>۶۸ شخصیت</strong> در <strong>۹ دسته</strong> — هرکدام به‌طور کامل به ۵ زبان توضیح داده شده‌اند.<br/>
  با <code>/mode</code> انتخاب کنید یا با <code>/newpersona Name | Description</code> شخصیت خود را بسازید.
</p>

<br/>

<table>
  <tr>
    <th>دسته</th>
    <th align="center">#</th>
    <th>شخصیت‌ها</th>
  </tr>
  <tr>
    <td>💼 کسب‌وکار و حقوق</td>
    <td align="center">۸</td>
    <td>وکیل، مدیرعامل، حسابدار، بازاریاب، کارآفرین، سرمایه‌گذار، مشاور، مدیر منابع انسانی</td>
  </tr>
  <tr>
    <td>💻 علم و فناوری</td>
    <td align="center">۸</td>
    <td>هکر، توسعه‌دهنده، دانشمند داده، امنیت سایبری، فیزیکدان، شیمیدان، ستاره‌شناس، ریاضیدان</td>
  </tr>
  <tr>
    <td>🏥 سلامت و تندرستی</td>
    <td align="center">۶</td>
    <td>دکتر، درمانگر، متخصص تغذیه، روانپزشک، مربی بدنسازی، یوگی</td>
  </tr>
  <tr>
    <td>🎨 هنر و فرهنگ</td>
    <td align="center">۸</td>
    <td>شاعر، نویسنده، موسیقیدان، نقاش، طراح، معمار، فیلمساز، عکاس</td>
  </tr>
  <tr>
    <td>🌍 فانتزی و ماجراجویی</td>
    <td align="center">۸</td>
    <td>جادوگر، شوالیه، دزد دریایی، بیگانه، خون‌آشام، الف، اژدها، جادوگر</td>
  </tr>
  <tr>
    <td>🎭 شخصیت و طنز</td>
    <td align="center">۱۰</td>
    <td>بی‌رحم، افسرده، انگیزشی، کَرِن، نِرد، نسل زد، پدربزرگ، عاشق‌پیشه، کمدین، تئوری توطئه</td>
  </tr>
  <tr>
    <td>🐾 حیوانات و طبیعت</td>
    <td align="center">۶</td>
    <td>گربه، سگ، شیر، جغد، دلفین، پاندا</td>
  </tr>
  <tr>
    <td>👑 تاریخ و جامعه</td>
    <td align="center">۸</td>
    <td>پادشاه، ملکه، سامورایی، کاشف، کارآگاه، جاسوس، روزنامه‌نگار، فیلسوف</td>
  </tr>
  <tr>
    <td>🙏 معنوی و عرفانی</td>
    <td align="center">۶</td>
    <td>راهب، پیامبر، شمن، پیشگو، عارف، حکیم</td>
  </tr>
</table>

---

<h2>🏗️ معماری</h2>

<pre>
                           ┌─────────────────────────────────────┐
                           │        Cloudflare Worker            │
                           │     (لبه — ۵۰+ موقعیت)              │
                           │                                     │
  Telegram ──POST /──►     │  src/index.ts                       │
   (webhook)     │         │  ├─ اعتبارسنجی secret               │
                 │         │  ├─ توزیع مسیر                      │
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

<h3>جریان داده</h3>

<pre>
  ① Telegram → POST /  (تأییدشده با secret_token)
  ② index.ts → تجزیه JSON، اعتبارسنجی payload
  ③ message.ts → طبقه‌بندی: متن / عکس / صدا / فایل / URL / دستور
  ④ db.ts → بارگذاری تنظیمات کاربر (شخصیت، مدل، نشست، زبان)
  ⑤ ai.ts → ساخت system prompt + دریافت تاریخچه گفتگوی اخیر
  ⑥ Workers AI → اجرای استنتاج (LLM / vision / Whisper / SDXL)
  ⑦ htmlParser.ts → تبدیل Markdown به Telegram HTML
  ⑧ telegram.ts → ارسال پاسخ قالب‌بندی‌شده + دکمه‌های بازخورد
  ⑨ db.ts → ذخیره پیام کاربر + پاسخ هوش مصنوعی در D1
</pre>

<h3>پشته فناوری</h3>

<table>
  <tr>
    <th>لایه</th>
    <th>فناوری</th>
    <th>چرا</th>
  </tr>
  <tr>
    <td>⚡ زمان اجرا</td>
    <td><a href="https://workers.cloudflare.com/">Cloudflare Workers</a></td>
    <td>محاسبات لبه جهانی، بدون سردی راه‌اندازی (ES2022)</td>
  </tr>
  <tr>
    <td>📝 زبان</td>
    <td><a href="https://www.typescriptlang.org/">TypeScript</a> ۵.۷</td>
    <td>کاملاً تایپ‌شده — <code>noImplicitAny</code> اعمال شده، ۰ خطای tsc</td>
  </tr>
  <tr>
    <td>📦 باندلر</td>
    <td><a href="https://esbuild.github.io/">esbuild</a></td>
    <td>ساخت آنی، خروجی ۳۰۵ کیلوبایتی minified</td>
  </tr>
  <tr>
    <td>🗄️ پایگاه داده</td>
    <td><a href="https://developers.cloudflare.com/d1/">D1 (SQLite)</a></td>
    <td>مهاجرت خودکار، ۳ ایندکس، پاکسازی خودکار داده‌های قدیمی</td>
  </tr>
  <tr>
    <td>🤖 هوش مصنوعی</td>
    <td><a href="https://developers.cloudflare.com/workers-ai/">Workers AI</a></td>
    <td>۱۰ مدل گفتگو + ۵ مدل تصویر + Whisper</td>
  </tr>
  <tr>
    <td>🧪 تست</td>
    <td><a href="https://vitest.dev/">Vitest</a></td>
    <td>۱۷۳ تست (واحد + یکپارچه‌سازی جریان webhook)</td>
  </tr>
  <tr>
    <td>🔍 لینت</td>
    <td>ESLint (تست‌ها) + <code>tsc --noEmit</code> (منبع)</td>
    <td>تفکیک دغدغه‌ها — ایمنی نوع + کیفیت کد</td>
  </tr>
  <tr>
    <td>🎨 قالب‌بندی</td>
    <td><a href="https://prettier.io/">Prettier</a></td>
    <td>سبک کد یکپارچه</td>
  </tr>
</table>

---

<h3>سیستم سیاق گروه</h3>

<p>بات دارای یک <strong>موتور سیاق گروه</strong> حرفه‌ای برای شرکت هوشمند در چت‌های گروهی است. هنگامی که به یک گروه اضافه می‌شود، پنجره‌های پیام به‌ازای کاربر (۵۰ پیام برای هر کاربر) را ردیابی می‌کند، زنجیره‌های ریپلای را حل می‌کند و سیاق ساختاریافته برای پاسخ‌های دقیق هوش مصنوعی می‌سازد.</p>

<h4>لایه دیتابیس — جدول <code>group_messages</code></h4>

<pre>
group_messages (
  id                  INTEGER PRIMARY KEY    -- افزایش خودکار
  chat_id             TEXT NOT NULL           -- آیدی گروه
  user_id             TEXT NOT NULL           -- آیدی تلگرام فرستنده
  message_id          INTEGER NOT NULL       -- آیدی پیام در تلگرام
  role                TEXT NOT NULL           -- 'user' | 'assistant'
  content             TEXT NOT NULL           -- متن پردازش‌شده
  reply_to_message_id INTEGER                -- آیدی پیام والد (اختیاری)
  reply_to_user_id    TEXT                    -- فرستنده پیام والد (اختیاری)
  reply_to_content    TEXT                    -- snapshot از متن والد (اختیاری)
  thread_id           TEXT                    -- آیدی گروه زنجیره (اختیاری)
  user_name           TEXT NOT NULL DEFAULT ''-- نام نمایشی
  created_at          TEXT DEFAULT (datetime('now'))
)
</pre>

<p><strong>۴ ایندکس</strong> برای کوئری‌های بهینه:</p>
<ul>
  <li><code>(chat_id, user_id, created_at)</code> — پنجره ۵۰ تایی به‌ازای کاربر</li>
  <li><code>(chat_id, message_id)</code> — رفع وابستگی ریپلای</li>
  <li><code>(chat_id, created_at)</code> — سیاق محیطی گروه</li>
  <li><code>(chat_id, thread_id, created_at)</code> — کوئری زنجیره کامل</li>
</ul>

<h4>ماژول هسته — <code>src/group-context.ts</code></h4>

<p><strong>ساخت سیاق سه لایه</strong> — به ازای هر پیام گروهی، یک سیاق اولویت‌بندی شده ساخته می‌شود:</p>

<pre>
buildGroupContext(chatId, userId, message)
  │
  ├── لایه ۱: زنجیره ریپلای (بیشترین اولویت)
  │   ├── resolveReplyChain() — دنبال کردن reply_to تا ۵ سطح عمق
  │   └── قالب: "[Reply Chain] @user: msg → @user2: reply → Bot: response"
  │
  ├── لایه ۲: پنجره کاربر (اولویت متوسط)
  │   ├── getUserWindow() — آخرین ۵۰ پیام آن کاربر خاص
  │   └── قالب: "[User History (last 50)] @user: text  @user: text  Bot: text"
  │
  └── لایه ۳: سیاق محیطی (اولویت پایین)
      ├── getAmbientContext() — آخرین ۵ پیام گروه
      └── قالب: "[Recent Group Activity] @user3: msg  @user4: msg"
</pre>

<p><strong>تصمیمات کلیدی طراحی:</strong></p>
<ul>
  <li><strong>Snapshots</strong>: <code>reply_to_content</code> از شیء <code>reply_to_message</code> تلگرام گرفته می‌شود، نه دیتابیس — preserving سیاق حتی اگر پیام والد از پنجره ۵۰ تایی خارج شده باشد</li>
  <li><strong>وراثت Thread</strong>: وقتی کاربری به یک پیام ریپلای می‌کند، <code>thread_id</code> از والد به ارث برده می‌شود (یا ساخته می‌شود اگر وجود نداشته باشد)</li>
  <li><strong>Trim خودکار</strong>: هر insert تابع <code>trimGroupHistory()</code> را فعال می‌کند تا پنجره هر کاربر در ۵۰ پیام ثابت بماند</li>
  <li><strong>محدودیت پیام</strong>: هر پیام در سیاق به ۲۰۰ کاراکتر محدود می‌شود برای بهره‌وری توکن</li>
</ul>

<h4>System Prompt آگاه از گروه</h4>

<p>تابع <code>buildGroupSystemPrompt()</code> در <code>src/ai.ts</code> یک system prompt تخصصی با قوانین گروه به ۵ زبان می‌سازد:</p>

<pre>
[GROUP CHAT RULES]
- This is a group chat with multiple users. Each message is prefixed with the sender's name.
- Pay attention to who said what and maintain conversation context.
- When replying to a specific user, address them by name.
- Use the reply chain context to understand threaded conversations.
- Only respond when directly addressed or when you have something valuable to add.
</pre>

<h4>فلو کامل گروه</h4>

<pre>
① تلگرام پیام گروهی می‌فرستد
② فیلتر گروه: منشن شده / ریپلای به بات / کامند؟
③ storeGroupMessageAndGetInfo() — ذخیره + تعیین thread_id + trim
④ پردازش مدیا (عکس → Vision، ویس → Whisper، فایل → extract)
⑤ buildGroupContext() — ساخت سیاق ۳ لایه
⑥ buildGroupSystemPrompt() — پرسونا + قوانین گروه + سیاق
⑦ runChat() → Workers AI با system prompt غنی شده
⑧ storeBotGroupMessage() — ذخیره پاسخ بات
⑨ sendMessage() — پاسخ فرمت‌شده با دکمه‌های بازخورد
</pre>

<h4>مقایسه DM vs Group</h4>

<table>
  <tr>
    <th>جنبه</th>
    <th>پیام خصوصی</th>
    <th>گروه</th>
  </tr>
  <tr>
    <td>منبع تاریخچه</td>
    <td>جدول <code>chat_history</code> (۸ پیام آخر)</td>
    <td>جدول <code>group_messages</code> (۵۰ به‌ازای کاربر + زنجیره + محیط)</td>
  </tr>
  <tr>
    <td>System prompt</td>
    <td><code>buildSystemPrompt()</code> — استاندارد</td>
    <td><code>buildGroupSystemPrompt()</code> — با قوانین گروه</td>
  </tr>
  <tr>
    <td>ردیابی ریپلای</td>
    <td>ندارد</td>
    <td>حل کامل زنجیره (تا ۵ سطح)</td>
  </tr>
  <tr>
    <td>ذخیره‌سازی</td>
    <td><code>addChatMessage()</code> → <code>chat_history</code></td>
    <td><code>addGroupMessage()</code> → <code>group_messages</code></td>
  </tr>
  <tr>
    <td>تفکیک کاربر</td>
    <td>تک کاربر</td>
    <td>پنجره ۵۰ تایی به‌ازای کاربر</td>
  </tr>
  <tr>
    <td>پاکسازی تاریخچه</td>
    <td><code>trimHistory()</code> — سقف کلی</td>
    <td><code>trimGroupHistory()</code> — سقف به‌ازای کاربر + <code>cleanupOldGroupData()</code></td>
  </tr>
</table>

---

<h2>⚙️ پیکربندی</h2>

<table>
  <tr>
    <th>متغیر</th>
    <th align="center">ضروری</th>
    <th>توضیحات</th>
  </tr>
  <tr>
    <td><code>TELEGRAM_BOT_TOKEN</code></td>
    <td align="center">✅</td>
    <td>توکن ربات از <a href="https://t.me/botfather">@BotFather</a></td>
  </tr>
  <tr>
    <td><code>WORKER_DOMAIN</code></td>
    <td align="center">✅</td>
    <td>URL worker شما (در <code>wrangler.toml</code> تنظیم کنید)</td>
  </tr>
  <tr>
    <td><code>WEBHOOK_SECRET</code></td>
    <td align="center">—</td>
    <td>توکن محرمانه برای تأیید درخواست webhook</td>
  </tr>
  <tr>
    <td><code>ADMIN_IDS</code></td>
    <td align="center">—</td>
    <td>شناسه‌های کاربری تلگرام با دسترسی admin (جداشده با کاما)</td>
  </tr>
  <tr>
    <td><code>BRAVE_API_KEY</code></td>
    <td align="center">—</td>
    <td>کلید API برای <code>/search</code> از <a href="https://brave.com/search/api/">Brave Search</a></td>
  </tr>
  <tr>
    <td><code>GOOGLE_GEMINI_API_KEY</code></td>
    <td align="center">—</td>
    <td>کلید API Google AI Studio برای مدل‌های Gemini (<a href="https://aistudio.google.com/apikey">دریافت کنید</a>)</td>
  </tr>
</table>

<p>یک binding به نام <code>DB</code> برای D1 و یک binding به نام <code>AI</code> برای Workers AI الزامی است. طرح پایگاه داده (۱۲ جدول) در اولین <code>/init</code> از طریق سیستم مهاجرت داخلی به‌طور خودکار ایجاد می‌شود.</p>

---

<h2>🔌 نقاط پایانی API</h2>

<table>
  <tr>
    <th>نقطه پایانی</th>
    <th>روش</th>
    <th>هدف</th>
  </tr>
  <tr>
    <td><code>/</code></td>
    <td><code>POST</code></td>
    <td>دریافت webhook تلگرام</td>
  </tr>
  <tr>
    <td><code>/</code></td>
    <td><code>GET</code></td>
    <td>صفحه وضعیت</td>
  </tr>
  <tr>
    <td><code>/init</code></td>
    <td><code>GET</code></td>
    <td>ایجاد / مهاجرت طرح D1</td>
  </tr>
  <tr>
    <td><code>/setWebhook</code></td>
    <td><code>GET</code></td>
    <td>ثبت webhook در تلگرام</td>
  </tr>
  <tr>
    <td><code>/health</code></td>
    <td><code>GET</code></td>
    <td>سلامت، نسخه و زمان فعالیت به صورت JSON</td>
  </tr>
  <tr>
    <td><code>/cleanup</code></td>
    <td><code>GET</code></td>
    <td>پاکسازی دستی داده‌های قدیمی (<code>?days=30</code>)</td>
  </tr>
  <tr>
    <td><code>/daily-cron</code></td>
    <td><code>GET</code></td>
    <td>اجرای نکات روزانه برای همه چت‌های فعال</td>
  </tr>
  <tr>
    <td><code>/reminder-cron</code></td>
    <td><code>GET</code></td>
    <td>پردازش یادآورهای سررسید شده</td>
  </tr>
</table>

---

<h2>📁 ساختار پروژه</h2>

<details>
<summary><strong>برای باز کردن کلیک کنید</strong></summary>

<br/>

<pre>
<b>src/</b>
├── <b>index.ts</b>              #  ورودی Worker — مسیریابی، اعتبارسنجی webhook
├── <b>ai.ts</b>                 #  استنتاج هوش مصنوعی، ساختن system prompt، جستجوی وب
├── <b>db.ts</b>                 #  لایه D1 — مهاجرت‌ها، پرس‌وجوها، کش، محدودیت نرخ
├── <b>locales.ts</b>            #  بین‌المللی‌سازی (i18n) — ۵ زبان، درون‌یابی قالب
├── <b>telegram.ts</b>           #  کلاینت Telegram API — تلاش مجدد، تکه‌تکه‌کردن، بارگذاری
├── <b>types/</b>
│   └── <b>env.d.ts</b>           #  رابط Env، انواع Telegram، UserSettings
├── <b>handlers/</b>
│   ├── <b>message.ts</b>        #  طبقه‌بندی پیام (متن/عکس/صدا/فایل/URL)
│   ├── <b>command.ts</b>        #  پیاده‌سازی تمام دستورات /slash
│   ├── <b>callback.ts</b>       #  مسیریابی بازخورد صفحه‌کلید درون‌خطی
│   ├── <b>admin.ts</b>          #  پنل مدیریت (آمار، ارسال همگانی، مسدودسازی، پاکسازی)
│   ├── <b>session.ts</b>        #  مدیریت چند‑نشست
│   ├── <b>persona.ts</b>        #  ساخت شخصیت سفارشی
│   ├── <b>daily.ts</b>          #  مدیریت نکات روزانه
│   ├── <b>reminder.ts</b>       #  جادوگر یادآور + پردازش کرون
│   └── <b>debate.ts</b>         #  جادوگر بحث چندعامله
├── <b>menus/</b>
│   ├── <b>modeMenu.ts</b>       #  منوهای شخصیت/مدل/زبان/کیبورد
│   └── <b>reminderMenu.ts</b>   #  کیبوردهای انتخابگر تاریخ/زمان/تکرار
├── <b>parsers/</b>
│   └── <b>htmlParser.ts</b>     #  مبدل Markdown به Telegram HTML
└── <b>utils/</b>
    ├── <b>logger.ts</b>         #  ثبت وقایع ساختاریافته JSON با شناسه درخواست
    ├── <b>error.ts</b>          #  سلسله‌مراتب AppError، لفاف‌های ایمن/تلاش مجدد
    ├── <b>file.ts</b>           #  دانلود فایل تلگرام، استخراج متن PDF
    ├── <b>cache.ts</b>          #  کش TTL درون‌حافظه‌ای
    ├── <b>validate.ts</b>       #  اعتبارسنجی ورودی
    └── <b>occasions.ts</b>      #  تقویم مناسبت‌ها برای نکات روزانه

<b>config/</b>
└── <b>personas.ts</b>           #  ۶۸ تعریف شخصیت (هرکدام به ۵ زبان)

<b>tests/</b>
├── <b>unit/</b>                 #  ۱۶۴ تست واحد (همه ماژول‌ها)
└── <b>integration/</b>          #  ۹ تست یکپارچه‌سازی (جریان webhook)
</pre>

</details>

---

<h2>🧪 توسعه محلی</h2>

<table>
  <tr>
    <th>دستور</th>
    <th>توضیحات</th>
  </tr>
  <tr>
    <td><code>npm install</code></td>
    <td>نصب وابستگی‌ها</td>
  </tr>
  <tr>
    <td><code>npm run typecheck</code></td>
    <td><code>tsc --noEmit</code> — بدون خطا</td>
  </tr>
  <tr>
    <td><code>npm test</code></td>
    <td><code>vitest --run</code> — ۱۷۳ تست</td>
  </tr>
  <tr>
    <td><code>npm run test:watch</code></td>
    <td><code>vitest</code> — حالت نظارت</td>
  </tr>
  <tr>
    <td><code>npm run build</code></td>
    <td><code>esbuild</code> → <code>dist/worker.bundle.js</code></td>
  </tr>
  <tr>
    <td><code>npm run lint</code></td>
    <td>ESLint (تست‌ها) + tsc (منبع)</td>
  </tr>
  <tr>
    <td><code>npm run format</code></td>
    <td>Prettier — نوشتن روی همه فایل‌ها</td>
  </tr>
  <tr>
    <td><code>npx wrangler dev --remote</code></td>
    <td>سرور توسعه محلی (bindings از راه دور)</td>
  </tr>
</table>

<br/>

<h3>تست Webhook محلی</h3>

<pre>
npx wrangler dev --remote           # http://localhost:8787
ngrok http 8787                     # URL عمومی HTTPS
curl http://localhost:8787/setWebhook
</pre>

---

<h2>📊 وضعیت پروژه</h2>

<table>
  <tr>
    <th>فاز</th>
    <th>توضیحات</th>
    <th align="center">وضعیت</th>
  </tr>
  <tr>
    <td>۱</td>
    <td>مهاجرت JS → TypeScript، tsconfig، خط لوله CI</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>۲</td>
    <td>نوع‌نویسی کامل — <code>noImplicitAny: true</code>، ۰ خطای tsc</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>۳</td>
    <td>ایندکس‌های D1، پاکسازی خودکار، تست‌های یکپارچه‌سازی (۱۷۳ تست)</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>۴</td>
    <td>حالت Inline، TTS، پاسخ‌های Streaming، رفع ریپلای گروه، همکاری چندعامله (<code>/debate</code>)</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>۵</td>
    <td>۹ مدل تصویر، نکات روزانه (کرون هوشمند + تقویم مناسبت)، سیستم یادآور (انتخابگر تاریخ/زمان، تکرار، نوتیفیکیشن)</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>۶</td>
    <td>رأی‌گیری گروهی — پرس‌وجوی ۳ مدل به موازات + استراتژی داور/تصادفی</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>۷</td>
    <td>شخصیت تطبیقی — AI از بازخورد کاربر ویژگی‌ها را استخراج می‌کند</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>۸</td>
    <td>مسیریابی خودکار — طبقه‌بندی پیام و هدایت به بهترین مدل</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>۹</td>
    <td>پایگاه دانش RAG — <code>/learn</code> + <code>/forget</code>، بازیابی با LIKE</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>۱۰</td>
    <td>محیط اجرای کد — <code>/run</code> در ۲۰ زبان از طریق Piston API</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>۱۱</td>
    <td>حافظه AI — خلاصه‌سازی خودکار گفتگو و یادآوری سیاق</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>۱۲</td>
    <td>چندحالته — پشتیبانی استیکر، ویدیو، موقعیت، مخاطب</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>۱۳</td>
    <td>تحلیل — زمان پاسخ به‌ازای کاربر و ردیابی</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>۱۴</td>
    <td>کارایی — اندازه‌گیری اطراف streaming + سخت‌سازی ورودی</td>
    <td align="center">✅</td>
  </tr>
</table>

---

<h2>🤝 مشارکت</h2>

<ol>
  <li>مخزن را Fork کنید</li>
  <li>یک شاخه ویژگی ایجاد کنید: <code>git checkout -b feature/your-idea</code></li>
  <li>تغییرات را commit کنید: <code>git commit -m 'Add feature X'</code></li>
  <li>Push کنید: <code>git push origin feature/your-idea</code></li>
  <li>یک Pull Request باز کنید</li>
</ol>

<p>لطفاً اطمینان حاصل کنید:</p>
<ul>
  <li>✅ <code>npm run typecheck</code> قبول شود (۰ خطای tsc)</li>
  <li>✅ <code>npm test</code> قبول شود (همه ۱۷۳ تست)</li>
  <li>✅ کد از الگوهای موجود پیروی کند (کاملاً تایپ‌شده، بدون تغییرات زمان اجرا)</li>
  <li>✅ در صورت افزودن ویژگی‌ها، <code>README.md</code> به‌روزرسانی شود</li>
</ul>

---

<h2>📄 مجوز</h2>

<p>
  <a href="LICENSE">MIT</a> — آزادانه استفاده کنید، تغییر دهید و به اشتراک بگذارید.
</p>

<br/>

<div align="center">
  <sub>
    ساخته‌شده با ⚡ روی <a href="https://workers.cloudflare.com/">Cloudflare Workers</a> ·
    نیروگرفته از <a href="https://developers.cloudflare.com/workers-ai/">Workers AI</a> ·
    ذخیره‌شده در <a href="https://developers.cloudflare.com/d1/">D1 Database</a>
  </sub>
  <br/><br/>
  <sub>
    <a href="https://github.com/RealClickClick/worker-ai-chatbot">GitHub</a> ·
    <a href="https://t.me/botfather">@BotFather</a> ·
    <a href="https://dash.cloudflare.com/">Cloudflare Dashboard</a>
  </sub>
</div>
