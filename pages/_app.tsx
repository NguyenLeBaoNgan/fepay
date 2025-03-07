import "@/styles/globals.css";
import { AuthProvider } from "@/components/AuthContext";
import type { AppProps } from "next/app";
import { ThemeProvider } from "next-themes";
export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <AuthProvider>
  
      <Component {...pageProps} />
    </AuthProvider>
    </ThemeProvider>
  );
}
