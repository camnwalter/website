/** @type {import('next').NextConfig} */
module.exports = {
  experimental: {
    // Without this, webpack spams the console about being unable to statically analyze some
    // dynamic imports (via require()) in TypeORM
    serverComponentsExternalPackages: ["typeorm"],
  },
  webpack: config => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    return config;
  },
};
