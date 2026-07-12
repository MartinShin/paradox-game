/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/paradox',
  async redirects() {
    return [
      {
        source: '/',
        destination: '/paradox',
        basePath: false,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
