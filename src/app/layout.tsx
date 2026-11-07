import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrailSafe UT | Know Before You Go",
  description: "Current trail conditions and hiking safety insights for Utah.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
