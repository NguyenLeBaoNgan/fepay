

import Header from "@/components/header";
import Footer from "@/components/footer";
import RegisterPage from "@/components/auth/register";


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
      <RegisterPage/>
      <Footer />
    </>
  );
}
