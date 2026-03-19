import Link from "next/link";
import { Moon } from "lucide-react";

export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-brand">
          <Link href="/" className="nav-logo"><Moon size={20} className="logo-icon" /> Ümmet</Link>
          <p>İslami yaşamınız için kapsamlı, modern ve ücretsiz mobil uygulama. Namaz vakitleri, Kuran, dua, zikir ve daha fazlası.</p>
        </div>
        <div className="footer-col">
          <h4>Web Araçları</h4>
          <Link href="/zekat-hesaplayici">Zekat Hesaplayıcı</Link>
          <Link href="/dualar">Dualar</Link>
          <Link href="/kuran">Kuran Sureleri</Link>
          <Link href="/tesbih">Dijital Tesbih</Link>
          <Link href="/namaz-rehberi">Namaz Rehberi</Link>
          <Link href="/hicri-takvim">Hicri Takvim</Link>
        </div>
        <div className="footer-col">
          <h4>Sayfalar</h4>
          <Link href="/ozellikler">Özellikler</Link>
          <Link href="/yol-haritasi">Yol Haritası</Link>
          <Link href="/namaz-vakitleri">Namaz Vakitleri</Link>
          <Link href="/kible-pusulasi">Kıble Pusulası</Link>
          <Link href="/sss">SSS</Link>
          <Link href="/hakkimizda">Hakkımızda</Link>
          <Link href="/blog">Blog</Link>
        </div>
        <div className="footer-col">
          <h4>Yasal & İletişim</h4>
          <Link href="/privacy">Gizlilik Politikası</Link>
          <Link href="/terms">Kullanım Şartları</Link>
          <a href="mailto:destek@ummetapp.com">destek@ummetapp.com</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 Ümmet App. Tüm hakları saklıdır.</p>
        <p style={{ display: "flex", alignItems: "center", gap: 4 }}>Bismillahirrahmanirrahim <Moon size={14} /></p>
      </div>
    </footer>
  );
}
