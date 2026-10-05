import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "MCP Server Setup — DavinciUI",
  description:
    "Connect DavinciUI's 140+ component registry to your AI coding assistant via the shadcn MCP server. Copy-paste setup for Cursor, Windsurf, and Claude Code.",
  alternates: {
    canonical: absoluteUrl("/docs/mcp"),
  },
  openGraph: {
    title: "MCP Server Setup — DavinciUI",
    description:
      "Let your AI agent install DavinciUI components directly. Registry setup for the shadcn MCP server.",
  },
};

export default function McpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
