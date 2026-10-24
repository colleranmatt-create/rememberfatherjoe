import type { Metadata, Viewport } from "next";
import { site } from "@/site.config";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const description = `Share your memories, photos and stories of ${site.name}, and find others who knew him.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: `Remember ${site.name}`, template: `%s · Remember ${site.shortName}` },
  description,
  openGraph: {
    title: `Remember ${site.name}`,
    description,
    type: "website",
    url: "/",
    siteName: `Remember ${site.shortName}`,
  },
  twitter: { card: "summary_large_image", title: `Remember ${site.name}`, description },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf6ef" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1916" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <footer className="site-footer">
          <p>In loving memory of {site.name}</p>
        </footer>
      </body>
    </html>
  );
}
