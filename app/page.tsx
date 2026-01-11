"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Github, Moon, Sun, Code } from "lucide-react";

export default function Home() {
  const [username, setUsername] = useState("rushikeshg25");
  const [theme, setTheme] = useState("dark");
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const widgetUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/widget?user=${username}&theme=${theme}`
    : `/api/widget?user=${username}&theme=${theme}`;

  const markdownSnippet = `[![GitHub Stats](${widgetUrl})](https://github.com/${username})`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdownSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-white/5 border border-white/10 mb-4 backdrop-blur-sm">
            <Github className="w-8 h-8" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-b from-white to-white/60">
            GitHub Readme Widgets
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Generate beautiful, dynamic stats widgets for your GitHub profile README.
            Just enter your username and copy the markdown.
          </p>
        </header>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Configuration */}
          <div className="space-y-6 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-400" />
              Configuration
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-white/80">
                  GitHub Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder:text-white/20"
                  placeholder="e.g. rushikeshg25"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Theme</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${theme === "dark"
                      ? "bg-blue-600/20 border-blue-500/50 text-blue-400"
                      : "bg-black/20 border-white/5 text-white/60 hover:bg-white/5"
                      }`}
                  >
                    <Moon className="w-4 h-4" />
                    Dark
                  </button>
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${theme === "light"
                      ? "bg-blue-600/20 border-blue-500/50 text-blue-400"
                      : "bg-black/20 border-white/5 text-white/60 hover:bg-white/5"
                      }`}
                  >
                    <Sun className="w-4 h-4" />
                    Light
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md min-h-[200px] flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[20px_20px]" />
              {username ? (
                <img
                  src={widgetUrl}
                  alt="Widget Preview"
                  className="relative z-10 rounded-xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                />
              ) : (
                <p className="text-white/40">Enter a username to preview</p>
              )}
            </div>
          </div>
        </div>

        {/* Code Snippet */}
        <div className="mt-8 bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="tex-sm font-medium text-white/80">Markdown Snippet</h3>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/90"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="group relative">
            <pre className="overflow-x-auto p-4 rounded-xl bg-black/50 border border-white/5 font-mono text-sm text-blue-300">
              {markdownSnippet}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
