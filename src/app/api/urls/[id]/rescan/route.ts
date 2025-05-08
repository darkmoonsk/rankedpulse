import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { analyzeUrl } from "@/lib/services/pagespeed-service";
import { analyzeSeo } from "@/lib/services/seo-service";
import { normalizeAnalysisData } from "@/lib/utils/analysis-parser";
import { Prisma } from "@prisma/client";

// POST /api/urls/[id]/rescan - Trigger a rescan of a URL
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    const id = await params.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = await prisma.url.findUnique({
      where: { id },
    });

    if (!url) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 });
    }

    if (url.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Run the analyses in parallel
    const [pageSpeedResult, seoResult] = await Promise.all([
      analyzeUrl(url.url).catch((error) => {
        console.error("PageSpeed analysis failed:", error);
        return {
          performance: null,
          accessibility: null,
          bestPractices: null,
          seo: null,
          rawData: { error: "PageSpeed analysis failed" } as Prisma.JsonValue,
        };
      }),
      analyzeSeo(url.url).catch((error) => {
        console.error("SEO analysis failed:", error);
        return {
          title: {
            exists: false,
            value: null,
            length: 0,
            isOptimalLength: false,
          },
          metaDescription: {
            exists: false,
            value: null,
            length: 0,
            isOptimalLength: false,
          },
          canonical: { exists: false, value: null, matches: false },
          headings: {
            h1: { count: 0, values: [] },
            h2: { count: 0, values: [] },
            hasProperStructure: false,
          },
          robots: { exists: false, content: null },
          sitemap: { exists: false, isValid: false, url: null },
          score: 0,
        };
      }),
    ]);

    // Normalize and combine the results
    const analysisData = normalizeAnalysisData(pageSpeedResult, seoResult);

    // Create a new analysis record
    const analysis = await prisma.analysis.create({
      data: {
        urlId: url.id,
        performance: analysisData.performance,
        accessibility: analysisData.accessibility,
        seo: analysisData.seo,
        bestPractices: analysisData.bestPractices,
        rawData: analysisData.rawData as Prisma.InputJsonValue,
      },
    });

    // Update lastScanned timestamp
    await prisma.url.update({
      where: { id },
      data: {
        lastScanned: new Date(),
      },
    });

    return NextResponse.json({ success: true, analysisId: analysis.id });
  } catch (error) {
    console.error("Error rescanning URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
