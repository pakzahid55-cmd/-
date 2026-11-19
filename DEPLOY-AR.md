# 🚀 إطلاق النسخة الأصلية — دليل النشر (ضغطة واحدة)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/pakzahid55-cmd/-)

## ⭐ الطريقة الأسهل (موبايل أو كمبيوتر)

1. **اضغط الزر أعلاه** → سجّل الدخول بحساب GitHub → سيُنشئ Render تلقائيًا:
   قاعدة بيانات PostgreSQL + الخادم + الموقع — كل شيء مربوط تلقائيًا.
2. انتظر البناء (دقائق) → تحصل على **رابطك العام** مثل `https://kajok.onrender.com`
3. **أرسل الرابط لوكيل الذكاء الاصطناعي** → يحوّل واجهة GitHub Pages للنسخة الحقيقية المرتبطة بقاعدة البيانات فورًا.

المشروع حزمة واحدة: **الواجهة + الخادم + رفع الملفات** في عملية Node واحدة.
الأمر الوحيد للتشغيل: `npm run build && npm start`

## الخطوات على Render (خطة مجانية)

1. أنشئ حساب على [render.com](https://render.com) بحساب GitHub الخاص بك.
2. **New → Web Service** → اربط مستودع `pakzahid55-cmd/-`.
3. اختر الفرع: `arena/31fcf83d-repo` (أو ادمج العمل في `main` أولًا).
4. Render يقرأ `render.yaml` تلقائيًا (Build: `npm run build` — Start: `npm start`).
5. أنشئ قاعدة بيانات: **New → PostgreSQL** (خطة مجانية) → انسخ **Internal Database URL**.
6. في إعدادات الخدمة → Environment → أضف:
   - `DATABASE_URL` = الرابط الذي نسخته
   - `JWT_SECRET` = أي نص عشوائي طويل (أو دع Blueprint يولّده)
7. اضغط **Deploy** → بعد البناء تحصل على رابطك العام مثل:
   `https://kajok.onrender.com`

## بعد النشر (خطوتان مهمتان)

1. **Firebase Console** → kajok-65089 → Authentication → Authorized domains:
   أضف نطاقك الجديد (مثل `kajok.onrender.com`) + فعّل مزودَي **Google** و**Phone**.
2. جرّب: التسجيل/الدخول، إضافة منتج، طلب حقيقي — كل شيء يعمل على الخادم.

## ملاحظات

- بدون `DATABASE_URL` يعمل الموقع بالذاكرة (للتجربة فقط — البيانات تُمحى عند إعادة التشغيل).
- الدفع الإلكتروني معطّل عمدًا (`ONLINE_PAYMENTS_ENABLED=false`) حتى ربط مزود حقيقي — الدفع عند الاستلام يعمل فورًا.
- النسخة التجريبية (GitHub Pages) تبقى كما هي للعرض.
- على استضافة أخرى (Fly.io / Railway / VPS): نفس الأمر —
  `npm run db:schema && npm run build && npm start` + نفس متغيرات البيئة.
