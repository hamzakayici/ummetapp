"use client";

import Link from "next/link";
import { Moon, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const nav = document.getElementById("navbar");
      if (!nav) return;
      if (window.scrollY > 12) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll as any);
  }, []);

  useEffect(() => {
    // body scroll lock
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <nav id="navbar" aria-label="Ümmet navigasyon">
      <div className="nav-inner">
        <Link href="/" className="nav-logo" onClick={() => setOpen(false)}>
          <Moon size={20} className="logo-icon" /> Ümmet
        </Link>

        <ul className="nav-links" id="navLinks">
          <li>
            <Link href="/ozellikler">Özellikler</Link>
          </li>
          <li>
            <Link href="/yol-haritasi">Yol Haritası</Link>
          </li>
          <li>
            <Link href="/sss">SSS</Link>
          </li>
          <li>
            <Link href="/hakkimizda">Hakkımızda</Link>
          </li>
          <li>
            <Link href="/blog">Blog</Link>
          </li>
        </ul>

        <div className="nav-actions">
          <a
            href="https://apps.apple.com/tr/app/ummet/id6760871547"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-cta"
          >
            İndir — Ücretsiz
          </a>
          <button
            type="button"
            className="nav-burger"
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <div className={`nav-drawer ${open ? "open" : ""}`} role="dialog" aria-modal="true">
        <div className="nav-drawer-panel">
          <div className="nav-drawer-top">
            <div className="nav-drawer-brand">
              <Moon size={18} className="logo-icon" />
              <span>Ümmet</span>
            </div>
            <button type="button" className="nav-drawer-close" onClick={() => setOpen(false)} aria-label="Kapat">
              <X size={18} />
            </button>
          </div>

          <div className="nav-drawer-links">
            <Link href="/ozellikler" onClick={() => setOpen(false)}>
              Özellikler
            </Link>
            <Link href="/yol-haritasi" onClick={() => setOpen(false)}>
              Yol Haritası
            </Link>
            <Link href="/sss" onClick={() => setOpen(false)}>
              SSS
            </Link>
            <Link href="/hakkimizda" onClick={() => setOpen(false)}>
              Hakkımızda
            </Link>
            <Link href="/blog" onClick={() => setOpen(false)}>
              Blog
            </Link>
          </div>

          <div className="nav-drawer-cta">
            <a
              href="https://apps.apple.com/tr/app/ummet/id6760871547"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              onClick={() => setOpen(false)}
            >
              App Store’dan İndir
            </a>
            <p className="nav-drawer-note">Kayıt gerekmez • Reklamsız • Ücretsiz</p>
          </div>
        </div>

        <button className="nav-drawer-backdrop" aria-label="Arka plan" onClick={() => setOpen(false)} />
      </div>
    </nav>
  );
}
