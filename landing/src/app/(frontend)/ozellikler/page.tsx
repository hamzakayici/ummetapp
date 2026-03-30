import type { Metadata } from "next";
import { Clock, BookOpen, HandHelping, Circle, Compass, Moon, MapPin, Library, Calculator, BarChart3, Flame, Trophy, GraduationCap, Brain, Star } from "lucide-react";
import Link from "next/link";
import { Badge, Box, Button, Card, Container, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";

export const metadata: Metadata = { title: "Tüm Özellikler", description: "Ümmet uygulamasının tüm 15+ özelliği: namaz vakitleri, Kuran, dua, kıble, zikir, hadis, zekat ve daha fazlası." };

const FEATURES = [
  { icon: <Clock size={26} />, bg: "rgba(64,192,87,0.12)", color: "#40C057", title: "Namaz Vakitleri", desc: "Diyanet İşleri Başkanlığı hesaplamasıyla konumunuza göre otomatik namaz vakitleri. Güneş yayı animasyonu ile gün döngüsünü görsel takip. Her vakit için özelleştirilebilir ezan bildirimleri." },
  { icon: <BookOpen size={26} />, bg: "rgba(212,175,55,0.12)", color: "#D4AF37", title: "Kuran-ı Kerim", desc: "114 surenin tamamı Arapça metin ve Türkçe meal ile. Sure arama, okuma takibi, yer imi kaydetme. Offline çalışır." },
  { icon: <HandHelping size={26} />, bg: "rgba(139,92,246,0.12)", color: "#8B5CF6", title: "Dua Kitabı", desc: "100+ dua: sabah/akşam, namaz sonrası, yolculuk, hastalık, yemek, uyku. Arapça metin, Türkçe okunuş ve anlam." },
  { icon: <Circle size={26} />, bg: "rgba(249,115,22,0.12)", color: "#F97316", title: "Dijital Tesbih & Zikir", desc: "Sübhanallah, Elhamdülillah, Allahu Ekber sayacı. Günlük hedef, streak takibi ve haptic geri bildirim." },
  { icon: <Compass size={26} />, bg: "rgba(34,211,238,0.12)", color: "#22D3EE", title: "Kıble Pusulası", desc: "Gerçek zamanlı hassas kıble yönü. Derece göstergesi, Kabe mesafesi ve görsel rehber." },
  { icon: <Moon size={26} />, bg: "rgba(240,208,96,0.12)", color: "#F0D060", title: "Hicri Takvim", desc: "Miladi-Hicri dönüştürme, mübarek geceler, kandiller, Ramazan ve bayram tarihleri." },
  { icon: <MapPin size={26} />, bg: "rgba(64,192,87,0.12)", color: "#40C057", title: "Yakındaki Camiler", desc: "Konumunuza en yakın camileri anında bulun. Mesafe, harita navigasyonu, telefon ve website bilgileri." },
  { icon: <Library size={26} />, bg: "rgba(139,92,246,0.12)", color: "#8B5CF6", title: "Hadis Koleksiyonu", desc: "Sahih hadisler, kategori filtresi, favori kaydetme. Arapça metin, Türkçe çeviri ve kaynak." },
  { icon: <Calculator size={26} />, bg: "rgba(249,115,22,0.12)", color: "#F97316", title: "İslami Hesaplayıcılar", desc: "Zekat (altın, gümüş, nakit, hisse), fitre, kefaret ve fidye hesaplayıcı. Güncel fiyatlar." },
  { icon: <Star size={26} />, bg: "rgba(240,208,96,0.12)", color: "#F0D060", title: "Ramazan Hub", desc: "İftar ve sahur vakitleri, iftar geri sayımı, 30 günlük oruç takibi, Ramazan duaları." },
  { icon: <BarChart3 size={26} />, bg: "rgba(16,185,129,0.12)", color: "#10B981", title: "İbadet Analitik", desc: "Haftalık ve aylık ibadet performansı. Namaz, Kuran, dua ve zikir istatistikleri." },
  { icon: <Flame size={26} />, bg: "rgba(249,115,22,0.12)", color: "#F97316", title: "Streak Takibi", desc: "Ardışık gün sayacı ile motivasyon. Namazlarınızı kaçırmayın, streak'inizi koruyun." },
  { icon: <Trophy size={26} />, bg: "rgba(234,179,8,0.12)", color: "#EAB308", title: "Başarı Rozetleri", desc: "İbadet hedeflerine ulaştıkça rozetler kazanın." },
  { icon: <GraduationCap size={26} />, bg: "rgba(59,130,246,0.12)", color: "#3B82F6", title: "Namaz Rehberi", desc: "Adım adım namaz, abdest, farzlar, sünnetler ve nafile namazlar rehberi." },
  { icon: <Brain size={26} />, bg: "rgba(244,63,94,0.12)", color: "#F43F5E", title: "Hıfz Modu", desc: "Kuran ezberleme planı. Sure seçimi, tekrar sayacı ve ilerleme takibi." },
];

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

export default function OzelliklerPage() {
  return (
    <>
      <div className="page-hero">
        <Container size="md">
          <Stack align="center" gap="sm">
            <Badge variant="light" color="yellow" radius="xl" styles={{ root: { background: "var(--gold-dim)", border: "1px solid rgba(212,175,55,0.25)", color: "var(--gold)" } }}>
              Özellikler
            </Badge>
            <Title order={1} ta="center" style={{ fontWeight: 900 }}>
              15+ İslami Yaşam Aracı
            </Title>
            <Text ta="center" c="dimmed" style={{ maxWidth: 640 }}>
              Günlük ibadetlerinizi kolaylaştıran modern araçlar. Hepsi ücretsiz.
            </Text>
            <Group justify="center" wrap="wrap" mt="sm">
              <Button
                component="a"
                href="https://apps.apple.com/tr/app/ummet/id6760871547"
                target="_blank"
                rel="noopener noreferrer"
                radius="lg"
                leftSection={<AppleIcon />}
                styles={{ root: { background: "linear-gradient(135deg, var(--green-dark), var(--green-mid))", border: "1px solid rgba(64,192,87,0.2)" } }}
              >
                App Store&apos;dan İndir
              </Button>
              <Link href="/sss" className="btn-secondary">
                SSS →
              </Link>
            </Group>
          </Stack>
        </Container>
      </div>
      <section>
        <Container size="lg">
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {FEATURES.map((f) => (
              <Card
                key={f.title}
                radius="lg"
                padding="lg"
                withBorder
                styles={{
                  root: {
                    background: "var(--bg-card)",
                    borderColor: "rgba(255,255,255,0.06)",
                  },
                }}
              >
                <Group gap="md" align="flex-start">
                  <Box
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: f.bg,
                      color: f.color,
                      flexShrink: 0,
                    }}
                  >
                    {f.icon}
                  </Box>
                  <Box>
                    <Text fw={800} style={{ fontSize: 16, marginBottom: 6 }}>
                      {f.title}
                    </Text>
                    <Text c="dimmed" style={{ fontSize: 13, lineHeight: 1.7 }}>
                      {f.desc}
                    </Text>
                  </Box>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        </Container>
      </section>
      <section className="cta-section">
        <Container size="sm">
          <Stack align="center" gap="md">
            <Title order={2} ta="center">
              Tüm Özellikleri Ücretsiz Deneyin
            </Title>
            <Text ta="center" c="dimmed">
              Ümmet&apos;i indirin, ibadetlerinize güç katın.
            </Text>
            <Button
              component="a"
              href="https://apps.apple.com/tr/app/ummet/id6760871547"
              target="_blank"
              rel="noopener noreferrer"
              radius="lg"
              leftSection={<AppleIcon />}
              styles={{ root: { background: "linear-gradient(135deg, var(--green-dark), var(--green-mid))", border: "1px solid rgba(64,192,87,0.2)" } }}
            >
              App Store&apos;dan İndir
            </Button>
          </Stack>
        </Container>
      </section>
    </>
  );
}
