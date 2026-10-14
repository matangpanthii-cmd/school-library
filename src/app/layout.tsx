import type { Metadata } from "next";
import NavigationWrapper from "@/components/NavigationWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "School Library System - โรงเรียนอนุบาลช้างน้อย",
  description: "ระบบยืม-คืนหนังสือโรงเรียนอนุบาลช้างน้อย ใช้งานได้ทั้งบนคอมพิวเตอร์และมือถือ",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ห้องสมุดช้างน้อย",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&family=Prompt:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className={`font-sans antialiased bg-[#eef7ff] text-slate-800 min-h-screen flex selection:bg-blue-500 selection:text-white`}
      >
        {/* Cute Elephant Background Pattern */}
        <div 
          className="fixed inset-0 pointer-events-none z-0 opacity-[0.25]" 
          style={{ backgroundImage: "url('/elephant-bg.jpg')", backgroundSize: '400px', backgroundRepeat: 'repeat' }}
        ></div>
        
        <NavigationWrapper>{children}</NavigationWrapper>
      </body>
    </html>
  );
}
