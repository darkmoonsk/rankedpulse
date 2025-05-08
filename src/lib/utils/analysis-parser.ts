/**
 * Analysis Parser Utility
 * Normalizes and processes analysis data from different sources
 */

import type { SeoAnalysisResult } from "../services/seo-service";
import { Prisma } from "@prisma/client";

export type AnalysisData = {
  performance: number | null;
  accessibility: number | null;
  seo: number | null;
  bestPractices: number | null;
  rawData: Prisma.JsonValue;
};

interface PageSpeedData {
  performance: number | null;
  accessibility: number | null;
  bestPractices: number | null;
  seo: number | null;
  rawData: Prisma.JsonValue;
}

/**
 * Combines PageSpeed and SEO analysis results into a single normalized format
 */
export function normalizeAnalysisData(
  pageSpeedData: PageSpeedData,
  seoData: SeoAnalysisResult
): AnalysisData {
  // Use PageSpeed SEO score if available, otherwise use our custom SEO score
  const seoScore =
    pageSpeedData.seo !== null ? pageSpeedData.seo : seoData.score;

  // Combine raw data from both sources
  const rawData = {
    pagespeed: {
      performance: pageSpeedData.performance,
      accessibility: pageSpeedData.accessibility,
      bestPractices: pageSpeedData.bestPractices,
      seo: pageSpeedData.seo,
    },
    seoAnalysis: {
      title: seoData.title,
      metaDescription: seoData.metaDescription,
      canonical: seoData.canonical,
      headings: seoData.headings,
      robots: seoData.robots,
      sitemap: seoData.sitemap,
      score: seoData.score,
    },
  };

  return {
    performance: pageSpeedData.performance,
    accessibility: pageSpeedData.accessibility,
    seo: seoScore,
    bestPractices: pageSpeedData.bestPractices,
    rawData: rawData as Prisma.JsonValue,
  };
}

// Define a more specific type for the raw data structure
interface RawAnalysisData {
  pagespeed?: {
    performance?: number | null;
    accessibility?: number | null;
    bestPractices?: number | null;
    seo?: number | null;
  };
  seoAnalysis?: {
    title?: {
      exists?: boolean;
      value?: string | null;
      length?: number;
      isOptimalLength?: boolean;
    };
    metaDescription?: {
      exists?: boolean;
      value?: string | null;
      length?: number;
      isOptimalLength?: boolean;
    };
    canonical?: {
      exists?: boolean;
      value?: string | null;
      matches?: boolean;
    };
    headings?: {
      h1?: {
        count?: number;
        values?: string[];
      };
      h2?: {
        count?: number;
        values?: string[];
      };
      hasProperStructure?: boolean;
    };
    robots?: {
      exists?: boolean;
      content?: string | null;
    };
    sitemap?: {
      exists?: boolean;
      isValid?: boolean;
      url?: string | null;
    };
    score?: number;
  };
}

/**
 * Extracts key insights from analysis data
 */
export function extractInsights(analysisData: AnalysisData): {
  strengths: string[];
  improvements: string[];
} {
  const strengths: string[] = [];
  const improvements: string[] = [];

  // Performance insights
  if (analysisData.performance !== null) {
    if (analysisData.performance >= 90) {
      strengths.push("Excellent page performance score");
    } else if (analysisData.performance < 50) {
      improvements.push("Page performance needs significant improvement");
    } else if (analysisData.performance < 70) {
      improvements.push("Page performance could be improved");
    }
  }

  // Accessibility insights
  if (analysisData.accessibility !== null) {
    if (analysisData.accessibility >= 90) {
      strengths.push("Great accessibility implementation");
    } else if (analysisData.accessibility < 70) {
      improvements.push("Accessibility issues need to be addressed");
    }
  }

  // SEO insights
  if (analysisData.seo !== null) {
    if (analysisData.seo >= 90) {
      strengths.push("Strong SEO foundation");
    } else if (analysisData.seo < 70) {
      improvements.push("SEO needs improvement");
    }
  }

  // Best Practices insights
  if (analysisData.bestPractices !== null) {
    if (analysisData.bestPractices >= 90) {
      strengths.push("Follows web best practices");
    } else if (analysisData.bestPractices < 70) {
      improvements.push("Should improve adherence to web best practices");
    }
  }

  // Add SEO-specific insights if available
  const rawData = analysisData.rawData as unknown as RawAnalysisData;
  if (rawData?.seoAnalysis) {
    const seo = rawData.seoAnalysis;

    // Title insights
    if (seo.title?.exists === false) {
      improvements.push("Missing title tag");
    } else if (seo.title?.isOptimalLength === false) {
      improvements.push("Title tag length is not optimal");
    } else if (seo.title?.exists) {
      strengths.push("Well-structured title tag");
    }

    // Meta description insights
    if (seo.metaDescription?.exists === false) {
      improvements.push("Missing meta description");
    } else if (seo.metaDescription?.isOptimalLength === false) {
      improvements.push("Meta description length is not optimal");
    } else if (seo.metaDescription?.exists) {
      strengths.push("Well-structured meta description");
    }

    // Heading structure insights
    if (seo.headings?.hasProperStructure === false) {
      if (seo.headings?.h1?.count === 0) {
        improvements.push("Missing H1 heading");
      } else if (seo.headings?.h1?.count && seo.headings.h1.count > 1) {
        improvements.push("Multiple H1 headings found");
      }

      if (seo.headings?.h2?.count === 0) {
        improvements.push("No H2 headings found");
      }
    } else if (seo.headings?.hasProperStructure) {
      strengths.push("Good heading structure");
    }

    // Canonical insights
    if (seo.canonical?.exists === false) {
      improvements.push("Missing canonical tag");
    } else if (seo.canonical?.matches === false) {
      improvements.push("Canonical URL does not match page URL");
    } else if (seo.canonical?.exists) {
      strengths.push("Proper canonical tag implementation");
    }

    // Robots.txt insights
    if (seo.robots?.exists === false) {
      improvements.push("Missing robots.txt file");
    } else if (seo.robots?.exists) {
      strengths.push("robots.txt file is present");
    }

    // Sitemap insights
    if (seo.sitemap?.exists === false) {
      improvements.push("Missing sitemap.xml file");
    } else if (seo.sitemap?.isValid === false) {
      improvements.push("Invalid sitemap.xml format");
    } else if (seo.sitemap?.exists && seo.sitemap?.isValid) {
      strengths.push("Valid sitemap.xml is present");
    }
  }

  return { strengths, improvements };
}
