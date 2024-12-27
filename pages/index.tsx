// import Image from "next/image";
// import localFont from "next/font/local";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ProductList from "@/pages/productlist";
// import ProductDetail from "@/components/product/[id]";

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
      <ProductList />
      {/* <ProductDetail /> */}
      <Footer />
    </>
  );
}
