import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ambient — Portal",
  description: "Advertiser and publisher portal for Ambient contextual ad platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link
          href="https://fonts.bunny.net/css?family=inter:400,500,600,700|jetbrains-mono:400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
