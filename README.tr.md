<div align="center">
  <br/>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/🤖_AI_Telegram_Bot-v2.2.0-22C55E?style=for-the-badge&labelColor=1a1a2e&color=00d4aa">
    <img alt="AI Telegram Bot" src="https://img.shields.io/badge/🤖_AI_Telegram_Bot-v2.2.0-22C55E?style=for-the-badge&labelColor=f0f0f0&color=00d4aa" height="40">
  </picture>

  <br/><br/>

  <p><strong>Sunucusuz • Tip-Güvenli • Çok Dilli • 68 Karakter • RAG • Kod Alanı</strong></p>

  <p>
    Tamamen Cloudflare Workers üzerinde çalışan, üretim kalitesinde bir Telegram AI asistanı.<br/>
    Workers AI tarafından desteklenir — küresel olarak dağıtık, sıfır soğuk başlangıç, tamamen tipli.
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
    <a href="#"><img src="https://img.shields.io/badge/tests-173_passing-22C55E?style=flat-square&logo=vitest&logoColor=white" alt="Testler"/></a>
    <a href="#"><img src="https://img.shields.io/badge/coverage-87%25-22C55E?style=flat-square&logo=istanbul&logoColor=white" alt="Kapsama"/></a>
    <a href="#"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="Lisans"/></a>
    <a href="#"><img src="https://img.shields.io/badge/bundle-487_kB-FF6B6B?style=flat-square&logo=esbuild&logoColor=white" alt="Paket Boyutu"/></a>
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

<h2>📋 İçindekiler</h2>

<p>
  <a href="#-özellikler">Özellikler</a> •
  <a href="#-hızlı-başlangıç">Hızlı Başlangıç</a> •
  <a href="#-komutlar">Komutlar</a> •
  <a href="#-ai-modelleri">AI Modelleri</a> •
  <a href="#-karakterler">Karakterler</a> •
  <a href="#-mimari">Mimari</a> •
  <a href="#-grup-bağlam-sistemi">Grup Bağlamı</a> •
  <a href="#-yapılandırma">Yapılandırma</a> •
  <a href="#-api-uç-noktaları">API</a> •
  <a href="#-proje-yapısı">Yapı</a> •
  <a href="#-yerel-geliştirme">Geliştirme</a>
</p>

---

<h2>✨ Özellikler</h2>

<table>
  <tr>
    <td align="center" width="14%">💬</td>
    <td width="36%"><strong>AI Sohbet</strong><br/><sub>Bağlam bilincine sahip, 10 seçilebilir model</sub></td>
    <td align="center" width="14%">🎭</td>
    <td width="36%"><strong>68 Karakter</strong><br/><sub>9 kategori + sınırsız özel</sub></td>
  </tr>
  <tr>
    <td align="center">🖼️</td>
    <td><strong>Görsel Oluşturma</strong><br/><sub>9 model: SDXL, Flux, Lightning, Lucid, FLUX.2 Klein 4B/9B, Phoenix, Dreamshaper</sub></td>
    <td align="center">👁️</td>
    <td><strong>Görsel Anlama</strong><br/><sub>AI her fotoğrafı tanımlar</sub></td>
  </tr>
  <tr>
    <td align="center">🌐</td>
    <td><strong>Web Arama</strong><br/><sub>Brave Search API ile desteklenir</sub></td>
    <td align="center">🔗</td>
    <td><strong>Web Gezintisi</strong><br/><sub>Herhangi bir URL'yi getir ve özetle</sub></td>
  </tr>
  <tr>
    <td align="center">📄</td>
    <td><strong>Dosya Okuma</strong><br/><sub>PDF, TXT, DOC satır içi ayrıştırma</sub></td>
    <td align="center">🎙️</td>
    <td><strong>Ses Yazıya Çevirme</strong><br/><sub>Whisper destekli</sub></td>
  </tr>
  <tr>
    <td align="center">🗂️</td>
    <td><strong>Çoklu Oturum</strong><br/><sub>Bağımsız sohbet başlıkları</sub></td>
    <td align="center">📤</td>
    <td><strong>Dışa Aktar</strong><br/><sub>.txt geçmişini indir</sub></td>
  </tr>
  <tr>
    <td align="center">🌍</td>
    <td><strong>5 Dil</strong><br/><sub>EN · FA · AR · TR · RU</sub></td>
    <td align="center">👍</td>
    <td><strong>Geri Bildirim Düğmeleri</strong><br/><sub>Her yanıt için kalite takibi</sub></td>
  </tr>
  <tr>
    <td align="center">🛡️</td>
    <td><strong>Hız Sınırlama</strong><br/><sub>Kullanıcı başına kısıtlama + bekleme süresi</sub></td>
    <td align="center">🛠️</td>
    <td><strong>Yönetici Paneli</strong><br/><sub>Duyuru, istatistik, engelleme, temizlik</sub></td>
  </tr>
  <tr>
    <td align="center">📊</td>
    <td><strong>Analitik</strong><br/><sub>Kullanım metrikleri + aktif kullanıcılar</sub></td>
    <td align="center">🧹</td>
    <td><strong>Otomatik Temizlik</strong><br/><sub>Otomatik eski veri dönüşümü</sub></td>
  </tr>
  <tr>
    <td align="center">👥</td>
    <td><strong>Grup Bağlam Motoru</strong><br/><sub>Kullanıcı başına 50 mesaj penceresi + yanıt zinciri takibi</sub></td>
    <td align="center">🧵</td>
    <td><strong>Zincir Farkındalığı</strong><br/><sub>5 seviyeye kadar tam yanıt zinciri çözümü</sub></td>
  </tr>
  <tr>
    <td align="center">@</td>
    <td><strong>Satır İçi Mod</strong><br/><sub>Herhangi bir sohbette <code>@bot query</code> yaz</sub></td>
    <td align="center">🔊</td>
    <td><strong>Metinden Sese</strong><br/><sub>Melo TTS ile 5 dil desteği</sub></td>
  </tr>
  <tr>
    <td align="center">⚡</td>
    <td><strong>Akış Yanıtları</strong><br/><sub>AI düşünürken gerçek zamanlı metin</sub></td>
    <td align="center">🎭</td>
    <td><strong>Çoklu Ajan İşbirliği</strong><br/><sub><code>/debate</code> iki karakter her konuyu tartışır</sub></td>
  </tr>
  <tr>
    <td align="center">📅</td>
    <td><strong>Günlük İpuçları</strong><br/><sub>AI tarafından oluşturulan günaydın mesajları ve özel gün vurguları</sub></td>
    <td align="center">⏰</td>
    <td><strong>Hatırlatma Sistemi</strong><br/><sub>Özel hatırlatıcılar — tarih/saat seçici ve tekrarlama</sub></td>
  </tr>
  <tr>
    <td align="center">🗳️</td>
    <td><strong>Topluluk Oylaması</strong><br/><sub>Paralel 3 model sorgulama, hakem ile en iyiyi seçme</sub></td>
    <td align="center">🧠</td>
    <td><strong>Uyarlanabilir Karakter</strong><br/><sub>AI kullanıcı geri bildirimlerinden özellikler öğrenir</sub></td>
  </tr>
  <tr>
    <td align="center">🧭</td>
    <td><strong>Otomatik Yönlendirme</strong><br/><sub>Mesaj sınıflandırma → en iyi modele yönlendirme</sub></td>
    <td align="center">📚</td>
    <td><strong>RAG</strong><br/><sub><code>/learn</code> + <code>/forget</code> kişisel bilgi tabanı</sub></td>
  </tr>
  <tr>
    <td align="center">💻</td>
    <td><strong>Kod Alanı</strong><br/><sub><code>/run</code> 20 dilde Piston API ile</sub></td>
    <td align="center">🧵</td>
    <td><strong>AI Hafızası</strong><br/><sub>Otomatik konuşma özetleme ve bağlam hatırlama</sub></td>
  </tr>
  <tr>
    <td align="center">📊</td>
    <td><strong>Kullanıcı Zamanlaması</strong><br/><sub>Kullanıcı başına yanıt süresi analizi</sub></td>
    <td align="center">🛡️</td>
    <td><strong>Girdi Sertleştirme</strong><br/><sub>10k karakter sınırı, yapılandırılmış günlükleme</sub></td>
  </tr>
  <tr>
    <td align="center">🏷️</td>
    <td><strong>Çıkartma / Konum / Kişi</strong><br/><sub>Çok modlu mesaj türü desteği</sub></td>
    <td align="center"></td>
    <td></td>
  </tr>
