Letakkan file model PyTorch di sini:

  best_IndoBERT_emotion.pt    (~440 MB) — Model klasifikasi emosi (5 kelas)
  best_IndoBERT_sentiment.pt  (~440 MB) — Model klasifikasi sentimen (2 kelas)
  model_config.json           (< 1 KB)  — Sudah ada, isi nilai accuracy/f1 dari notebook

PENTING:
- Jangan commit file .pt ke Git (tambahkan ke .gitignore)
- Untuk deployment Hugging Face Spaces, upload via huggingface_hub
- File model_config.json WAJIB diisi sebelum menjalankan backend

Untuk menghasilkan file ini, jalankan cell "Export Deployment" di notebook.
