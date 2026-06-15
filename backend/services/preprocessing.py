"""
preprocessing.py — Fungsi preprocess teks ulasan.
WAJIB IDENTIK dengan yang digunakan saat training di notebook.
Perbedaan sekecil apapun akan menurunkan akurasi prediksi.
"""
import re


def preprocess(text: str) -> str:
    """
    Preprocess teks ulasan produk e-commerce Indonesia.

    Langkah:
    1. Lowercase semua karakter
    2. Hapus karakter non-alfabetik (kecuali spasi) menggunakan regex [^a-z\\s]
    3. Normalisasi spasi berlebih

    TIDAK ada stop word removal — sesuai dengan training notebook.
    """
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r"[^a-z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text
