import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { extractInsights } from "@/lib/utils/analysis-parser";

// GET /api/urls/[id]/analysis - Get analysis data for a URL
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the URL and check ownership
    const url = await prisma.url.findUnique({
      where: { id },
    });

    if (!url) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 });
    }

    if (url.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the latest analysis for this URL
    const latestAnalysis = await prisma.analysis.findFirst({
      where: { urlId: id },
      orderBy: { createdAt: "desc" },
    });

    if (!latestAnalysis) {
      return NextResponse.json({ error: "No analysis found" }, { status: 404 });
    }

    // Extract insights from the analysis data
    const insights = extractInsights(latestAnalysis);

    // Return the analysis data with insights
    return NextResponse.json({
      analysis: {
        id: latestAnalysis.id,
        createdAt: latestAnalysis.createdAt,
        performance: latestAnalysis.performance,
        accessibility: latestAnalysis.accessibility,
        seo: latestAnalysis.seo,
        bestPractices: latestAnalysis.bestPractices,
        rawData: latestAnalysis.rawData,
      },
      insights,
    });
  } catch (error) {
    console.error("Error fetching analysis:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
