---
description: Auto-backup dan recovery untuk AI editing session
---

# Auto-Backup System

## Untuk AI (Instruksi Internal)

Sebelum mengedit file apapun, SELALU jalankan:
```bash
git stash push -m "auto-backup-before-edit"
```

## Untuk User: Jika Session Terputus

### Langkah 1: Cek apakah app error
Refresh browser di http://localhost:5174/

### Langkah 2: Jika app ERROR (compile error)
Jalankan di terminal:
```bash
git stash pop
```
Ini akan restore semua file ke kondisi sebelum AI edit.

### Langkah 3: Jika app NORMAL tapi behavior aneh
Jalankan:
```bash
git diff
```
Review perubahan, lalu putuskan:
- Mau simpan: `git add . && git commit -m "partial change"`
- Mau buang: `git checkout -- .`

### Langkah 4: Buka chat baru
Ketik: "lanjutkan session sebelumnya yang terputus"
AI akan baca progress_log.md dan lanjutkan dari sana.

## Quick Reference

| Situasi | Command |
|---------|---------|
| App error, restore backup | `git stash pop` |
| Lihat perubahan | `git diff` |
| Buang semua perubahan | `git checkout -- .` |
| Lihat stash list | `git stash list` |
