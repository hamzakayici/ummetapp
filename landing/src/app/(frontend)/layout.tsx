import type { Metadata } from "next";
import "../globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: { default: "Ümmet — İslami Yaşam Asistanınız", template: "%s | Ümmet" },
  description: "Namaz vakitleri, Kuran, dua, zikir, kıble pusulası, yakındaki camiler, hicri takvim ve daha fazlası. Tamamen ücretsiz İslami yaşam uygulaması.",
  keywords: ["namaz vakitleri", "kuran", "dua", "ezan", "kıble pusulası", "zikir", "hadis", "islam", "ramazan", "hicri takvim"],
  authors: [{ name: "Ümmet App" }],
  openGraph: { title: "Ümmet — İslami Yaşam Asistanınız", description: "Namaz vakitleri, Kuran, dua, zikir ve daha fazlası. Ücretsiz.", type: "website", locale: "tr_TR", siteName: "Ümmet" },
  twitter: { card: "summary_large_image", title: "Ümmet — İslami Yaşam Asistanınız" },
  robots: "index, follow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body>
        <div className="bg-glow" />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
