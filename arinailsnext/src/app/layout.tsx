import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../presentation/providers/Providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ari Nails - Belleza y Elegancia en tus Manos",
  description: "Expertos en manicura, diseño de uñas y cuidado profesional. Tu satisfacción es nuestra prioridad.",
  keywords: "manicura, uñas, belleza, diseño de uñas, salón de belleza, cuidado de uñas",
  authors: [{ name: "Ari Nails" }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="emotion-insertion-point" content="" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
