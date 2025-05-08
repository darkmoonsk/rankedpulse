/**
 * PageSpeed Insights API Service
 * Handles interactions with Google PageSpeed Insights API
 */

import { Prisma } from "@prisma/client";

type PageSpeedResult = {
  performance: number | null;
  accessibility: number | null;
  bestPractices: number | null;
  seo: number | null;
  rawData: Prisma.JsonValue;
};

/**
 * Fetches performance metrics from PageSpeed Insights API
 */
export async function analyzeUrl(url: string): Promise<PageSpeedResult> {
  try {
    const apiKey = process.env.PAGESPEED_API_KEY;

    if (!apiKey) {
      throw new Error("PageSpeed API key is not configured");
    }

    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
      url
    )}&key=${apiKey}&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo`;

    const response = await fetch(apiUrl, { next: { revalidate: 0 } });

    if (!response.ok) {
      throw new Error(
        `PageSpeed API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Extract scores from the API response
    const categories = data.lighthouseResult?.categories || {};

    return {
      performance: categories.performance?.score
        ? categories.performance.score * 100
        : null,
      accessibility: categories.accessibility?.score
        ? categories.accessibility.score * 100
        : null,
      bestPractices: categories["best-practices"]?.score
        ? categories["best-practices"].score * 100
        : null,
      seo: categories.seo?.score ? categories.seo.score * 100 : null,
      rawData: data as Prisma.JsonValue,
    };
  } catch (error) {
    console.error("Error analyzing URL with PageSpeed:", error);
    throw error;
  }
}
