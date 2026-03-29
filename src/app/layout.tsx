import type { Metadata } from "next";
import { Outfit, Source_Code_Pro } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kanban Dashboard — Role-Adaptive Board",
  description:
    "A role-adaptive Kanban dashboard with views for Product Owner, Scrum Master, and Developer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${sourceCodePro.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0D0F12] text-slate-200">
        {children}
      </body>
    </html>
  );
}