</table>

---

<h2>🚀 Hızlı Başlangıç</h2>

<h3>Ön Koşullar</h3>

<table>
  <tr>
    <td>☁️</td>
    <td><a href="https://dash.cloudflare.com/">Cloudflare hesabı</a></td>
  </tr>
  <tr>
    <td>🤖</td>
    <td><a href="https://t.me/botfather">Telegram Bot Token</a> — @BotFather'dan</td>
  </tr>
  <tr>
    <td>📦</td>
    <td><a href="https://nodejs.org/">Node.js</a> 18+ (yalnızca CLI dağıtımı)</td>
  </tr>
</table>

<br/>

<h3>3 Dakikada Dağıtım</h3>

<table>
  <tr>
    <th>Adım</th>
    <th>Komut</th>
    <th>Açıklama</th>
  </tr>
  <tr>
    <td>1</td>
    <td><code>git clone https://github.com/RealClickClick/worker-ai-chatbot.git && cd worker-ai-chatbot && npm install</code></td>
    <td>Klonla ve kur</td>
  </tr>
  <tr>
    <td>2</td>
    <td><code>npx wrangler d1 create ai-telegram-bot-db</code></td>
    <td>D1 veritabanı oluştur → <b>id'yi <code>wrangler.toml</code> dosyasına kopyala</b></td>
  </tr>
  <tr>
    <td>3</td>
    <td>
      <code>npx wrangler secret put TELEGRAM_BOT_TOKEN</code><br/>
      <code>npx wrangler secret put BRAVE_API_KEY</code>  <i>(isteğe bağlı)</i><br/>
      <code>npx wrangler secret put GOOGLE_GEMINI_API_KEY</code>  <i>(isteğe bağlı)</i><br/>
      <code>npx wrangler secret put WEBHOOK_SECRET</code> <i>(isteğe bağlı)</i><br/>
      <code>npx wrangler secret put ADMIN_IDS</code>     <i>(isteğe bağlı)</i>
    </td>
    <td>Gizli anahtarları ayarla</td>
  </tr>
  <tr>
    <td>4</td>
    <td><code>npx wrangler deploy</code></td>
    <td>Cloudflare'e dağıt</td>
  </tr>
</table>

<br/>

<details>
<summary><strong>☁️ Alternatif: Cloudflare Kontrol Paneli (komut satırı araçları gerekmez)</strong></summary>

<br/>

