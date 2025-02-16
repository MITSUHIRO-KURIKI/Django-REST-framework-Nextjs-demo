const NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
const BACKEND_API_URL      = process.env.BACKEND_API_URL;
const StaticParsedUrl      = new URL(NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000');

const nextConfig = {
  images: {
    domains: [
      StaticParsedUrl.hostname, // 画像 の配信
    ], 
  },
  poweredByHeader: false, // 'x-powered-by ヘッダーを無効化
  devIndicators: {
    appIsrStatus: false,  // Static Route インジケーター(非表示は非推奨)
  },
  reactStrictMode: false, // true: 冪等性を確認するが2回 Effect が動く(本番は自動で False )
  trailingSlash:   false,
};

module.exports = {
  ...nextConfig,
  async rewrites() {
    return [
      {
        // /backendapi はバックエンドへ
        // Django側 APPEND_SLASH=True に注意
        source:      '/backendapi/:path*',
        destination: `${BACKEND_API_URL}/backendapi/:path*/`,
      },
    ]
  },
};