import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { NotificationProvider } from "@/lib/notifications";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CanteenCRM - Suivi des Politiques",
  description: "Suivi des politiques de durabilité dans les municipalités françaises",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full bg-gray-50">
      <body className={`${inter.className} h-full`}>
        <NotificationProvider>
          <Sidebar />
          <div className="pl-64 flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 py-10">
              <div className="px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
          </div>
        </NotificationProvider>
      </body>
    </html>
  );
}
