import { logger } from './logger.ts';

interface Occasion {
  month: number;
  day: number;
  en: string;
  fa: string;
  ar: string;
  tr: string;
  ru: string;
}

const OCCASIONS: Occasion[] = [
  { month: 1, day: 1, en: "New Year's Day", fa: "سال نو میلادی", ar: "رأس السنة", tr: "Yılbaşı", ru: "Новый год" },
  { month: 1, day: 6, en: "Epiphany", fa: "عید ظهور", ar: "عيد الغطاس", tr: "Epifani", ru: "Богоявление" },
  { month: 1, day: 7, en: "Orthodox Christmas", fa: "کریسمس ارتدکس", ar: "عيد الميلاد الأرثوذكسي", tr: "Ortodoks Noel", ru: "Рождество Христово" },
  { month: 1, day: 14, en: "World Logic Day", fa: "روز جهانی منطق", ar: "اليوم العالمي للمنطق", tr: "Dünya Mantık Günü", ru: "Всемирный день логики" },
  { month: 1, day: 15, en: "Wikipedia Day", fa: "روز ویکی‌پدیا", ar: "يوم ويكيبيديا", tr: "Vikipedi Günü", ru: "День Википедии" },
  { month: 1, day: 24, en: "International Day of Education", fa: "روز جهانی آموزش", ar: "اليوم العالمي للتعليم", tr: "Uluslararası Eğitim Günü", ru: "Международный день образования" },
  { month: 1, day: 27, en: "International Holocaust Remembrance Day", fa: "روز جهانی یادبود هولوکاست", ar: "اليوم العالمي لذكرى الهولوكوست", tr: "Uluslararası Holokost Anma Günü", ru: "Международный день памяти жертв Холокоста" },
  { month: 2, day: 2, en: "World Wetlands Day", fa: "روز جهانی تالاب‌ها", ar: "اليوم العالمي للأراضي الرطبة", tr: "Dünya Sulak Alanlar Günü", ru: "Всемирный день водно-болотных угодий" },
  { month: 2, day: 10, en: "World Pulses Day", fa: "روز جهانی حبوبات", ar: "اليوم العالمي للبقول", tr: "Dünya Bakliyat Günü", ru: "Всемирный день бобовых" },
  { month: 2, day: 11, en: "International Day of Women and Girls in Science", fa: "روز جهانی زنان و دختران در علم", ar: "اليوم العالمي للمرأة والفتاة في ميدان العلوم", tr: "Bilimde Kadın ve Kız Çocukları Günü", ru: "Международный день женщин и девочек в науке" },
  { month: 2, day: 13, en: "World Radio Day", fa: "روز جهانی رادیو", ar: "اليوم العالمي للإذاعة", tr: "Dünya Radyo Günü", ru: "Всемирный день радио" },
  { month: 2, day: 14, en: "Valentine's Day", fa: "روز عشق", ar: "عيد الحب", tr: "Sevgililer Günü", ru: "День святого Валентина" },
  { month: 2, day: 20, en: "World Day of Social Justice", fa: "روز جهانی عدالت اجتماعی", ar: "اليوم العالمي للعدالة الاجتماعية", tr: "Dünya Sosyal Adalet Günü", ru: "Всемирный день социальной справедливости" },
  { month: 2, day: 21, en: "International Mother Language Day", fa: "روز جهانی زبان مادری", ar: "اليوم العالمي للغة الأم", tr: "Uluslararası Anadil Günü", ru: "Международный день родного языка" },
  { month: 3, day: 3, en: "World Wildlife Day", fa: "روز جهانی حیات وحش", ar: "اليوم العالمي للحياة البرية", tr: "Dünya Yaban Hayatı Günü", ru: "Всемирный день дикой природы" },
  { month: 3, day: 8, en: "International Women's Day", fa: "روز جهانی زن", ar: "اليوم العالمي للمرأة", tr: "Dünya Kadınlar Günü", ru: "Международный женский день" },
  { month: 3, day: 14, en: "International Day of Mathematics", fa: "روز جهانی ریاضیات", ar: "اليوم العالمي للرياضيات", tr: "Dünya Matematik Günü", ru: "Международный день математики" },
  { month: 3, day: 15, en: "World Consumer Rights Day", fa: "روز جهانی حقوق مصرف‌کننده", ar: "اليوم العالمي لحقوق المستهلك", tr: "Dünya Tüketici Hakları Günü", ru: "Всемирный день прав потребителей" },
  { month: 3, day: 20, en: "International Day of Happiness", fa: "روز جهانی شادی", ar: "اليوم العالمي للسعادة", tr: "Uluslararası Mutluluk Günü", ru: "Международный день счастья" },
  { month: 3, day: 21, en: "World Poetry Day", fa: "روز جهانی شعر", ar: "اليوم العالمي للشعر", tr: "Dünya Şiir Günü", ru: "Всемирный день поэзии" },
  { month: 3, day: 22, en: "World Water Day", fa: "روز جهانی آب", ar: "اليوم العالمي للمياه", tr: "Dünya Su Günü", ru: "Всемирный день водных ресурсов" },
  { month: 3, day: 23, en: "World Meteorological Day", fa: "روز جهانی هواشناسی", ar: "اليوم العالمي للأرصاد الجوية", tr: "Dünya Meteoroloji Günü", ru: "Всемирный день метеорологии" },
  { month: 3, day: 24, en: "World Tuberculosis Day", fa: "روز جهانی سل", ar: "اليوم العالمي للسل", tr: "Dünya Tüberküloz Günü", ru: "Всемирный день борьбы с туберкулёзом" },
  { month: 3, day: 27, en: "World Theatre Day", fa: "روز جهانی تئاتر", ar: "اليوم العالمي للمسرح", tr: "Dünya Tiyatro Günü", ru: "Всемирный день театра" },
  { month: 4, day: 1, en: "April Fools' Day", fa: "روز اول آوریل", ar: "كذبة أبريل", tr: "1 Nisan Şakası", ru: "День смеха" },
  { month: 4, day: 2, en: "World Autism Awareness Day", fa: "روز جهانی آگاهی از اوتیسم", ar: "اليوم العالمي للتوعية بمرض التوحد", tr: "Dünya Otizm Farkındalık Günü", ru: "Всемирный день распространения информации об аутизме" },
  { month: 4, day: 7, en: "World Health Day", fa: "روز جهانی بهداشت", ar: "اليوم العالمي للصحة", tr: "Dünya Sağlık Günü", ru: "Всемирный день здоровья" },
  { month: 4, day: 12, en: "International Day of Human Space Flight", fa: "روز جهانی پرواز فضایی انسان", ar: "اليوم الدولي لرحلة الفضاء البشرية", tr: "Uluslararası Uzay İnsanlı Uçuş Günü", ru: "Международный день полёта человека в космос" },
  { month: 4, day: 15, en: "World Art Day", fa: "روز جهانی هنر", ar: "اليوم العالمي للفن", tr: "Dünya Sanat Günü", ru: "Всемирный день искусства" },
  { month: 4, day: 22, en: "Earth Day", fa: "روز زمین", ar: "يوم الأرض", tr: "Dünya Günü", ru: "День Земли" },
  { month: 4, day: 23, en: "World Book and Copyright Day", fa: "روز جهانی کتاب و حق نشر", ar: "اليوم العالمي للكتاب وحقوق النشر", tr: "Dünya Kitap ve Telif Hakkı Günü", ru: "Всемирный день книг и авторского права" },
  { month: 4, day: 25, en: "World Malaria Day", fa: "روز جهانی مالاریا", ar: "اليوم العالمي للملاريا", tr: "Dünya Sıtma Günü", ru: "Всемирный день борьбы с малярией" },
  { month: 4, day: 26, en: "World Intellectual Property Day", fa: "روز جهانی مالکیت فکری", ar: "اليوم العالمي للملكية الفكرية", tr: "Dünya Fikri Mülkiyet Günü", ru: "Всемирный день интеллектуальной собственности" },
  { month: 4, day: 29, en: "International Dance Day", fa: "روز جهانی رقص", ar: "اليوم العالمي للرقص", tr: "Uluslararası Dans Günü", ru: "Международный день танца" },
  { month: 4, day: 30, en: "International Jazz Day", fa: "روز جهانی جاز", ar: "اليوم العالمي لموسيقى الجاز", tr: "Uluslararası Caz Günü", ru: "Международный день джаза" },
  { month: 5, day: 1, en: "Labour Day", fa: "روز جهانی کارگر", ar: "عيد العمال", tr: "İşçi Bayramı", ru: "День труда" },
  { month: 5, day: 3, en: "World Press Freedom Day", fa: "روز جهانی آزادی مطبوعات", ar: "اليوم العالمي لحرية الصحافة", tr: "Dünya Basın Özgürlüğü Günü", ru: "Всемирный день свободы печати" },
  { month: 5, day: 8, en: "World Red Cross and Red Crescent Day", fa: "روز جهانی صلیب سرخ و هلال احمر", ar: "اليوم العالمي للصليب الأحمر والهلال الأحمر", tr: "Dünya Kızılhaç ve Kızılay Günü", ru: "Всемирный день Красного Креста и Красного Полумесяца" },
  { month: 5, day: 9, en: "Europe Day", fa: "روز اروپا", ar: "يوم أوروبا", tr: "Avrupa Günü", ru: "День Европы" },
  { month: 5, day: 12, en: "International Nurses Day", fa: "روز جهانی پرستار", ar: "اليوم العالمي للممرضين والممرضات", tr: "Uluslararası Hemşireler Günü", ru: "Международный день медицинской сестры" },
  { month: 5, day: 15, en: "International Day of Families", fa: "روز جهانی خانواده", ar: "اليوم الدولي للأسر", tr: "Uluslararası Aile Günü", ru: "Международный день семей" },
  { month: 5, day: 17, en: "World Telecommunication Day", fa: "روز جهانی ارتباطات", ar: "اليوم العالمي للاتصالات", tr: "Dünya Telekomünikasyon Günü", ru: "Всемирный день электросвязи" },
  { month: 5, day: 21, en: "World Day for Cultural Diversity", fa: "روز جهانی تنوع فرهنگی", ar: "اليوم العالمي للتنوع الثقافي", tr: "Dünya Kültürel Çeşitlilik Günü", ru: "Всемирный день культурного разнообразия" },
  { month: 5, day: 22, en: "International Day for Biological Diversity", fa: "روز جهانی تنوع زیستی", ar: "اليوم الدولي للتنوع البيولوجي", tr: "Uluslararası Biyolojik Çeşitlilik Günü", ru: "Международный день биологического разнообразия" },
  { month: 5, day: 25, en: "Africa Day", fa: "روز آفریقا", ar: "يوم أفريقيا", tr: "Afrika Günü", ru: "День Африки" },
  { month: 6, day: 1, en: "International Children's Day", fa: "روز جهانی کودکان", ar: "اليوم العالمي للطفل", tr: "Uluslararası Çocuk Günü", ru: "Международный день защиты детей" },
  { month: 6, day: 5, en: "World Environment Day", fa: "روز جهانی محیط زیست", ar: "اليوم العالمي للبيئة", tr: "Dünya Çevre Günü", ru: "Всемирный день окружающей среды" },
  { month: 6, day: 7, en: "World Food Safety Day", fa: "روز جهانی ایمنی غذا", ar: "اليوم العالمي لسلامة الأغذية", tr: "Dünya Gıda Güvenliği Günü", ru: "Всемирный день безопасности пищевых продуктов" },
  { month: 6, day: 8, en: "World Oceans Day", fa: "روز جهانی اقیانوس‌ها", ar: "اليوم العالمي للمحيطات", tr: "Dünya Okyanuslar Günü", ru: "Всемирный день океанов" },
  { month: 6, day: 12, en: "World Day Against Child Labour", fa: "روز جهانی مبارزه با کار کودکان", ar: "اليوم العالمي لمكافحة عمل الأطفال", tr: "Dünya Çocuk İşçiliğiyle Mücadele Günü", ru: "Всемирный день борьбы с детским трудом" },
  { month: 6, day: 14, en: "World Blood Donor Day", fa: "روز جهانی اهدای خون", ar: "اليوم العالمي للمتبرعين بالدم", tr: "Dünya Kan Bağışçıları Günü", ru: "Всемирный день донора крови" },
  { month: 6, day: 17, en: "World Day to Combat Desertification", fa: "روز جهانی مبارزه با بیابان‌زایی", ar: "اليوم العالمي لمكافحة التصحر", tr: "Dünya Çölleşmeyle Mücadele Günü", ru: "Всемирный день борьбы с опустыниванием" },
  { month: 6, day: 20, en: "World Refugee Day", fa: "روز جهانی پناهنده", ar: "اليوم العالمي للاجئين", tr: "Dünya Mülteci Günü", ru: "Всемирный день беженцев" },
  { month: 6, day: 21, en: "International Day of Yoga", fa: "روز جهانی یوگا", ar: "اليوم العالمي لليوغا", tr: "Uluslararası Yoga Günü", ru: "Международный день йоги" },
  { month: 6, day: 23, en: "International Olympic Day", fa: "روز جهانی المپیک", ar: "اليوم الأولمبي الدولي", tr: "Uluslararası Olimpiyat Günü", ru: "Международный олимпийский день" },
  { month: 6, day: 26, en: "International Day against Drug Abuse", fa: "روز جهانی مبارزه با مواد مخدر", ar: "اليوم الدولي لمكافحة إساءة استعمال المخدرات", tr: "Uluslararası Uyuşturucuyla Mücadele Günü", ru: "Международный день борьбы со злоупотреблением наркотиками" },
  { month: 7, day: 7, en: "World Chocolate Day", fa: "روز جهانی شکلات", ar: "اليوم العالمي للشوكولاتة", tr: "Dünya Çikolata Günü", ru: "Всемирный день шоколада" },
  { month: 7, day: 11, en: "World Population Day", fa: "روز جهانی جمعیت", ar: "اليوم العالمي للسكان", tr: "Dünya Nüfus Günü", ru: "Всемирный день народонаселения" },
  { month: 7, day: 15, en: "World Youth Skills Day", fa: "روز جهانی مهارت‌های جوانان", ar: "اليوم العالمي لمهارات الشباب", tr: "Dünya Gençlik Becerileri Günü", ru: "Всемирный день навыков молодёжи" },
  { month: 7, day: 18, en: "International Nelson Mandela Day", fa: "روز جهانی نلسون ماندلا", ar: "اليوم الدولي لنيلسون مانديلا", tr: "Uluslararası Nelson Mandela Günü", ru: "Международный день Нельсона Манделы" },
  { month: 7, day: 28, en: "World Hepatitis Day", fa: "روز جهانی هپاتیت", ar: "اليوم العالمي لالتهاب الكبد", tr: "Dünya Hepatit Günü", ru: "Всемирный день гепатита" },
  { month: 7, day: 30, en: "International Day of Friendship", fa: "روز جهانی دوستی", ar: "اليوم الدولي للصداقة", tr: "Uluslararası Dostluk Günü", ru: "Международный день дружбы" },
  { month: 8, day: 9, en: "International Day of the World's Indigenous Peoples", fa: "روز جهانی مردم بومی", ar: "اليوم الدولي للشعوب الأصلية", tr: "Dünya Yerli Halkları Günü", ru: "Международный день коренных народов мира" },
  { month: 8, day: 12, en: "International Youth Day", fa: "روز جهانی جوانان", ar: "اليوم الدولي للشباب", tr: "Uluslararası Gençlik Günü", ru: "Международный день молодёжи" },
  { month: 8, day: 19, en: "World Humanitarian Day", fa: "روز جهانی بشردوستانه", ar: "اليوم العالمي للعمل الإنساني", tr: "Dünya İnsani Yardım Günü", ru: "Всемирный день гуманитарной помощи" },
  { month: 8, day: 23, en: "International Day for the Remembrance of the Slave Trade", fa: "روز جهانی یادبود تجارت برده", ar: "اليوم الدولي لإحياء ذكرى تجارة الرقيق", tr: "Uluslararası Köle Ticaretini Anma Günü", ru: "Международный день памяти жертв работорговли" },
  { month: 8, day: 29, en: "International Day against Nuclear Tests", fa: "روز جهانی مبارزه با آزمایش‌های هسته‌ای", ar: "اليوم الدولي لمناهضة التجارب النووية", tr: "Uluslararası Nükleer Denemelere Karşı Gün", ru: "Международный день действий против ядерных испытаний" },
  { month: 9, day: 5, en: "International Day of Charity", fa: "روز جهانی خیریه", ar: "اليوم الدولي للأعمال الخيرية", tr: "Uluslararası Yardım Günü", ru: "Международный день благотворительности" },
  { month: 9, day: 8, en: "International Literacy Day", fa: "روز جهانی سوادآموزی", ar: "اليوم العالمي لمحو الأمية", tr: "Uluslararası Okuryazarlık Günü", ru: "Международный день грамотности" },
  { month: 9, day: 10, en: "World Suicide Prevention Day", fa: "روز جهانی پیشگیری از خودکشی", ar: "اليوم العالمي لمنع الانتحار", tr: "Dünya İntiharı Önleme Günü", ru: "Всемирный день предотвращения самоубийств" },
  { month: 9, day: 15, en: "International Day of Democracy", fa: "روز جهانی دموکراسی", ar: "اليوم الدولي للديمقراطية", tr: "Uluslararası Demokrasi Günü", ru: "Международный день демократии" },
  { month: 9, day: 16, en: "International Day for the Preservation of the Ozone Layer", fa: "روز جهانی لایه ازن", ar: "اليوم الدولي للحفاظ على طبقة الأوزون", tr: "Uluslararası Ozon Tabakasını Koruma Günü", ru: "Международный день охраны озонового слоя" },
  { month: 9, day: 21, en: "International Day of Peace", fa: "روز جهانی صلح", ar: "اليوم الدولي للسلام", tr: "Uluslararası Barış Günü", ru: "Международный день мира" },
  { month: 9, day: 27, en: "World Tourism Day", fa: "روز جهانی گردشگری", ar: "اليوم العالمي للسياحة", tr: "Dünya Turizm Günü", ru: "Всемирный день туризма" },
  { month: 9, day: 28, en: "World Rabies Day", fa: "روز جهانی هاری", ar: "اليوم العالمي لداء الكلب", tr: "Dünya Kuduz Günü", ru: "Всемирный день борьбы с бешенством" },
  { month: 9, day: 29, en: "World Heart Day", fa: "روز جهانی قلب", ar: "اليوم العالمي للقلب", tr: "Dünya Kalp Günü", ru: "Всемирный день сердца" },
  { month: 10, day: 1, en: "International Day of Older Persons", fa: "روز جهانی سالمندان", ar: "اليوم الدولي للمسنين", tr: "Uluslararası Yaşlılar Günü", ru: "Международный день пожилых людей" },
  { month: 10, day: 2, en: "International Day of Non-Violence", fa: "روز جهانی خشونت‌پرهیزی", ar: "اليوم الدولي لللاعنف", tr: "Uluslararası Şiddetsizlik Günü", ru: "Международный день ненасилия" },
  { month: 10, day: 4, en: "World Animal Day", fa: "روز جهانی حیوانات", ar: "اليوم العالمي للحيوان", tr: "Dünya Hayvanlar Günü", ru: "Всемирный день животных" },
  { month: 10, day: 5, en: "World Teachers' Day", fa: "روز جهانی معلم", ar: "اليوم العالمي للمعلمين", tr: "Dünya Öğretmenler Günü", ru: "Всемирный день учителей" },
  { month: 10, day: 9, en: "World Post Day", fa: "روز جهانی پست", ar: "اليوم العالمي للبريد", tr: "Dünya Posta Günü", ru: "Всемирный день почты" },
  { month: 10, day: 10, en: "World Mental Health Day", fa: "روز جهانی سلامت روان", ar: "اليوم العالمي للصحة النفسية", tr: "Dünya Ruh Sağlığı Günü", ru: "Всемирный день психического здоровья" },
  { month: 10, day: 13, en: "International Day for Disaster Reduction", fa: "روز جهانی کاهش بلایای طبیعی", ar: "اليوم الدولي للحد من الكوارث", tr: "Uluslararası Afet Riskini Azaltma Günü", ru: "Международный день уменьшения опасности стихийных бедствий" },
  { month: 10, day: 15, en: "International Day of Rural Women", fa: "روز جهانی زنان روستایی", ar: "اليوم الدولي للمرأة الريفية", tr: "Uluslararası Kırsal Kadınlar Günü", ru: "Международный день сельских женщин" },
  { month: 10, day: 16, en: "World Food Day", fa: "روز جهانی غذا", ar: "اليوم العالمي للغذاء", tr: "Dünya Gıda Günü", ru: "Всемирный день продовольствия" },
  { month: 10, day: 17, en: "International Day for the Eradication of Poverty", fa: "روز جهانی ریشه‌کنی فقر", ar: "اليوم الدولي للقضاء على الفقر", tr: "Uluslararası Yoksullukla Mücadele Günü", ru: "Международный день борьбы за ликвидацию нищеты" },
  { month: 10, day: 20, en: "World Statistics Day", fa: "روز جهانی آمار", ar: "اليوم العالمي للإحصاء", tr: "Dünya İstatistik Günü", ru: "Всемирный день статистики" },
  { month: 10, day: 24, en: "United Nations Day", fa: "روز سازمان ملل", ar: "يوم الأمم المتحدة", tr: "Birleşmiş Milletler Günü", ru: "День Организации Объединённых Наций" },
  { month: 10, day: 27, en: "World Day for Audiovisual Heritage", fa: "روز جهانی میراث دیداری و شنیداری", ar: "اليوم العالمي للتراث السمعي البصري", tr: "Dünya Görsel-İşitsel Miras Günü", ru: "Всемирный день аудиовизуального наследия" },
  { month: 10, day: 31, en: "World Cities Day", fa: "روز جهانی شهرها", ar: "اليوم العالمي للمدن", tr: "Dünya Şehirler Günü", ru: "Всемирный день городов" },
  { month: 11, day: 1, en: "All Saints' Day", fa: "روز تمام قدیسان", ar: "عيد جميع القديسين", tr: "Azizler Günü", ru: "День всех святых" },
  { month: 11, day: 2, en: "World Tsunami Awareness Day", fa: "روز جهانی آگاهی از سونامی", ar: "اليوم العالمي للتوعية بأمواج تسونامي", tr: "Dünya Tsunami Farkındalık Günü", ru: "Всемирный день информации о цунами" },
  { month: 11, day: 5, en: "World Tsunami Awareness Day", fa: "روز جهانی آگاهی از سونامی", ar: "اليوم العالمي للتوعية بأمواج تسونامي", tr: "Dünya Tsunami Farkındalık Günü", ru: "Всемирный день информации о цунами" },
  { month: 11, day: 10, en: "World Science Day for Peace and Development", fa: "روز جهانی علم برای صلح و توسعه", ar: "اليوم العالمي للعلوم من أجل السلام والتنمية", tr: "Barış ve Kalkınma için Dünya Bilim Günü", ru: "Всемирный день науки за мир и развитие" },
  { month: 11, day: 14, en: "World Diabetes Day", fa: "روز جهانی دیابت", ar: "اليوم العالمي للسكري", tr: "Dünya Diyabet Günü", ru: "Всемирный день диабета" },
  { month: 11, day: 16, en: "International Day for Tolerance", fa: "روز جهانی مدارا", ar: "اليوم الدولي للتسامح", tr: "Uluslararası Hoşgörü Günü", ru: "Международный день терпимости" },
  { month: 11, day: 19, en: "World Toilet Day", fa: "روز جهانی توالت", ar: "اليوم العالمي للمراحيض", tr: "Dünya Tuvalet Günü", ru: "Всемирный день туалета" },
  { month: 11, day: 20, en: "World Children's Day", fa: "روز جهانی کودک", ar: "اليوم العالمي للطفل", tr: "Dünya Çocuk Günü", ru: "Всемирный день ребёнка" },
  { month: 11, day: 21, en: "World Television Day", fa: "روز جهانی تلویزیون", ar: "اليوم العالمي للتلفزيون", tr: "Dünya Televizyon Günü", ru: "Всемирный день телевидения" },
  { month: 11, day: 25, en: "International Day for the Elimination of Violence against Women", fa: "روز جهانی حذف خشونت علیه زنان", ar: "اليوم الدولي للقضاء على العنف ضد المرأة", tr: "Kadına Yönelik Şiddete Karşı Uluslararası Mücadele Günü", ru: "Международный день борьбы за ликвидацию насилия в отношении женщин" },
  { month: 11, day: 29, en: "International Day of Solidarity with the Palestinian People", fa: "روز جهانی همبستگی با مردم فلسطین", ar: "اليوم الدولي للتضامن مع الشعب الفلسطيني", tr: "Uluslararası Filistin Halkıyla Dayanışma Günü", ru: "Международный день солидарности с палестинским народом" },
  { month: 11, day: 30, en: "World Computer Literacy Day", fa: "روز جهانی سواد کامپیوتری", ar: "اليوم العالمي لمحو الأمية الحاسوبية", tr: "Dünya Bilgisayar Okuryazarlığı Günü", ru: "Всемирный день компьютерной грамотности" },
  { month: 12, day: 1, en: "World AIDS Day", fa: "روز جهانی ایدز", ar: "اليوم العالمي للإيدز", tr: "Dünya AIDS Günü", ru: "Всемирный день борьбы со СПИДом" },
  { month: 12, day: 2, en: "International Day for the Abolition of Slavery", fa: "روز جهانی الغای برده‌داری", ar: "اليوم الدولي لإلغاء الرق", tr: "Uluslararası Köleliğin Kaldırılması Günü", ru: "Международный день отмены рабства" },
  { month: 12, day: 3, en: "International Day of Persons with Disabilities", fa: "روز جهانی افراد دارای معلولیت", ar: "اليوم الدولي للأشخاص ذوي الإعاقة", tr: "Uluslararası Engelliler Günü", ru: "Международный день инвалидов" },
  { month: 12, day: 5, en: "World Soil Day", fa: "روز جهانی خاک", ar: "اليوم العالمي للتربة", tr: "Dünya Toprak Günü", ru: "Всемирный день почв" },
  { month: 12, day: 7, en: "International Civil Aviation Day", fa: "روز جهانی هوانوردی غیرنظامی", ar: "اليوم الدولي للطيران المدني", tr: "Uluslararası Sivil Havacılık Günü", ru: "Международный день гражданской авиации" },
  { month: 12, day: 9, en: "International Anti-Corruption Day", fa: "روز جهانی مبارزه با فساد", ar: "اليوم الدولي لمكافحة الفساد", tr: "Uluslararası Yolsuzlukla Mücadele Günü", ru: "Международный день борьбы с коррупцией" },
  { month: 12, day: 10, en: "Human Rights Day", fa: "روز جهانی حقوق بشر", ar: "يوم حقوق الإنسان", tr: "İnsan Hakları Günü", ru: "День прав человека" },
  { month: 12, day: 11, en: "International Mountain Day", fa: "روز جهانی کوهستان", ar: "اليوم الدولي للجبال", tr: "Uluslararası Dağ Günü", ru: "Международный день гор" },
  { month: 12, day: 18, en: "International Migrants Day", fa: "روز جهانی مهاجران", ar: "اليوم الدولي للمهاجرين", tr: "Uluslararası Göçmenler Günü", ru: "Международный день мигранта" },
  { month: 12, day: 20, en: "International Human Solidarity Day", fa: "روز جهانی همبستگی انسانی", ar: "اليوم الدولي للتضامن الإنساني", tr: "Uluslararası İnsan Dayanışması Günü", ru: "Международный день солидарности людей" },
  { month: 12, day: 25, en: "Christmas Day", fa: "کریسمس", ar: "عيد الميلاد", tr: "Noel", ru: "Рождество" },
  { month: 12, day: 31, en: "New Year's Eve", fa: "شب سال نو", ar: "ليلة رأس السنة", tr: "Yılbaşı Gecesi", ru: "Канун Нового года" },
];

