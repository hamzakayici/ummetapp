import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://ummetapp.com";
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/ozellikler`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/yol-haritasi`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/namaz-vakitleri`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/kible-pusulasi`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/zekat-hesaplama`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/sss`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/hakkimizda`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.4 },
  ];
}
