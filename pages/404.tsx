import Footer from "@/components/footer";
import Header from "@/components/header";
const ER: React.FC = () => {
  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center h-screen">
        <img
          src="https://cdn.dribbble.com/userupload/25177493/file/original-cd89b23a9858ad9e8b4d6b125d44d4ff.gif"
          alt="404 Image"
          //   width={500}
        />
      </div>
      <Footer />
    </>
  );
};

export default ER;
