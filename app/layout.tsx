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

export const metadata: Metadata = {
  title: "Cardápio Digital - Transforme seu restaurante com tecnologia",
  description:
    "Cardápio digital completo para restaurantes, hamburguerias e lanchonetes. Rápido, fácil de editar e funciona em 3G/4G. Crie seu cardápio agora por apenas R$ 300/ano.",
  openGraph: {
    title: "Cardápio Digital - Transforme seu restaurante com tecnologia",
    description:
      "Cardápio digital completo para restaurantes, hamburguerias e lanchonetes. Rápido, fácil de editar e funciona em 3G/4G.",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Cardápio Digital",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cardápio Digital - Transforme seu restaurante com tecnologia",
    description:
      "Cardápio digital completo para restaurantes, hamburguerias e lanchonetes. Rápido, fácil de editar e funciona em 3G/4G.",
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
