"use client";

const Hero = () => {
  return (
    <section className="relative w-full text-black py-16">
      <div className="container mx-auto flex flex-col-reverse lg:flex-row items-center justify-between px-6 lg:px-12">
        <div className="lg:w-1/2 text-center lg:text-left">
          <div className="bg-blue-600 text-white inline-block px-4 py-2 rounded-lg text-sm font-semibold">
          Lorem ipsum dolor sit amet
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mt-4">
          Lorem ipsum 
            <br />
            <span className="text-blue-400"> dolor sit amet</span>
          </h1>
          <p className="mt-4 text-lg text-black">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            {/* <a
              href="#"
              className="bg-blue-500 hover:bg-blue-700 text-white px-6 py-3 rounded-full text-lg font-semibold"
            >
              Đăng ký ngay
            </a> */}
            <a
              href="#"
              className="border border-gray text-blue-400 px-6 py-3 rounded-full text-lg font-semibold hover:bg-white hover:text-gray-900"
            >
              Bảng giá
            </a>
          </div>
        </div>

        <div className="lg:w-1/2 flex justify-center">
          <img
            src="https://interdata.vn/hosting-amd/skin/theme/cpu.png"
            alt="Hosting AMD EPYC"
            className="w-full max-w-md lg:max-w-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
