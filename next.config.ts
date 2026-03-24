import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Wajib untuk deployment Docker
  images: {
    remotePatterns: [
      // Tambahkan domain eksternal di sini jika eTAKMIR mengambil gambar dari luar
      {
        protocol: 'https',
        hostname: 'dummyimage.com',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;