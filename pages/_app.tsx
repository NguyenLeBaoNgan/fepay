import "@/styles/globals.css";
import { AuthProvider } from "@/components/AuthContext";
import type { AppProps } from "next/app";
import { ThemeProvider } from "next-themes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <AuthProvider>
  
      <Component {...pageProps} />
      <ToastContainer />
    </AuthProvider>
    
    </ThemeProvider>
  );
}
