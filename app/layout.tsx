import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Wrap the children with your new provider */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}