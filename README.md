# Pemilihan Tim Proyek — Branch & Bound

Aplikasi web untuk menyelesaikan persoalan **Pemilihan Tim Proyek** menggunakan algoritma **Branch & Bound** (Least-Cost / Best-First Search).

## Deskripsi Persoalan

Diberikan **n** kandidat (n ≥ 12), masing-masing dengan biaya c[i]. Pilih tepat **k** orang (5 ≤ k ≤ 10) sehingga total biaya **≤ B** (batas anggaran) dan seminimal mungkin.

## Fitur

- **Input dinamis**: Jumlah kandidat (n), ukuran tim (k), dan batas anggaran (B) dapat diatur bebas.
- **Preset contoh**: Tersedia preset Small (n=12), Medium (n=18), dan Large (n=24) untuk demo cepat.
- **Generator acak**: Tombol "Acak Biaya" untuk mengisi biaya kandidat secara random.
- **Algoritma Branch & Bound**: Menggunakan strategi Least-Cost Search dengan Priority Queue dan pruning berbasis Lower Bound.
- **Ringkasan proses B&B**: Tabel detail yang mencatat setiap simpul — keputusan (pilih/lewati), biaya saat ini, lower bound, dan status (diekspansi, solusi layak, atau dipangkas).
- **Metrik eksekusi**: Waktu eksekusi (ms), total simpul dibangkitkan, simpul diekspansi, dan simpul dipangkas.

## Cara Menjalankan

Tidak diperlukan instalasi atau build. Cukup buka file `Branch&Bound.html` di browser:

1. Buka file `Branch&Bound.html` langsung di browser (double-click atau drag ke browser).
2. Atur parameter (n, k, B) dan biaya tiap kandidat.
3. Klik **"Hitung Tim Optimal"**.
4. Lihat hasil tim terpilih dan ringkasan proses Branch & Bound.

## Struktur File

```
├── Branch&Bound.html   # Halaman utama (struktur HTML)
├── style.css           # Stylesheet (layout, warna, tabel)
├── script.js           # Logika aplikasi & algoritma B&B
└── README.md           # Dokumentasi proyek
```

## Teknologi

- **HTML5**: Struktur halaman
- **CSS3**: Styling (vanilla CSS, tanpa framework)
- **JavaScript (ES6+)**: Logika algoritma dan interaksi UI (tanpa library eksternal)