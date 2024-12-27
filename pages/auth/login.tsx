
import Header from "@/components/header";
import Footer from "@/components/footer";
import LoginPage from "@/components/auth/loginfrom";

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

export default function Home() {
  return (
    <>
      <Header />
      <LoginPage/>
      <Footer />
    </>
  );
}
