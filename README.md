# 🔐 Cipher Lab REP500 - Advanced Cryptographic Platform

منظومة تشفير رقمية حديثة وآمنة بنسبة 100% تعمل داخل المتصفح (Client-Side Zero-Knowledge) باستخدام معيار **AES-256-GCM** وخوارزمية **REP500 Matrix** المبتكرة.

![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg)

---

## 🌟 المميزات الرئيسية (Key Features)

- 🔒 **تشفير متناظر فائق الأمان (AES-256-GCM)**: تشفير كامل داخل المتصفح عبر Web Crypto API (`window.crypto.subtle`) بدون إرسال أي مفاتيح أو بيانات لخوادم وسيطة.
- 🎲 **نظام مصفوفة REP500**: توليد 128,000 كود تمثيلي عشوائي فريد لتشتيت التحليل الإحصائي للبيانات.
- 📁 **تشفير الملفات والمستندات**: سحب وإفلات أي ملف (PDF، صور، مستندات، أرشيفات) وتشفيرها بصيغة `.rep500` واسترجاعها مع الحفاظ على اسمها ونوعها الأصلي.
- 🔑 **مولد مفاتيح عالي الإنتروبيا (Key Generator)**: توليد مفاتيح عشوائية فائقة التعقيد (256-bit Hex، Diceware، Passphrases) مع قياس مستوى الأمان.
- 🔍 **فاحص المظروف التشفيري (Envelope Inspector)**: تحليل حقول المظروف التشفيري، فحص قيم الملح (Salt) ومتجه التهيئة (IV) ونسب التمدد.
- 🎥 **فيديو شرح وتدريب تفاعلي**: شرح خطوة بخطوة لكيفية التشفير وفك التشفير مع دعم التصدير السينمائي بـ Google Veo 3.
- 🌐 **دعم كامل للغتين (Arabic & English)** مع واجهة مستخدم مظلمة عصرية ومريحة للعين.

---

## 🚀 التشغيل المحلي (Local Development)

### 1. تثبيت الحزم:
```bash
npm install
```

### 2. تشغيل بيئة التطوير:
```bash
npm run dev
```
افتح المتصفح على: `http://localhost:3000`

### 3. بناء المشروع للإنتاج:
```bash
npm run build
```

---

## 🌐 النشر على GitHub Pages (GitHub Pages Deployment)

تم تجهيز المشروع تلقائياً بملف سير عمل **GitHub Actions** (`.github/workflows/deploy.yml`):

1. قم بإنشاء مستودع جديد على **GitHub** (New Repository).
2. ارفع ملفات المشروع:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Cipher Lab REP500"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
   git push -u origin main
   ```
3. توجه إلى إعدادات المستودع على GitHub:
   - **Settings** > **Pages**
   - في قسم **Build and deployment** اختر **Source: GitHub Actions**.
4. سيتم بناء الموقع ونشره تلقائياً على الرابط:
   `https://<YOUR_USERNAME>.github.io/<YOUR_REPO_NAME>/`

---

## 📜 الترخيص (License)
هذا المشروع مرخص تحت رخصة Apache 2.0.