const GENERIC_TIPS: Record<string, string[]> = {
  en: [
    "💡 Did you know? The first computer virus was created in 1983.",
    "💡 Fun fact: Honey never spoils. Archaeologists found 3000-year-old honey still edible!",
    "💡 Did you know? Octopuses have three hearts and blue blood.",
    "💡 Fun fact: A day on Venus is longer than a year on Venus.",
    "💡 Did you know? Bananas are berries, but strawberries aren't!",
    "💡 Fun fact: The Eiffel Tower grows 15 cm taller in summer due to thermal expansion.",
    "💡 Did you know? Butterflies taste with their feet.",
    "💡 Fun fact: The shortest war in history lasted only 38 minutes.",
    "💡 Did you know? There are more stars in the universe than grains of sand on Earth.",
    "💡 Fun fact: A group of flamingos is called a 'flamboyance'.",
  ],
  fa: [
    "💡 می‌دونستی؟ اولین ویروس کامپیوتری در سال ۱۹۸۳ ساخته شد.",
    "💡 حقیقت جالب: عسل هرگز فاسد نمی‌شه. باستان‌شناسان عسل ۳۰۰۰ ساله پیدا کردن که هنوز خوردنی بود!",
    "💡 می‌دونستی؟ اختاپوس‌ها سه قلب و خون آبی دارن.",
    "💡 حقیقت جالب: یک روز در ناهید طولانی‌تر از یک سال در ناهید هست.",
    "💡 می‌دونستی؟ موز جزو توت‌ها حساب می‌شه، اما توت‌فرنگی نه!",
    "💡 حقیقت جالب: برج ایفل در تابستان به خاطر انبساط حرارتی ۱۵ سانتی‌متر بلندتر می‌شه.",
    "💡 می‌دونستی؟ پروانه‌ها با پاهاشون مزه رو حس می‌کنن.",
    "💡 حقیقت جالب: کوتاه‌ترین جنگ تاریخ فقط ۳۸ دقیقه طول کشید.",
    "💡 می‌دونستی؟ تعداد ستاره‌های جهان بیشتر از دانه‌های شن روی زمینه.",
    "💡 حقیقت جالب: به گروه فلامینگوها می‌گن 'یک پرتجمل‌گرایی'!",
  ],
  ar: [
    "💡 هل تعلم؟ أول فيروس كمبيوتر تم إنشاؤه في عام 1983.",
    "💡 حقيقة ممتعة: العسل لا يفسد أبداً. وجد علماء الآثار عسلاً عمره 3000 سنة ولا يزال صالحاً للأكل!",
    "💡 هل تعلم؟ الأخطبوطات لها ثلاثة قلوب ودم أزرق.",
    "💡 حقيقة ممتعة: اليوم في الزهرة أطول من السنة في الزهرة.",
  ],
  tr: [
    "💡 Biliyor muydun? İlk bilgisayar virüsü 1983'te oluşturuldu.",
    "💡 İlginç bilgi: Bal asla bozulmaz. Arkeologlar 3000 yıllık bal buldu, hâlâ yenilebilirdi!",
    "💡 Biliyor muydun? Ahtapotların üç kalbi ve mavi kanı vardır.",
    "💡 İlginç bilgi: Venüs'te bir gün, Venüs'teki bir yıldan daha uzundur.",
  ],
  ru: [
    "💡 Знаете ли вы? Первый компьютерный вирус был создан в 1983 году.",
    "💡 Занимательный факт: Мёд никогда не портится. Археологи нашли 3000-летний мёд, который всё ещё съедобен!",
    "💡 Знаете ли вы? У осьминогов три сердца и голубая кровь.",
    "💡 Занимательный факт: День на Венере длиннее года на Венере.",
  ],
};

