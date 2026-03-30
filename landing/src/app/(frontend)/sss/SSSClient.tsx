'use client'

import Link from 'next/link'
import { Accordion, Badge, Button, Container, Group, Stack, Text, Title } from '@mantine/core'

type FAQItem = { q: string; a: string }

export default function SSSClient({ faq }: { faq: FAQItem[] }) {
  return (
    <>
      <div className="page-hero">
        <Container size="md">
          <Stack align="center" gap="sm">
            <Badge
              variant="light"
              color="yellow"
              radius="xl"
              styles={{
                root: {
                  background: 'var(--gold-dim)',
                  border: '1px solid rgba(212,175,55,0.25)',
                  color: 'var(--gold)',
                },
              }}
            >
              SSS
            </Badge>
            <Title order={1} ta="center" style={{ fontWeight: 900 }}>
              Sıkça Sorulan Sorular
            </Title>
            <Text ta="center" c="dimmed" style={{ maxWidth: 680 }}>
              Ümmet hakkında merak ettiğiniz her şey
            </Text>
            <Group justify="center" wrap="wrap" mt="sm">
              <Link href="/ozellikler" className="btn-secondary">
                Özellikler →
              </Link>
              <Button component="a" href="mailto:destek@ummetapp.com" variant="default" radius="lg">
                destek@ummetapp.com
              </Button>
            </Group>
          </Stack>
        </Container>
      </div>

      <section style={{ paddingTop: 20 }}>
        <Container size="md">
          <Accordion
            variant="separated"
            radius="lg"
            styles={{
              item: {
                background: 'var(--bg-card)',
                border: '1px solid rgba(255,255,255,0.06)',
              },
              control: { color: 'var(--text)', fontWeight: 800 },
              panel: { color: 'var(--text-dim)' },
            }}
          >
            {faq.map((f) => (
              <Accordion.Item key={f.q} value={f.q}>
                <Accordion.Control>{f.q}</Accordion.Control>
                <Accordion.Panel>{f.a}</Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </Container>
      </section>

      <section className="cta-section">
        <Container size="sm">
          <Stack align="center" gap="md">
            <Title order={2} ta="center">
              Sorunuz mu var?
            </Title>
            <Text ta="center" c="dimmed">
              Bulamadığınız bir şey varsa bize yazın.
            </Text>
            <Button component="a" href="mailto:destek@ummetapp.com" radius="lg" variant="default">
              destek@ummetapp.com
            </Button>
          </Stack>
        </Container>
      </section>
    </>
  )
}

