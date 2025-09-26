import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		remotePatterns: [new URL("https://y1fv437i50.ufs.sh/f/**")],
	},
};

export default nextConfig;
