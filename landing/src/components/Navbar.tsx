import Link from "next/link";
import { Moon } from "lucide-react";

export default function Navbar() {
  return (
    <nav id="navbar">
      <div className="nav-inner">
        <Link href="/" className="nav-logo">
          <Moon size={20} className="logo-icon" /> Ümmet
        </Link>
        <ul className="nav-links" id="navLinks">
          <li><Link href="/ozellikler">Özellikler</Link></li>
          <li><Link href="/yol-haritasi">Yol Haritası</Link></li>
          <li><Link href="/sss">SSS</Link></li>
          <li><Link href="/hakkimizda">Hakkımızda</Link></li>
          <li><Link href="/blog">Blog</Link></li>
        </ul>
        <a href="https://apps.apple.com/tr/app/ummet/id6760871547" target="_blank" rel="noopener noreferrer" className="nav-cta">İndir — Ücretsiz</a>
      </div>
    </nav>
  );
}
