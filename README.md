# IndoBERT Emotion & Sentiment Analysis Platform

Platform analisis sentimen dan emosi untuk teks berbahasa Indonesia (khususnya ulasan produk e-commerce). Proyek ini merupakan tugas akhir mata kuliah Text Mining yang menggunakan model IndoBERT, di-fine-tune pada dataset PRDECT-ID, dan disajikan melalui antarmuka web modern.

**Paper Referensi:** Leveraging IndoBERT and DistilBERT for Indonesian Emotion Classification in E-Commerce Reviews  
**Jurnal:** Procedia Computer Science 269 (2025) 321–330 · ICCSCI 2025

---

## 🌟 Fitur Utama

- 🎯 **Analisis Teks Tunggal** — Masukkan satu ulasan, dapatkan emosi, sentimen, beserta tingkat probabilitasnya secara instan.
- 📋 **Analisis Batch (CSV)** — Lakukan analisis hingga 100 ulasan sekaligus dari input teks manual atau unggah file CSV.
- 📊 **Dasbor Performa Model** — Halaman khusus yang menampilkan metrik evaluasi model (Accuracy, F1-Score), metodologi, dan konfigurasi aktif.
- 📖 **Dokumentasi API Terintegrasi** — Dokumentasi interaktif Swagger UI untuk developer yang ingin menggunakan backend API.

---

## 🏗️ Struktur Proyek

```text
deploy-final-project/
├── backend/
│   ├── main.py                          ← Entry point FastAPI
│   ├── models/
│   │   ├── best_model_s3_Emotion/       ← Folder model Emosi (HuggingFace safetensors)
│   │   ├── best_model_s3_Sentiment/     ← Folder model Sentimen (HuggingFace safetensors)
│   │   └── model_config.json            ← Konfigurasi & performa model
│   ├── services/
│   │   ├── predictor.py                 ← Logic inferensi model
│   │   └── preprocessing.py             ← Pipeline pre-processing teks
│   ├── schemas/                         ← Schema Pydantic untuk request/response
│   ├── routers/                         ← Endpoint API (analyze & stats)
│   └── requirements.txt                 ← Dependencies Python
├── frontend/
│   ├── app/                             ← Next.js App Router (Halaman Web)
│   ├── components/                      ← Komponen UI Reusable
│   ├── lib/                             ← Fungsi utilitas & API client
│   └── package.json                     ← Dependencies Node.js
└── package.json                         ← Script root (opsional)
```

---

## 🚀 Cara Menjalankan Proyek (Local Development)

Proyek ini menggunakan dua server terpisah untuk backend dan frontend.

### 1. Menjalankan Backend (FastAPI)

Pastikan Python 3.9+ sudah terinstal.

```powershell
# Masuk ke direktori backend
cd backend

# Buat virtual environment (opsional tapi disarankan)
python -m venv venv
venv\Scripts\activate

# Install dependensi (termasuk PyTorch & Transformers)
pip install -r requirements.txt

# Jalankan server FastAPI
uvicorn main:app --reload --port 8000
```
Backend akan berjalan di: `http://localhost:8000`
Dokumentasi API (Swagger): `http://localhost:8000/docs`

### 2. Menjalankan Frontend (Next.js)

Pastikan Node.js 18+ sudah terinstal. Buka terminal baru.

```powershell
# Masuk ke direktori root atau frontend
npm install

# Jalankan server development
npm run dev
```
Frontend akan berjalan di: `http://localhost:3000`

---

## 📦 Kebutuhan File Model

Proyek ini telah dikonfigurasi untuk memuat model HuggingFace dalam format `safetensors`. Pastikan folder `backend/models` memiliki struktur sebagai berikut:

- `backend/models/best_model_s3_Emotion/` (berisi config.json, model.safetensors, tokenizer_config.json, dll)
- `backend/models/best_model_s3_Sentiment/` (berisi hal yang serupa untuk sentimen)
- `backend/models/model_config.json` (metadata performa model)

*Catatan: File safetensors terlalu besar untuk disimpan langsung di GitHub, pastikan untuk mengabaikannya menggunakan `.gitignore` jika Anda ingin mem-push repositori ini.*

---

## 🛠️ Tech Stack

- **Backend:** Python, FastAPI, PyTorch, HuggingFace Transformers, Uvicorn
- **Frontend:** Node.js, Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts, Lucide Icons
- **Integrasi:** REST API dengan mekanisme caching LRU.