export function getTodayOccasions(lang: string): string[] {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const matched = OCCASIONS
    .filter(o => o.month === month && o.day === day)
    .map(o => (o as unknown as Record<string, string>)[lang] || o.en);
  return matched;
}

export function getRandomTip(lang: string): string {
  const tips = GENERIC_TIPS[lang] || GENERIC_TIPS.en;
  return tips[Math.floor(Math.random() * tips.length)];
}

export function buildDailyPrompt(occasions: string[], lang: string, groupName: string): string {
  const date = new Date();
  const dateStr = date.toLocaleDateString(lang === 'fa' ? 'fa-IR' : lang === 'ar' ? 'ar-SA' : lang === 'tr' ? 'tr-TR' : lang === 'ru' ? 'ru-RU' : 'en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  let prompt = `Today is ${dateStr}.\n`;
  prompt += `Write a warm, friendly daily greeting message for the group "${groupName}".\n`;

  if (occasions.length > 0) {
    prompt += `Today's special occasion(s): ${occasions.join(', ')}.\n`;
    prompt += `Mention and celebrate this/these occasion(s) in the message. Include a brief interesting fact or history about it.\n`;
  } else {
    prompt += `Share an interesting fun fact or a motivational quote to start the day positively.\n`;
  }

  prompt += [
    'Requirements:',
    '- Be warm, friendly, and engaging (use emojis naturally).',
    '- Keep it concise (2-4 paragraphs, max 300 words).',
    '- Use a conversational tone, not formal.',
    '- Include a call to action or a question to engage members.',
    '- Respond with ONLY the message text, no labels or prefixes.',
  ].join('\n');

  return prompt;
}

export async function tryFetchExternalHolidays(): Promise<string[]> {
  try {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const res = await fetch(`https://date.nager.at/api/v3/publicholidays/${now.getFullYear()}/US`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as any[];
    return data
      .filter((h: any) => {
        const d = h.date as string;
        return d.endsWith(`-${month}-${day}`);
      })
      .map((h: any) => h.localName || h.name);
  } catch {
    return [];
  }
}
