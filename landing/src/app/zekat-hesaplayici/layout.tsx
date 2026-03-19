import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Zekat Hesaplayıcı — Online Zekat Hesaplama", description: "Online zekat hesaplayıcı: Altın, gümüş, nakit ve hisse girişiyle nisap kontrolü ve zekat miktarını anında hesaplayın." };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
