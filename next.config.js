/** @type {import('next').NextConfig} */
module.exports = {
  basePath: process.env.WEB_BASEPATH,
  webpack: config => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    return config;
  },
};
