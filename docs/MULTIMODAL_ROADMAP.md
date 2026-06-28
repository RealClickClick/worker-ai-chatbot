# Multi-modal Pipeline — Roadmap

## Phase 1: Unified Media Pipeline (این فاز)
یک pipeline متمرکز برای پردازش همه نوع رسانه (تصویر، صدا، فیلم، فایل، موقعیت، استیکر) با ذخیره‌سازی متادیتا در دیتابیس.

```
User sends media → Pipeline detects type → Process & describe → Store metadata → Return structured context
```

### Components
- `media.repo.ts` — جدول `media_metadata` در D1 برای ذخیره تاریخچه رسانه
- `media-pipeline.service.ts` — پردازشگر یکپارچه با خروجی ساختاریافته
- `multi-modal context` — افزودن context رسانه‌های قبلی به system prompt

### Outcome
AI می‌تواند به رسانه‌های قبلی ارجاع دهد: «عکسی که دیروز فرستادی رو با PDF امروز مقایسه کن»

---

## Phase 2: Cross-modal Reasoning
AI می‌تواند بین مدالیته‌های مختلف ارتباط برقرار کند.

- ارجاع به رسانه در history مکالمه
- تحلیل ترکیبی چند رسانه (تصویر + صدا + متن)
- سوالات cross-modal: «این صدا مربوط به همون عکسی بود که فرستادی؟»

### Outcome
AI مانند یک انسان بین مدالیته‌ها جابجا می‌شود.

---

## Phase 3: Multi-modal Output
AI می‌تواند پاسخ‌های ترکیبی شامل چند نوع رسانه تولید کند.

- AI می‌تواند درخواست تولید تصویر بدهد: `[GENERATE_IMAGE: prompt]`
- پاسخ متنی + تصویری همزمان
- گزینه پاسخ صوتی خودکار برای متن‌های طولانی
- تولید دیاگرام و چارت برای داده‌ها

### Outcome
پاسخ‌های غنی و چندبعدی.

---

## Phase 4: Smart Modality Selection
AI به صورت هوشمند بهترین مدالیته را برای پاسخ انتخاب می‌کند.

- تشخیص خودکار اینکه کاربر در موبایل است (متن طولانی → صدا)
- تولید خودکار اینفوگرافیک برای داده‌های عددی
- ترکیب پویای مدالیته‌ها بر اساس محتوا

### Outcome
تجربه کاربری تطبیقی و هوشمند.
