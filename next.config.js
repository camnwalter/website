/** @type {import('next').NextConfig} */
module.exports = {
  // basePath: "/absproxy/3000",
  webpack: config => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    return config;
  },
};
