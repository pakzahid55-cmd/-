const backend = (process.env.KUJUK_API_ORIGIN || 'http://127.0.0.1:4000').replace(/\/$/, '');
export default {
  poweredByHeader: false,
  distDir: process.env.KUJUK_HOSTED_PREVIEW_BUILD === "1" ? ".next-hosted-preview" : ".next",
  images: { localPatterns: [{ pathname: '/images/**', search: '' }] },
  allowedDevOrigins: ['*.e2b.app'],
  async rewrites() {
    return { beforeFiles: [
      { source: '/api/:path*', destination: `${backend}/api/:path*` },
      { source: '/uploads/:path*', destination: `${backend}/uploads/:path*` },
    ] };
  },
};
