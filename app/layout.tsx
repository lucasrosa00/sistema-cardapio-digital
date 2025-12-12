import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Função para obter a URL base do site
const getMetadataBase = (): URL => {
  // Prioridade: NEXT_PUBLIC_URL > VERCEL_URL > localhost
  if (process.env.NEXT_PUBLIC_URL) {
    return new URL(process.env.NEXT_PUBLIC_URL);
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }
  // Fallback para desenvolvimento local
  return new URL('http://localhost:3000');
};

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: "Serviços - Transforme seu negócio com tecnologia",
  description:
    "Serviços completo para restaurantes, hamburguerias, lanchonetes e lojas. Rápido, fácil de editar e funciona em 3G/4G. Crie seu cardápio ou catálogo agora por apenas R$ 300/ano.",
  openGraph: {
    title: "Serviços - Transforme seu negócio com tecnologia",
    description:
      "Serviços completo para restaurantes, hamburguerias, lanchonetes e lojas. Rápido, fácil de editar e funciona em 3G/4G.",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Serviços",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Serviços - Transforme seu negócio com tecnologia",
    description:
      "Serviços completo para restaurantes, hamburguerias, lanchonetes e lojas. Rápido, fácil de editar e funciona em 3G/4G.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
