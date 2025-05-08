import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// GET /api/stats - Get aggregate statistics for all URLs
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total number of URLs
    const urlCount = await prisma.url.count({
      where: { userId },
    });

    // Get latest analysis date
    const latestAnalysis = await prisma.analysis.findFirst({
      where: {
        url: {
          userId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        createdAt: true,
      },
    });

    // Get average scores
    const avgScores = await prisma.analysis.aggregate({
      where: {
        url: {
          userId,
        },
      },
      _avg: {
        performance: true,
        accessibility: true,
        seo: true,
        bestPractices: true,
      },
    });

    // Calculate overall average score
    let overallAvg = 0;
    let validScoreCount = 0;

    const scores = [
      avgScores._avg.performance,
      avgScores._avg.accessibility,
      avgScores._avg.seo,
      avgScores._avg.bestPractices,
    ];

    for (const score of scores) {
      if (score !== null) {
        overallAvg += score;
        validScoreCount++;
      }
    }

    const averageScore =
      validScoreCount > 0 ? Math.round(overallAvg / validScoreCount) : null;

    return NextResponse.json({
      urlCount,
      latestAnalysis: latestAnalysis?.createdAt || null,
      avgScores: avgScores._avg,
      averageScore,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
