import Link from "next/link";

export default function Navbar() {
  return (
    <nav id="navbar">
      <div className="nav-inner">
        <Link href="/" className="nav-logo">
          <span className="crescent">☪</span> Ümmet
        </Link>
        <ul className="nav-links">
          <li><Link href="/ozellikler">Özellikler</Link></li>
          <li><Link href="/yol-haritasi">Yol Haritası</Link></li>
          <li><Link href="/sss">SSS</Link></li>
          <li><Link href="/hakkimizda">Hakkımızda</Link></li>
          <li><Link href="/blog">Blog</Link></li>
        </ul>
        <Link href="/#download" className="nav-cta">İndir — Ücretsiz</Link>
      </div>
    </nav>
  );
}
