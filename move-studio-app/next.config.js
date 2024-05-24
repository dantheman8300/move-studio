/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    API_LINK: process.env.API_LINK,
  }
}

module.exports = nextConfig
