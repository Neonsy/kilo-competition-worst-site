import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "🏛️ The Museum of Bad Decisions 🏛️",
  description: "Experience the worst choices humanity has to offer. Interactive exhibits of terrible ideas. Come for the regret, stay because you can't find the exit.",
  keywords: "museum, bad decisions, regret, terrible choices, interactive exhibits",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Additional meta tags for chaos */}
        <meta name="viewport" content="width=device-width, initial-scale=0.8, maximum-scale=0.8" />
        <meta name="theme-color" content="#39FF14" />
        <meta name="robots" content="noindex, nofollow, maybe" />
      </head>
      <body className="min-h-screen bg-tile-1">
        {/* Skip link that goes to wrong place */}
        <a 
          href="#footer" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:bg-hot-pink focus:text-electric-yellow focus:p-4 focus:z-[99999]"
        >
          Skip to nowhere
        </a>
        
        {/* Main content */}
        {children}
        
        {/* Hidden audio element for future chaos */}
        <div aria-hidden="true" className="hidden" />
      </body>
    </html>
  );
}