1. [Cloudflare Dashboard](https://dash.cloudflare.com/)'a gidin → **Workers & Pages** → **Create Application** → **Create Worker**

   ![Adım 1: Uygulama Oluştur](docs/setup-screenshots/01-create-application.png)

2. Varsayılan **"Hello World"** şablonunu koruyun ve **Deploy**'a tıklayın

   ![Adım 2: Hello World ile Başla](docs/setup-screenshots/02-start-hello-world.png)
   ![Adım 3: Dağıt](docs/setup-screenshots/03-deploy-hello-world.png)

3. Worker kontrol panelinde **Edit code**'a tıklayın

   ![Adım 4: Dashboard'da Kodu Düzenle](docs/setup-screenshots/04-dashboard-edit-code.png)

4. Tüm Hello World kodunu seçin → [`dist/worker.bundle.js`](dist/worker.bundle.js) içeriğini yapıştırın → **Save and Deploy**'a tıklayın

   ![Adım 5: Kodu Yapıştır ve Dağıt](docs/setup-screenshots/05-paste-code-deploy.png)

5. **Settings → Variables and Secrets**'e gidin ve şu ortam değişkenlerini ekleyin:

   - `TELEGRAM_BOT_TOKEN` — [@BotFather](https://t.me/BotFather)'dan bot tokeni
   - `WORKER_DOMAIN` — `your-worker-name.your-subdomain.workers.dev`
   - `ADMIN_IDS` — Telegram kullanıcı ID'niz (isteğe bağlı)
   - `BRAVE_API_KEY` — web arama için (isteğe bağlı)
   - `GOOGLE_GEMINI_API_KEY` — Gemini modelleri için (isteğe bağlı)
   - `WEBHOOK_SECRET` — webhook doğrulaması için (isteğe bağlı)
   - `BOT_NAME` — özel bot adı (isteğe bağlı)
   - `BOT_DESCRIPTION` — ek sistem talimatları (isteğe bağlı)

   ![Adım 6: Değişken Ayarları](docs/setup-screenshots/06-settings-variables.png)
   ![Adım 7: Telegram Token Ekle](docs/setup-screenshots/07-add-telegram-token.png)
   ![Adım 8: Worker Domain Ekle](docs/setup-screenshots/08-add-worker-domain.png)

6. **Workers & Pages** → worker'ınız → **Settings** → **Bindings** → **Add binding** → **D1 Database** seçin → adını `DB` olarak ayarlayın

   ![Adım 9: Binding Ekle](docs/setup-screenshots/09-bindings-add-binding.png)
   ![Adım 10: D1 Database Ekle](docs/setup-screenshots/10-add-d1-database.png)

7. **Bindings** → **Add binding** → **Workers AI** seçin → adını `AI` olarak ayarlayın

   ![Adım 11: Workers AI Ekle](docs/setup-screenshots/11-add-workers-ai.png)
   ![Adım 12: AI Binding Yapılandır](docs/setup-screenshots/12-configure-ai-binding.png)

8. `https://your-worker.workers.dev/init` adresini ziyaret edin — tüm veritabanı tablolarını oluşturur

   ![Adım 13: Veritabanını Başlat](docs/setup-screenshots/13-init-database.png)

9. `https://your-worker.workers.dev/setWebhook` adresini ziyaret edin — webhook URL'sini Telegram'a kaydeder

   ![Adım 14: Webhook Ayarla](docs/setup-screenshots/14-set-webhook.png)

</details>

<br/>

<h3>Dağıtım Sonrası</h3>

<table>
  <tr>
    <th>Uç Nokta</th>
    <th>Amaç</th>
  </tr>
  <tr>
    <td><code>https://your-worker.workers.dev/init</code></td>
    <td>Veritabanı tablolarını oluştur ve migrasyonları çalıştır</td>
  </tr>
  <tr>
    <td><code>https://your-worker.workers.dev/setWebhook</code></td>
    <td>Webhook URL'sini Telegram'a kaydet</td>
  </tr>
</table>

> ✅ **Tamamlandı.** Botunuz canlı — başka bir kurulum gerektirmez.

---

<h2>🎮 Komutlar</h2>

<table>
  <tr>
    <th>Komut</th>
    <th>Argümanlar</th>
    <th>Açıklama</th>
  </tr>
  <tr>
    <td><code>/start</code></td>
    <td>—</td>
    <td>Ayarlar menüsüyle karşılama mesajı</td>
  </tr>
  <tr>
    <td><code>/help</code></td>
    <td>—</td>
    <td>Eksiksiz komut referansı</td>
  </tr>
  <tr>
    <td><code>/mode</code></td>
    <td>—</td>
    <td>Karakter ve ayar seçimini aç</td>
  </tr>
  <tr>
    <td><code>/model</code></td>
    <td>—</td>
    <td>AI modelini değiştir</td>
  </tr>
  <tr>
    <td><code>/lang</code></td>
    <td>—</td>
    <td>Dili değiştir</td>
  </tr>
  <tr>
    <td><code>/image</code></td>
    <td><code>&lt;prompt&gt;</code></td>
    <td>Görsel oluştur</td>
  </tr>
  <tr>
    <td><code>/search</code></td>
    <td><code>&lt;sorgu&gt;</code></td>
    <td>Web'de Brave ile ara</td>
  </tr>
  <tr>
    <td><code>/translate</code></td>
    <td><code>&lt;metin&gt;</code></td>
    <td>Geçerli dile çevir</td>
  </tr>
  <tr>
    <td><code>/summarize</code></td>
    <td>—</td>
    <td>Son konuşmayı özetle</td>
  </tr>
  <tr>
    <td><code>/instructions</code></td>
    <td><code>&lt;metin&gt;</code> · <code>reset</code></td>
    <td>Özel AI davranışı belirle</td>
  </tr>
  <tr>
    <td><code>/newpersona</code></td>
    <td><code>İsim \| Açıklama</code> · <code>list</code> · <code>del &lt;n&gt;</code></td>
    <td>Özel karakter oluştur / yönet</td>
  </tr>
  <tr>
    <td><code>/session</code></td>
    <td><code>new &lt;n&gt;</code> · <code>&lt;id&gt;</code> · <code>list</code> · <code>rename</code> · <code>del</code></td>
    <td>Çoklu oturum yönetimi</td>
  </tr>
  <tr>
    <td><code>/export</code></td>
    <td>—</td>
    <td>Konuşmayı <code>.txt</code> olarak indir</td>
  </tr>
  <tr>
    <td><code>/clear</code></td>
    <td>—</td>
    <td>Hafızayı, ayarları, oturumları sıfırla</td>
  </tr>
  <tr>
    <td><code>/stats</code></td>
    <td>—</td>
    <td>Geçerli profil ve kullanımı göster</td>
  </tr>
  <tr>
    <td><code>/tts</code></td>
    <td><code>&lt;text&gt;</code></td>
    <td>Metni sese çevir (Farsça, İngilizce, Arapça, Türkçe, Rusça)</td>
  </tr>
  <tr>
    <td><code>/debate</code></td>
    <td><code>&lt;topic&gt;</code></td>
    <td>İki karakter arasında çoklu ajan tartışması başlat</td>
  </tr>
  <tr>
    <td><code>/daily</code></td>
    <td>—</td>
    <td>AI tarafından oluşturulan günlük ipuçlarını & özel gün vurgularını aç/kapat</td>
  </tr>
  <tr>
    <td><code>/remind</code></td>
    <td>—</td>
    <td>Özel hatırlatıcı oluştur (4 adımlı sihirbaz: başlık → tarih → saat → tekrarlama)</td>
  </tr>
  <tr>
    <td><code>/reminders</code></td>
    <td>—</td>
    <td>Aktif hatırlatıcıları listele ve yönet</td>
  </tr>
  <tr>
    <td><code>/cancel</code></td>
    <td>—</td>
    <td>Mevcut hatırlatıcı oluşturma sihirbazını iptal et</td>
  </tr>
  <tr>
    <td><code>/learn</code></td>
    <td><code>&lt;text&gt;</code></td>
    <td>Bot'a öğret — kişisel bilgi tabanına kaydet (RAG)</td>
  </tr>
  <tr>
    <td><code>/forget</code></td>
    <td>—</td>
    <td>Kaydedilmiş bilgiyi temizle</td>
  </tr>
  <tr>
    <td><code>/run</code></td>
    <td><code>&lt;lang&gt; &lt;code&gt;</code></td>
    <td>Kodu 20 dilde Piston API ile çalıştır</td>
  </tr>
  <tr>
    <td><code>/feedback</code></td>
    <td><code>&lt;message&gt;</code></td>
    <td>Geri bildirim gönder</td>
  </tr>
  <tr>
    <td><code>/admin</code></td>
    <td><code>stats</code> · <code>broadcast</code> · <code>block</code> · <code>unblock</code> · <code>blocked</code> · <code>cleanup</code></td>
    <td>Yönetici paneli <sub>(kısıtlı)</sub></td>
  </tr>
</table>

---

<h2>🤖 AI Modelleri</h2>

<table>
  <tr>
    <th></th>
    <th>Anahtar</th>
    <th>Model ID</th>
    <th>Parametre</th>
    <th>Görüntü İşleme</th>
    <th>En Uygun</th>
  </tr>
  <tr>
    <td>⚡</td>
    <td><code>fast</code></td>
    <td><code>@cf/meta/llama-3.1-8b-instruct-fast</code></td>
    <td>8B</td>
    <td align="center">—</td>
    <td>Yüksek işlem hacmi, hızlı yanıtlar</td>
  </tr>
  <tr>
    <td>⚖️</td>
    <td><code>balanced</code></td>
    <td><code>@cf/deepseek-ai/deepseek-r1-distill-qwen-32b</code></td>
    <td>32B</td>
    <td align="center">—</td>
    <td>Genel amaçlı, kalite/hız dengesi</td>
  </tr>
  <tr>
    <td>🧠</td>
    <td><code>powerful</code></td>
    <td><code>@cf/meta/llama-3.3-70b-instruct-fp8-fast</code></td>
    <td>70B</td>
    <td align="center">—</td>
    <td>Karmaşık akıl yürütme, derin analiz</td>
  </tr>
  <tr>
    <td>🇨🇳</td>
    <td><code>glm</code></td>
    <td><code>@cf/zai-org/glm-4.7-flash</code></td>
    <td>—</td>
    <td align="center">—</td>
    <td>Çok dilli, hızlı çıkarım</td>
  </tr>
  <tr>
    <td>👁️</td>
    <td><code>vision</code></td>
    <td><code>@cf/meta/llama-3.2-11b-vision-instruct</code></td>
    <td>11B</td>
    <td align="center">✅</td>
    <td>Görsel anlama ve tanımlama</td>
  </tr>
  <tr>
    <td>🦙</td>
    <td><code>llama4</code></td>
    <td><code>@cf/meta/llama-4-scout-17b-16e-instruct</code></td>
    <td>17B</td>
    <td align="center">—</td>
    <td>En yeni nesil MoE</td>
  </tr>
  <tr>
    <td>🔬</td>
    <td><code>gemma4</code></td>
    <td><code>@cf/google/gemma-4-26b-a4b-it</code></td>
    <td>26B</td>
    <td align="center">—</td>
    <td>Kompakt, verimli</td>
  </tr>
  <tr>
    <td>💻</td>
    <td><code>qwen_coder</code></td>
    <td><code>@cf/qwen/qwen2.5-coder-32b-instruct</code></td>
    <td>32B</td>
    <td align="center">—</td>
    <td>Kod oluşturma ve teknik görevler</td>
  </tr>
  <tr>
    <td>✨</td>
    <td><code>gemini_flash</code></td>
    <td><code>gemini-2.5-flash</code></td>
    <td>—</td>
    <td align="center">—</td>
    <td>Hızlı ve uygun maliyetli (Google API ile)</td>
  </tr>
  <tr>
    <td>✨</td>
    <td><code>gemini_flash_3</code></td>
    <td><code>gemini-3-flash</code></td>
    <td>—</td>
    <td align="center">—</td>
    <td>En yeni Gemini, çok modlu (Google API ile)</td>
  </tr>
</table>

<br/>

<h3>Görsel Oluşturma Modelleri</h3>

<table>
  <tr>
    <th></th>
    <th>Anahtar</th>
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

<h2>🎭 Karakterler</h2>

<p>
  <strong>9 kategori</strong>de <strong>68 karakter</strong> — her biri 5 dilde tamamen tanımlanmıştır.<br/>
  <code>/mode</code> ile seçin veya <code>/newpersona İsim | Açıklama</code> ile kendi karakterinizi oluşturun.
</p>

<br/>

<table>
  <tr>
    <th>Kategori</th>
    <th align="center">#</th>
    <th>Karakterler</th>
  </tr>
  <tr>
    <td>💼 İş & Hukuk</td>
    <td align="center">8</td>
    <td>Avukat, CEO, Muhasebeci, Pazarlamacı, Girişimci, Yatırımcı, Danışman, İK Yöneticisi</td>
  </tr>
  <tr>
    <td>💻 Bilim & Teknoloji</td>
    <td align="center">8</td>
    <td>Hacker, Geliştirici, Veri Bilimci, Siber Güvenlik Uzmanı, Fizikçi, Kimyager, Astronom, Matematikçi</td>
  </tr>
  <tr>
    <td>🏥 Sağlık & Zindelik</td>
    <td align="center">6</td>
    <td>Doktor, Terapist, Diyetisyen, Psikiyatrist, Antrenör, Yogist</td>
  </tr>
  <tr>
    <td>🎨 Sanat & Kültür</td>
    <td align="center">8</td>
    <td>Şair, Yazar, Müzisyen, Ressam, Tasarımcı, Mimar, Film Yapımcısı, Fotoğrafçı</td>
  </tr>
  <tr>
    <td>🌍 Fantazi & Macera</td>
    <td align="center">8</td>
    <td>Büyücü, Şövalye, Korsan, Uzaylı, Vampir, Elf, Ejderha, Cadı</td>
  </tr>
  <tr>
    <td>🎭 Kişilik & Mizah</td>
    <td align="center">10</td>
    <td>Sorgulayıcı, Depresif, Motive Edici, Karen, İnek, Z Kuşağı, Dede, Romantik, Komedyen, Komplocu</td>
  </tr>
  <tr>
    <td>🐾 Hayvanlar & Doğa</td>
    <td align="center">6</td>
    <td>Kedi, Köpek, Aslan, Baykuş, Yunus, Panda</td>
  </tr>
  <tr>
    <td>👑 Tarih & Toplum</td>
    <td align="center">8</td>
    <td>Kral, Kraliçe, Samuray, Kâşif, Dedektif, Casus, Gazeteci, Filozof</td>
  </tr>
  <tr>
    <td>🙏 Spiritüel & Mistik</td>
    <td align="center">6</td>
    <td>Rahip, Peygamber, Şaman, Kahin, Mistik, Bilge</td>
  </tr>
</table>

---

<h2>🏗️ Mimari</h2>

<pre>
                           ┌─────────────────────────────────────┐
                           │        Cloudflare Worker            │
                           │     (edge — 50+ lokasyon)           │
                           │                                     │
  Telegram ──POST /──►     │  src/index.ts                       │
   (webhook)     │         │  ├─ gizli anahtar doğrulama         │
                 │         │  ├─ rota dağıtımı                   │
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
                           Telegram Kullanıcısı
</pre>

<h3>Veri Akışı</h3>

<pre>
  ① Telegram → POST /  (secret_token ile doğrulanır)
  ② index.ts → JSON ayrıştır, yükü doğrula
  ③ message.ts → sınıflandır: metin / fotoğraf / ses / dosya / URL / komut
  ④ db.ts → kullanıcı ayarlarını yükle (karakter, model, oturum, dil)
  ⑤ ai.ts → sistem promptu oluştur + son sohbet geçmişini getir
  ⑥ Workers AI → çıkarım çalıştır (LLM / vision / Whisper / SDXL)
  ⑦ htmlParser.ts → Markdown'ı Telegram HTML'sine dönüştür
  ⑧ telegram.ts → biçimlendirilmiş yanıt + geri bildirim düğmeleri gönder
  ⑨ db.ts → kullanıcı mesajı ve AI yanıtını D1'e kaydet
</pre>

<h3>Teknoloji Yığını</h3>

<table>
  <tr>
    <th>Katman</th>
    <th>Teknoloji</th>
    <th>Neden</th>
  </tr>
  <tr>
    <td>⚡ Çalışma Zamanı</td>
    <td><a href="https://workers.cloudflare.com/">Cloudflare Workers</a></td>
    <td>Küresel edge hesaplama, sıfır soğuk başlangıç (ES2022)</td>
  </tr>
  <tr>
    <td>📝 Dil</td>
    <td><a href="https://www.typescriptlang.org/">TypeScript</a> 5.7</td>
    <td>Tamamen tipli — <code>noImplicitAny</code> zorunlu, 0 tsc hatası</td>
  </tr>
  <tr>
    <td>📦 Paketleyici</td>
    <td><a href="https://esbuild.github.io/">esbuild</a></td>
    <td>Anında derleme, 305 kB küçültülmüş çıktı</td>
  </tr>
  <tr>
    <td>🗄️ Veritabanı</td>
    <td><a href="https://developers.cloudflare.com/d1/">D1 (SQLite)</a></td>
    <td>Otomatik migrasyon, 3 indeks, otomatik eski veri temizliği</td>
  </tr>
  <tr>
    <td>🤖 AI</td>
    <td><a href="https://developers.cloudflare.com/workers-ai/">Workers AI</a></td>
    <td>10 sohbet modeli + 5 görsel modeli + Whisper</td>
  </tr>
  <tr>
    <td>🧪 Test</td>
    <td><a href="https://vitest.dev/">Vitest</a></td>
    <td>173 test (birim + entegrasyon webhook akışı)</td>
  </tr>
  <tr>
    <td>🔍 Linting</td>
    <td>ESLint (testler) + <code>tsc --noEmit</code> (kaynak)</td>
    <td>Ayrı sorumluluklar — tip güvenliği + kod kalitesi</td>
  </tr>
  <tr>
    <td>🎨 Biçimlendirme</td>
    <td><a href="https://prettier.io/">Prettier</a></td>
    <td>Tutarlı kod stili</td>
  </tr>
</table>

---

<h3>Grup Bağlam Sistemi</h3>

<p>Bot, grup sohbetlerine akıllıca katılım için profesyonel bir <strong>Grup Bağlam Motoru</strong>na sahiptir. Bir gruba eklendiğinde, kullanıcı başına mesaj pencerelerini (her kullanıcı için 50 mesaj) takip eder, yanıt zincirlerini çözer ve doğru AI yanıtları için yapılandırılmış bağlam oluşturur.</p>

<h4>Veritabanı Katmanı — <code>group_messages</code> Tablosu</h4>

<pre>
group_messages (
  id                  INTEGER PRIMARY KEY    -- Otomatik artan
  chat_id             TEXT NOT NULL           -- Grup kimliği
  user_id             TEXT NOT NULL           -- Gönderenin Telegram kimliği
  message_id          INTEGER NOT NULL       -- Telegram mesaj kimliği
  role                TEXT NOT NULL           -- 'user' | 'assistant'
  content             TEXT NOT NULL           -- İşlenmiş mesaj metni
  reply_to_message_id INTEGER                -- Üst mesaj kimliği (isteğe bağlı)
  reply_to_user_id    TEXT                    -- Üst mesaj göndereni (isteğe bağlı)
  reply_to_content    TEXT                    -- Üst metnin anlık görüntüsü (isteğe bağlı)
  thread_id           TEXT                    -- Zincir grup kimliği (isteğe bağlı)
  user_name           TEXT NOT NULL DEFAULT ''-- Görünen ad
  created_at          TEXT DEFAULT (datetime('now'))
)
</pre>

<p><strong>4 dizin</strong> optimal sorgular için:</p>
<ul>
  <li><code>(chat_id, user_id, created_at)</code> — kullanıcı başına 50 mesaj penceresi</li>
  <li><code>(chat_id, message_id)</code> — yanıt bağımlılığı çözümlemesi</li>
  <li><code>(chat_id, created_at)</code> — genel grup ortam bağlamı</li>
  <li><code>(chat_id, thread_id, created_at)</code> — tam yanıt zinciri sorguları</li>
</ul>

<h4>Çekirdek Modül — <code>src/group-context.ts</code></h4>

<p><strong>Üç Katmanlı Bağlam Oluşturma</strong> — Her grup mesajı için önceliklendirilmiş bir bağlam birleştirilir:</p>

<pre>
buildGroupContext(chatId, userId, message)
  │
  ├── Katman 1: Yanıt Zinciri (en yüksek öncelik)
  │   ├── resolveReplyChain() — reply_to'yu 5 seviyeye kadar takip eder
  │   └── biçim: "[Reply Chain] @user: msg → @user2: reply → Bot: response"
  │
  ├── Katman 2: Kullanıcı Penceresi (orta öncelik)
  │   ├── getUserWindow() — belirli kullanıcının son 50 mesajı
  │   └── biçim: "[User History (last 50)] @user: text  @user: text  Bot: text"
  │
  └── Katman 3: Ortam Bağlamı (düşük öncelik)
      ├── getAmbientContext() — son 5 genel grup mesajı
      └── biçim: "[Recent Group Activity] @user3: msg  @user4: msg"
</pre>

<p><strong>Anahtar tasarım kararları:</strong></p>
<ul>
  <li><strong>Anlık Görüntüler</strong>: <code>reply_to_content</code>, veritabanından değil, Telegram'ın <code>reply_to_message</code> nesnesinden alınır — üst mesaj 50 mesajlık pencerenin dışına çıksa bile bağlamı korur</li>
  <li><strong>İplik Devralma</strong>: Bir kullanıcı bir mesaja yanıt verdiğinde, <code>thread_id</code> üst öğeden devralınır (veya yoksa oluşturulur)</li>
  <li><strong>Otomatik Kırpma</strong>: Her ekleme, her kullanıcının penceresini tam olarak 50 mesajda tutmak için <code>trimGroupHistory()</code> işlevini tetikler</li>
  <li><strong>Mesaj Kırpma</strong>: Bağlamdaki her mesaj, token verimliliği için 200 karakterle sınırlandırılır</li>
</ul>

<h4>Grup Bilinçli Sistem Komutu</h4>

<p><code>src/ai.ts</code> içindeki <code>buildGroupSystemPrompt()</code> işlevi, 5 dilde grup kurallarıyla özel bir sistem komutu oluşturur:</p>

<pre>
[GROUP CHAT RULES]
- This is a group chat with multiple users. Each message is prefixed with the sender's name.
- Pay attention to who said what and maintain conversation context.
- When replying to a specific user, address them by name.
- Use the reply chain context to understand threaded conversations.
- Only respond when directly addressed or when you have something valuable to add.
</pre>

<h4>Tam Grup Akışı</h4>

<pre>
① Telegram grup mesajı gönderir
② Grup filtresi: bahsedilmiş / bot'a yanıt / komut?
③ storeGroupMessageAndGetInfo() — kaydet + thread_id belirle + kırp
④ Medyayı işle (fotoğraf → Vision, ses → Whisper, dosya → çıkar)
⑤ buildGroupContext() — 3 katmanlı bağlam oluştur
⑥ buildGroupSystemPrompt() — karakter + grup kuralları + bağlam
⑦ runChat() → Workers AI zenginleştirilmiş sistem komutuyla
⑧ storeBotGroupMessage() — bot yanıtını kaydet
⑨ sendMessage() — geri bildirim düğmeleriyle biçimlendirilmiş yanıt
</pre>

<h4>DM vs Grup Karşılaştırması</h4>

<table>
  <tr>
    <th>Yön</th>
    <th>Özel Mesaj</th>
    <th>Grup</th>
  </tr>
  <tr>
    <td>Geçmiş kaynağı</td>
    <td><code>chat_history</code> tablosu (son 8 mesaj)</td>
    <td><code>group_messages</code> tablosu (kullanıcı başına 50 + zincir + ortam)</td>
  </tr>
  <tr>
    <td>Sistem komutu</td>
    <td><code>buildSystemPrompt()</code> — standart</td>
    <td><code>buildGroupSystemPrompt()</code> — grup kurallarıyla</td>
  </tr>
  <tr>
    <td>Yanıt takibi</td>
    <td>Yok</td>
    <td>Tam zincir çözümlemesi (5 seviyeye kadar)</td>
  </tr>
  <tr>
    <td>Depolama</td>
    <td><code>addChatMessage()</code> → <code>chat_history</code></td>
    <td><code>addGroupMessage()</code> → <code>group_messages</code></td>
  </tr>
  <tr>
    <td>Kullanıcı izolasyonu</td>
    <td>Tek kullanıcı</td>
    <td>Kullanıcı başına 50 mesaj penceresi</td>
  </tr>
  <tr>
    <td>Geçmiş temizliği</td>
    <td><code>trimHistory()</code> — genel sınır</td>
    <td><code>trimGroupHistory()</code> — kullanıcı başı sınır + <code>cleanupOldGroupData()</code></td>
  </tr>
</table>

---

<h2>⚙️ Yapılandırma</h2>

<table>
  <tr>
    <th>Değişken</th>
    <th align="center">Gerekli</th>
    <th>Açıklama</th>
  </tr>
  <tr>
    <td><code>TELEGRAM_BOT_TOKEN</code></td>
    <td align="center">✅</td>
    <td><a href="https://t.me/botfather">@BotFather</a>'dan alınan bot tokeni</td>
  </tr>
  <tr>
    <td><code>WORKER_DOMAIN</code></td>
    <td align="center">✅</td>
    <td>Worker URL'niz (<code>wrangler.toml</code> içinde ayarlanır)</td>
  </tr>
  <tr>
    <td><code>WEBHOOK_SECRET</code></td>
    <td align="center">—</td>
    <td>Webhook isteği doğrulaması için gizli anahtar</td>
  </tr>
  <tr>
    <td><code>ADMIN_IDS</code></td>
    <td align="center">—</td>
    <td>Yönetici erişimine sahip virgülle ayrılmış Telegram kullanıcı ID'leri</td>
  </tr>
  <tr>
    <td><code>BRAVE_API_KEY</code></td>
    <td align="center">—</td>
    <td><a href="https://brave.com/search/api/">Brave Search</a>'den <code>/search</code> için API anahtarı</td>
  </tr>
  <tr>
    <td><code>GOOGLE_GEMINI_API_KEY</code></td>
    <td align="center">—</td>
    <td>Gemini modelleri için Google AI Studio API anahtarı (<a href="https://aistudio.google.com/apikey">bir tane al</a>)</td>
  </tr>
</table>

<p><code>DB</code> adında bir D1 bağlantısı ve <code>AI</code> adında bir Workers AI bağlantısı gereklidir. Veritabanı şeması (12 tablo), yerleşik migrasyon sistemi aracılığıyla ilk <code>/init</code>'te otomatik olarak oluşturulur.</p>

---

<h2>🔌 API Uç Noktaları</h2>

<table>
  <tr>
    <th>Uç Nokta</th>
    <th>Yöntem</th>
    <th>Amaç</th>
  </tr>
  <tr>
    <td><code>/</code></td>
    <td><code>POST</code></td>
    <td>Telegram webhook alıcısı</td>
  </tr>
  <tr>
    <td><code>/</code></td>
    <td><code>GET</code></td>
    <td>Durum sayfası</td>
  </tr>
  <tr>
    <td><code>/init</code></td>
    <td><code>GET</code></td>
    <td>D1 şemasını başlat / migre et</td>
  </tr>
  <tr>
    <td><code>/setWebhook</code></td>
    <td><code>GET</code></td>
    <td>Webhook'u Telegram'a kaydet</td>
  </tr>
  <tr>
    <td><code>/health</code></td>
    <td><code>GET</code></td>
    <td>JSON sağlık, sürüm ve çalışma süresi</td>
  </tr>
  <tr>
    <td><code>/cleanup</code></td>
    <td><code>GET</code></td>
    <td>Manuel eski veri temizliği (<code>?days=30</code>)</td>
  </tr>
  <tr>
    <td><code>/daily-cron</code></td>
    <td><code>GET</code></td>
    <td>Tüm etkin sohbetler için günlük ipuçlarını tetikle</td>
  </tr>
  <tr>
    <td><code>/reminder-cron</code></td>
    <td><code>GET</code></td>
    <td>Vadesi gelen hatırlatıcıların işlenmesini tetikle</td>
  </tr>
</table>

---

<h2>📁 Proje Yapısı</h2>

<details>
<summary><strong>Genişletmek için tıklayın</strong></summary>

<br/>

<pre>
<b>src/</b>
├── <b>index.ts</b>              #  Worker girişi — yönlendirme, webhook doğrulama
├── <b>ai.ts</b>                 #  AI çıkarımı, sistem promptu oluşturucu, web arama
├── <b>db.ts</b>                 #  D1 katmanı — migrasyonlar, sorgular, önbellekleme, hız sınırlama
├── <b>locales.ts</b>            #  i18n — 5 dil, şablon enterpolasyonu
├── <b>locales/</b>              #  Her dil için ayrı locale dosyaları
│   ├── <b>en.ts</b>              #  İngilizce (317 anahtar)
│   ├── <b>fa.ts</b>              #  Farsça (316 anahtar)
│   ├── <b>ar.ts</b>              #  Arapça (291 anahtar)
│   ├── <b>tr.ts</b>              #  Türkçe (291 anahtar)
│   └── <b>ru.ts</b>              #  Rusça (300 anahtar)
├── <b>telegram.ts</b>           #  Telegram API istemcisi — yeniden deneme, parçalama, yüklemeler
├── <b>constants.ts</b>          #  Paylaşılan sabitler (hız limitleri, RAG, Piston, vb.)
├── <b>model-config.ts</b>       #  Model kaydı, yetenekler, maliyet yapılandırması
├── <b>types/</b>
│   ├── <b>env.d.ts</b>           #  Ortam arayüzü, Telegram tipleri, UserSettings
│   └── <b>d1.ts</b>              #  D1 satır tipi tanımları
├── <b>handlers/</b>
│   ├── <b>message.ts</b>        #  Mesaj sınıflandırıcı (metin/fotoğraf/ses/dosya/URL)
│   ├── <b>command.ts</b>        #  Tüm /slash komut uygulamaları
│   ├── <b>callback.ts</b>       #  Satır içi klavye geri arama yönlendirmesi
│   ├── <b>admin.ts</b>          #  Yönetici paneli (istatistik, duyuru, engelleme, temizlik)
│   ├── <b>session.ts</b>        #  Çoklu oturum yönetimi
│   ├── <b>persona.ts</b>        #  Özel karakter oluşturma
│   ├── <b>daily.ts</b>          #  Günlük ipuçları cron işleyicisi
│   ├── <b>reminder.ts</b>       #  Hatırlatıcı sihirbazı + cron işleme
│   ├── <b>debate.ts</b>         #  Çoklu ajan tartışma sihirbazı
│   └── <b>inline.ts</b>         #  Satır içi sorgu işleyici
├── <b>menus/</b>
│   ├── <b>modeMenu.ts</b>       #  Dinamik karakter/model/dil/klavye menüleri
│   ├── <b>debateMenu.ts</b>     #  Tartışma akışı klavye menüleri
│   └── <b>reminderMenu.ts</b>   #  Tarih/saat/tekrarlama seçici klavyeleri
├── <b>modes/</b>
│   ├── <b>types.ts</b>          #  Mod sistemi tip tanımları
│   ├── <b>registry.ts</b>       #  Mod kaydı ve arama
│   └── <b>exam.ts</b>           #  Sınav modu uygulaması
├── <b>parsers/</b>
│   └── <b>htmlParser.ts</b>     #  Markdown → Telegram HTML dönüştürücü
├── <b>repositories/</b>
│   ├── <b>settings.repo.ts</b>  #  Kullanıcı ayarları + migrasyonlar (v1–v21)
│   ├── <b>chat.repo.ts</b>      #  Sohbet geçmişi + grup mesajları
│   ├── <b>admin.repo.ts</b>     #  Hız sınırlama, engellemeler, analitik, zamanlama
│   ├── <b>cache.ts</b>          #  Bellek içi TTL önbelleği
│   ├── <b>persona.repo.ts</b>   #  Özel karakterler + uyarlama geri bildirimi
│   ├── <b>debate.repo.ts</b>    #  Tartışma oturumları + mesajlar
│   ├── <b>reminder.repo.ts</b>  #  Hatırlatıcı CRUD
│   ├── <b>documents.repo.ts</b> #  RAG belge depolama ve arama
│   └── <b>memory.repo.ts</b>    #  Bellek özetleri depolama
├── <b>services/</b>
│   ├── <b>index.ts</b>          #  Merkezi hizmet katmanı yeniden dışa aktarımları
│   ├── <b>settings.service.ts</b>  #  Kullanıcı ayarları iş mantığı
│   ├── <b>debate.service.ts</b>    #  Tartışma orkestrasyon mantığı
│   ├── <b>ensemble.service.ts</b>  #  Paralel model sorgulama + jüri seçimi
│   ├── <b>persona-adaptive.service.ts</b>  #  Geri bildirimden AI özellik çıkarımı
│   ├── <b>router.service.ts</b>  #  Mesaj sınıflandırıcı → model yönlendirme
│   ├── <b>rag.service.ts</b>     #  Metin parçalama, indeksleme, getirme
│   ├── <b>sandbox.service.ts</b> #  Piston API kod yürütme (20 dil)
│   └── <b>memory.service.ts</b>  #  AI özetleme ve bağlam hatırlama
└── <b>utils/</b>
    ├── <b>logger.ts</b>         #  İstek ID'leri ile yapılandırılmış JSON günlükleme
    ├── <b>error.ts</b>          #  AppError hiyerarşisi, güvenli/tekrar deneme sarmalayıcıları
    ├── <b>file.ts</b>           #  Telegram dosya indirme, PDF metin çıkarma
    ├── <b>cache.ts</b>          #  Bellek içi TTL önbelleği
    ├── <b>validate.ts</b>       #  Girdi doğrulama yardımcıları
    └── <b>occasions.ts</b>      #  Günlük ipuçları için tatil/özel gün takvimi

<b>config/</b>
├── <b>personas.ts</b>           #  68 karakter tanımı (her biri 5 dilde)
└── <b>persona-emojis.ts</b>     #  Karakter düşünme durumları için emoji eşleştirmeleri

<b>tests/</b>
├── <b>unit/</b>                 #  164 birim testi (tüm modüller)
└── <b>integration/</b>          #  9 entegrasyon testi (webhook akışı)
</pre>

</details>

---

<h2>🧪 Yerel Geliştirme</h2>

<table>
  <tr>
    <th>Komut</th>
    <th>Açıklama</th>
  </tr>
  <tr>
    <td><code>npm install</code></td>
    <td>Bağımlılıkları yükle</td>
  </tr>
  <tr>
    <td><code>npm run typecheck</code></td>
    <td><code>tsc --noEmit</code> — sıfır hata</td>
  </tr>
  <tr>
    <td><code>npm test</code></td>
    <td><code>vitest --run</code> — 173 test</td>
  </tr>
  <tr>
    <td><code>npm run test:watch</code></td>
    <td><code>vitest</code> — izleme modu</td>
  </tr>
  <tr>
    <td><code>npm run build</code></td>
    <td><code>esbuild</code> → <code>dist/worker.bundle.js</code></td>
  </tr>
  <tr>
    <td><code>npm run lint</code></td>
    <td>ESLint (testler) + tsc (kaynak)</td>
  </tr>
  <tr>
    <td><code>npm run format</code></td>
    <td>Prettier — tümünü biçimlendir</td>
  </tr>
  <tr>
    <td><code>npx wrangler dev --remote</code></td>
    <td>Yerel geliştirme sunucusu (uzak bağlantılar)</td>
  </tr>
</table>

<br/>

<h3>Yerel Webhook Testi</h3>

<pre>
npx wrangler dev --remote           # http://localhost:8787
ngrok http 8787                     # herkese açık HTTPS URL'si
curl http://localhost:8787/setWebhook
</pre>

---

<h2>📊 Proje Durumu</h2>

<table>
  <tr>
    <th>Aşama</th>
    <th>Açıklama</th>
    <th align="center">Durum</th>
  </tr>
  <tr>
    <td>1</td>
    <td>JS → TypeScript göçü, tsconfig, CI hattı</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>2</td>
    <td>Tam tip ek açıklamaları — <code>noImplicitAny: true</code>, 0 tsc hatası</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>3</td>
    <td>D1 indeksleri, otomatik temizlik, entegrasyon testleri (toplam 173)</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>4</td>
    <td>Satır içi mod, TTS, akış yanıtları, grup yanıt düzeltmesi, çoklu ajan işbirliği (<code>/debate</code>)</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>5</td>
    <td>9 görsel modeli, Günlük İpuçları (AI cron + özel gün takvimi), Hatırlatma Sistemi (tarih/saat seçici, tekrarlama, bildirim)</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>6</td>
    <td>Topluluk Oylaması — paralel 3 model sorgulama + hakem/rastgele stratejisi</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>7</td>
    <td>Uyarlanabilir Karakter — AI geri bildirimlerden kullanıcı özelliklerini çıkarır</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>8</td>
    <td>Otomatik Yönlendirme — mesaj sınıflandırıcı en iyi modele yönlendirir</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>9</td>
    <td>RAG Bilgi Tabanı — <code>/learn</code> + <code>/forget</code>, LIKE tabanlı erişim</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>10</td>
    <td>Kod Alanı — <code>/run</code> 20 dilde Piston API ile</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>11</td>
    <td>AI Hafızası — otomatik konuşma özetleme ve bağlam hatırlama</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>12</td>
    <td>Çok Modlu — çıkartma, video notu, konum, kişi desteği</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>13</td>
    <td>Analitik — kullanıcı başına yanıt süresi ve takibi</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>14</td>
    <td>Performans — akış etrafında enstrümantasyon + girdi sertleştirme</td>
    <td align="center">✅</td>
  </tr>
</table>

---

<h2>🤝 Katkıda Bulunma</h2>

<ol>
  <li>Depoyu fork edin</li>
  <li>Bir özellik dalı oluşturun: <code>git checkout -b feature/fikriniz</code></li>
  <li>Değişiklikleri kaydedin: <code>git commit -m 'X özelliğini ekle'</code></li>
  <li>Gönderin: <code>git push origin feature/fikriniz</code></li>
  <li>Bir Pull Request açın</li>
</ol>

<p>Lütfen şunlardan emin olun:</p>
<ul>
  <li>✅ <code>npm run typecheck</code> geçiyor (sıfır tsc hatası)</li>
  <li>✅ <code>npm test</code> geçiyor (tüm 173 test)</li>
  <li>✅ Kod mevcut kalıpları takip ediyor (tamamen tipli, çalışma zamanı değişikliği yok)</li>
  <li>✅ Özellik ekliyorsanız <code>README.md</code> dosyasını güncelleyin</li>
</ul>

---

<h2>📄 Lisans</h2>

<p>
  <a href="LICENSE">MIT</a> — özgürce kullanın, değiştirin ve paylaşın.
</p>

<br/>

<div align="center">
  <sub>
    ⚡ ile <a href="https://workers.cloudflare.com/">Cloudflare Workers</a> üzerinde inşa edilmiştir ·
    <a href="https://developers.cloudflare.com/workers-ai/">Workers AI</a> tarafından desteklenmektedir ·
    <a href="https://developers.cloudflare.com/d1/">D1 Veritabanı</a>nda saklanmaktadır
  </sub>
  <br/><br/>
  <sub>
    <a href="https://github.com/RealClickClick/worker-ai-chatbot">GitHub</a> ·
    <a href="https://t.me/botfather">@BotFather</a> ·
    <a href="https://dash.cloudflare.com/">Cloudflare Dashboard</a>
  </sub>
</div>
