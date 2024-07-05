/** @type {import('next').NextConfig} */
export default {
  experimental: {
    // Without this, webpack spams the console about being unable to statically analyze some
    // dynamic imports (via require()) in TypeORM
    serverComponentsExternalPackages: ["typeorm", "@discordjs"],
  },
  webpack: config => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    config.module.rules.push({
      test: /\.node$/,
      use: "node-loader",
    });
    return config;
  },
};
