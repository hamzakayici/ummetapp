# Ümmet — Proje Dokümantasyonu

26 Temmuz 2026 tarihli inceleme ve uygulama.

> **Aceleniz varsa:** [`15-VERI-ANALIZI.md`](15-VERI-ANALIZI.md) — gerçek App Store verisi (4 ayda 58 indirme) ve buna göre yeniden sıralanmış öncelikler. Çakışmalarda bu doküman geçerlidir.
> **Kod yazacaksanız:** kök dizindeki [`AGENTS.md`](../AGENTS.md) — stack, konvansiyonlar, bilinen hatalar. Cursor ve Claude Code bunu okur.

---

## Strateji

| Doküman | İçerik |
|---|---|
| [`00-PROJE-ANALIZI.md`](00-PROJE-ANALIZI.md) | Mevcut durum: mimari, özellik envanteri, güçlü yanlar, teknik borç |
| [`01-IYILESTIRME-YOL-HARITASI.md`](01-IYILESTIRME-YOL-HARITASI.md) | Ne yapılmalı, hangi sırayla — getiri/efor sıralı |
| [`02-MONETIZASYON.md`](02-MONETIZASYON.md) | Gelir modeli, fiyatlandırma, paywall tasarımı |
| [`07-GELIR-YOL-HARITASI.md`](07-GELIR-YOL-HARITASI.md) | **30/60/90 günlük gelir planı** |
| [`08-OZELLIK-ENVANTERI.md`](08-OZELLIK-ENVANTERI.md) | Ne var / ne yok, hangisi para kazandırır, ücretsiz-Pro sınırı |
| [`14-BUYUME-SENARYOSU.md`](14-BUYUME-SENARYOSU.md) | **Organik kullanıcı kazanımı: hatim grupları, Ramazan, kandiller, ASO** |

## Ölçüm

| Doküman | İçerik |
|---|---|
| [`15-VERI-ANALIZI.md`](15-VERI-ANALIZI.md) | 🔴 **Gerçek App Store verisi ve yeniden sıralanmış öncelikler — önce bunu okuyun** |
| [`03-VERI-VE-OLCUM.md`](03-VERI-VE-OLCUM.md) | App Store Connect erişimi, izlenecek metrikler, `scripts/appstore-analytics.mjs` |

## Karar Kayıtları

| Doküman | İçerik |
|---|---|
| [`05-ALTYAPI-KARARI.md`](05-ALTYAPI-KARARI.md) | Neden Laravel + cPanel, değerlendirilen alternatifler |
| [`06-LARAVEL-PLANI.md`](06-LARAVEL-PLANI.md) | Laravel/Filament planı, Supabase silinmesi, yerel ortam, cPanel deploy |

## Teknik Referans

| Doküman | İçerik |
|---|---|
| [`09-TASARIM-DILI.md`](09-TASARIM-DILI.md) | Renk, tipografi, aralık, bileşen kalıpları, hareket, ton — uygulama + web |
| [`10-MOBIL-MIMARI.md`](10-MOBIL-MIMARI.md) | Ekranlar, servis katmanı, state, veri akışları, native katman |
| [`11-BACKEND-API.md`](11-BACKEND-API.md) | `/api/v1` uç referansı, segmentler, zamanlanmış görevler |
| [`12-VERITABANI.md`](12-VERITABANI.md) | Tablo şeması, indeksler, karar notları |
| [`13-ADMIN-VE-VERI-KAYNAKLARI.md`](13-ADMIN-VE-VERI-KAYNAKLARI.md) | Panel yapısı, RevenueCat/ASC/Play entegrasyonu, **hangi veri anlık hangisi değil** |
| [`04-LANDING-PAGE.md`](04-LANDING-PAGE.md) | ummetapp.com değerlendirmesi ve yeniden yapım planı |
| [`../web/README.md`](../web/README.md) | Laravel projesini çalıştırma, API özeti |

---

## En Kritik Bulgular

0. 🚨 **Supabase projesi silinmiş** (DNS NXDOMAIN ile doğrulandı). Analytics, push kaydı, duyurular, remote config ve ortak zikir çalışmıyordu. → Laravel API yazıldı, mobil taraf geçirildi. Kalan: cPanel'e deploy + yeni App Store sürümü. `06` §1
1. **Gelir mekanizması sıfır.** `useProStore` tanımlı ama hiç kullanılmıyor; IAP paketi yok. → `02`, `07`
2. **Landing "premium duvarı yok" diye söz veriyor.** Pro çıkarmadan önce bu kopya düzeltilmeli. → `04` §2.3
3. **Uydurma kullanıcı yorumları ve sahte blog** eski sitede yayında — hukuki ve itibar riski. → `04` §2.1
4. **Android yayında değil.** TR'de pazarın %75-80'i kapalı; altyapı hazır. → `01` §1
5. **Zaman dilimi hatası** streak/rozet/analitiği bozuyor — paywall'un motoru olacak sistem. → `01` §3

---

## Bekleyen

**App Store Connect verisi.** API bağlantısı kuruldu (`scripts/appstore-analytics.mjs`), iki rapor talebi oluşturuldu, ama Apple veri dosyalarını henüz üretmedi. Geldiğinde `02` §8 ve `07` §7'deki "10.000 MAU başına" tabloları gerçek sayılarla yeniden yazılacak. Manuel export daha hızlı: `03` §2 Yol A.
