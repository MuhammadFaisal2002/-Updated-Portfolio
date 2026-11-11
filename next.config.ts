import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project; without it Turbopack picks the
  // parent folder when another lockfile exists above (e.g. a git worktree).
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
