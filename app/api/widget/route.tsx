import { NextRequest, NextResponse } from "next/server";
import { getGitHubStats } from "@/lib/github";
import satori from "satori";
import { loadGoogleFont } from "@/lib/fonts";

const ALLOWED_USER = process.env.GITHUB_USERNAME as string;

if (!ALLOWED_USER) {
    console.warn("⚠️ GITHUB_USERNAME is not set in environment variables.");
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("user");
    const theme = searchParams.get("theme") || "dark";

    if (!username) {
        return new NextResponse("Missing username", { status: 400 });
    }

    // Security Restriction
    if (!ALLOWED_USER) {
        return new NextResponse("Configuration Error: GITHUB_USERNAME not set on server.", { status: 500 });
    }

    if (username.toLowerCase() !== ALLOWED_USER.toLowerCase()) {
        return new NextResponse("Unauthorized: This widget is restricted to specific users.", { status: 403 });
    }

    try {
        const stats = await getGitHubStats(username);

        // Font Loading (Cached)
        const [fontData, fontBoldData] = await Promise.all([
            loadGoogleFont("Inter", 400),
            loadGoogleFont("Inter", 700),
        ]);

        const isDark = theme === "dark";
        const bgColor = isDark ? "#0d1117" : "#ffffff";
        const textColor = isDark ? "#c9d1d9" : "#24292f";
        const secondaryText = isDark ? "#8b949e" : "#57606a";
        const borderColor = isDark ? "#30363d" : "#e1e4e8";

        // Optimized Satori Render
        const svg = await satori(
            <div
                style={{
                    display: "flex",
                    height: "100%",
                    width: "100%",
                    backgroundColor: bgColor,
                    borderRadius: "12px",
                    border: `1px solid ${borderColor}`,
                    padding: "24px",
                    fontFamily: "Inter, sans-serif",
                    flexDirection: "row",
                    color: textColor,
                    boxSizing: "border-box",
                    alignItems: "center",
                    gap: "32px",
                }}
            >
                {/* Left Column: Key Stats */}
                <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between", height: "100%" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "16px", fontWeight: 700, color: textColor }}>{stats.name || username}</span>
                        <span style={{ fontSize: "12px", color: secondaryText }}>@{stats.username}</span>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                        <div style={{ display: "flex", flexDirection: "column", width: "45%" }}>
                            <span style={{ fontSize: "18px", fontWeight: 700, color: textColor }}>{stats.total_stars}</span>
                            <span style={{ fontSize: "11px", color: secondaryText }}>Stars</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", width: "45%" }}>
                            <span style={{ fontSize: "18px", fontWeight: 700, color: textColor }}>{stats.total_commits}</span>
                            <span style={{ fontSize: "11px", color: secondaryText }}>Commits (2025)</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", width: "45%" }}>
                            <span style={{ fontSize: "18px", fontWeight: 700, color: textColor }}>{stats.current_streak}</span>
                            <span style={{ fontSize: "11px", color: secondaryText }}>Current Streak</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", width: "45%" }}>
                            <span style={{ fontSize: "18px", fontWeight: 700, color: textColor }}>{stats.max_streak}</span>
                            <span style={{ fontSize: "11px", color: secondaryText }}>Max Streak</span>
                        </div>
                    </div>
                </div>

                {/* Separator Line */}
                <div style={{ display: "flex", height: "80%", width: "1px", backgroundColor: borderColor }}></div>

                {/* Right Column: Top Languages */}
                <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", gap: "6px", height: "100%" }}>
                    <div style={{ display: "flex", fontSize: "11px", fontWeight: 600, color: secondaryText, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>Top Languages</div>
                    {stats.top_languages.slice(0, 5).map((lang) => (
                        <div key={lang.name} style={{ display: "flex", flexDirection: "column", width: "100%", gap: "4px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: textColor }}>
                                <span style={{ fontWeight: 500 }}>{lang.name}</span>
                                <span style={{ color: secondaryText, fontSize: "11px" }}>{lang.percentage.toFixed(1)}%</span>
                            </div>
                            <div style={{ display: "flex", width: "100%", height: "6px", backgroundColor: isDark ? "#21262d" : "#eaeef2", borderRadius: "3px", overflow: "hidden" }}>
                                <div style={{ display: "flex", width: `${lang.percentage}%`, height: "100%", backgroundColor: lang.color, borderRadius: "3px" }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>,
            {
                width: 520,
                height: 220,
                fonts: [
                    {
                        name: "Inter",
                        data: fontData,
                        weight: 400,
                        style: "normal",
                    },
                    {
                        name: "Inter",
                        data: fontBoldData,
                        weight: 700,
                        style: "normal",
                    },
                ],
            }
        );

        return new NextResponse(svg, {
            headers: {
                "Content-Type": "image/svg+xml",
                "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=30",
            },
        });
    } catch (error) {
        console.error("Widget Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
