import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sakhi · AI Fitness Companion for Indian Women",
  description: "Fitness that shapes around your day, honors your safety, and speaks your language.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind:wght@400;500;600&family=Young+Serif&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-mist text-aubergine antialiased min-h-screen">
        <main className="max-w-md mx-auto min-h-screen bg-white md:border-x md:border-ink-12 relative flex flex-col shadow-sm">
          {children}
        </main>
      </body>
    </html>
  );
}
