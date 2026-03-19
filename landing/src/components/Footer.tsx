import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-brand">
          <Link href="/" className="nav-logo"><span className="crescent">☪</span> Ümmet</Link>
          <p>İslami yaşamınız için kapsamlı, modern ve ücretsiz mobil uygulama. Namaz vakitleri, Kuran, dua, zikir ve daha fazlası.</p>
        </div>
        <div className="footer-col">
          <h4>Uygulama</h4>
          <Link href="/ozellikler">Özellikler</Link>
          <Link href="/yol-haritasi">Yol Haritası</Link>
          <Link href="/sss">SSS</Link>
          <Link href="/blog">Blog</Link>
        </div>
        <div className="footer-col">
          <h4>Sayfalar</h4>
          <Link href="/hakkimizda">Hakkımızda</Link>
          <Link href="/namaz-vakitleri">Namaz Vakitleri</Link>
          <Link href="/kible-pusulasi">Kıble Pusulası</Link>
          <Link href="/zekat-hesaplama">Zekat Hesaplama</Link>
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
        <p>Bismillahirrahmanirrahim ☪</p>
      </div>
    </footer>
  );
}
