import type { Metadata } from "next";
import { Providers } from "./providers";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "SMM League - Influencer Marketing Platform",
  description: "Discover, connect, and collaborate with influencers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
