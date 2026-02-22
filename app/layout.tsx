import "./globals.css";
import type { Metadata } from "next";
import { ToastProvider } from "@/components/toast";

export const metadata: Metadata = {
  title: "LaunchOS",
  description: "AI Launch & Growth OS (MVP)"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
