module.exports = {
    output: 'export',
    images: {
      unoptimized: true, // Tắt tối ưu hóa ảnh
    },
    webpack: (config) => {
      config.resolve.fallback = { 
        fs: false, 
        net: false, 
        tls: false 
      };
      return config;
    },
  }
  