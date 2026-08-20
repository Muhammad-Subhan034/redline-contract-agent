import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3, Fira_Code } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import GrainOverlay from "@/components/GrainOverlay";
import Nav from "@/components/Nav";
import ScrollProgress from "@/components/ScrollProgress";
import CursorAccent from "@/components/CursorAccent";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Redline — contract review agent",
  description:
    "Reads a contract clause by clause against a standard playbook, flags risk, and suggests redlines that trace back to a source clause — never a black box.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${sourceSans.variable} ${firaCode.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink font-body antialiased">
        <SmoothScrollProvider>
          <GrainOverlay />
          <ScrollProgress />
          <CursorAccent />
          <Nav />
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
