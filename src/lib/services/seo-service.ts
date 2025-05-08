/**
 * SEO Analysis Service
 * Handles basic SEO verification for websites
 */

import * as cheerio from "cheerio";

export type SeoAnalysisResult = {
  title: {
    exists: boolean;
    value: string | null;
    length: number;
    isOptimalLength: boolean;
  };
  metaDescription: {
    exists: boolean;
    value: string | null;
    length: number;
    isOptimalLength: boolean;
  };
  canonical: {
    exists: boolean;
    value: string | null;
    matches: boolean;
  };
  headings: {
    h1: {
      count: number;
      values: string[];
    };
    h2: {
      count: number;
      values: string[];
    };
    hasProperStructure: boolean;
  };
  robots: {
    exists: boolean;
    content: string | null;
  };
  sitemap: {
    exists: boolean;
    isValid: boolean;
    url: string | null;
  };
  score: number;
};

/**
 * Analyzes SEO aspects of a given URL
 */
export async function analyzeSeo(url: string): Promise<SeoAnalysisResult> {
  try {
    // Fetch the HTML content of the URL
    const response = await fetch(url, { next: { revalidate: 0 } });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch URL: ${response.status} ${response.statusText}`
      );
    }

    const html = await response.text();
    const parsedUrl = new URL(url);
    const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;

    // Parse the HTML content using cheerio
    const $ = cheerio.load(html);

    // Analyze title
    const titleElement = $("title");
    const titleText = titleElement.text();
    const titleResult = {
      exists: titleElement.length > 0,
      value: titleElement.length > 0 ? titleText : null,
      length: titleText.length,
      isOptimalLength: false,
    };
    titleResult.isOptimalLength =
      titleResult.length >= 30 && titleResult.length <= 60;

    // Analyze meta description
    const metaDescElement = $('meta[name="description"]');
    const metaDescContent = metaDescElement.attr("content") || null;
    const metaDescResult = {
      exists: metaDescElement.length > 0,
      value: metaDescContent,
      length: metaDescContent?.length || 0,
      isOptimalLength: false,
    };
    metaDescResult.isOptimalLength =
      metaDescResult.length >= 120 && metaDescResult.length <= 160;

    // Analyze canonical
    const canonicalElement = $('link[rel="canonical"]');
    const canonicalUrl = canonicalElement.attr("href") || null;
    const canonicalResult = {
      exists: canonicalElement.length > 0,
      value: canonicalUrl,
      matches: canonicalUrl === url,
    };

    // Analyze headings
    const h1Elements = $("h1");
    const h2Elements = $("h2");
    const headingsResult = {
      h1: {
        count: h1Elements.length,
        values: h1Elements
          .map((_, el) => $(el).text())
          .get()
          .filter(Boolean),
      },
      h2: {
        count: h2Elements.length,
        values: h2Elements
          .map((_, el) => $(el).text())
          .get()
          .filter(Boolean),
      },
      hasProperStructure: false,
    };
    headingsResult.hasProperStructure =
      headingsResult.h1.count === 1 && headingsResult.h2.count > 0;

    // Check robots.txt
    let robotsResult = { exists: false, content: null as string | null };
    try {
      const robotsResponse = await fetch(`${baseUrl}/robots.txt`, {
        next: { revalidate: 0 },
      });
      robotsResult = {
        exists: robotsResponse.ok,
        content: robotsResponse.ok ? await robotsResponse.text() : null,
      };
    } catch (error) {
      console.error("Error checking robots.txt:", error);
    }

    // Check sitemap.xml
    let sitemapResult = {
      exists: false,
      isValid: false,
      url: null as string | null,
    };
    try {
      const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`, {
        next: { revalidate: 0 },
      });
      const sitemapContent = sitemapResponse.ok
        ? await sitemapResponse.text()
        : null;
      sitemapResult = {
        exists: sitemapResponse.ok,
        isValid:
          (sitemapResponse.ok && sitemapContent?.includes("<urlset")) || false,
        url: sitemapResponse.ok ? `${baseUrl}/sitemap.xml` : null,
      };
    } catch (error) {
      console.error("Error checking sitemap.xml:", error);
    }

    // Calculate SEO score (simple algorithm)
    let scorePoints = 0;
    let totalPoints = 0;

    // Title checks (20 points)
    if (titleResult.exists) scorePoints += 10;
    if (titleResult.isOptimalLength) scorePoints += 10;
    totalPoints += 20;

    // Meta description checks (20 points)
    if (metaDescResult.exists) scorePoints += 10;
    if (metaDescResult.isOptimalLength) scorePoints += 10;
    totalPoints += 20;

    // Canonical checks (10 points)
    if (canonicalResult.exists) scorePoints += 5;
    if (canonicalResult.matches) scorePoints += 5;
    totalPoints += 10;

    // Headings checks (20 points)
    if (headingsResult.h1.count === 1) scorePoints += 10;
    if (headingsResult.h2.count > 0) scorePoints += 10;
    totalPoints += 20;

    // Robots.txt checks (15 points)
    if (robotsResult.exists) scorePoints += 15;
    totalPoints += 15;

    // Sitemap checks (15 points)
    if (sitemapResult.exists) scorePoints += 10;
    if (sitemapResult.isValid) scorePoints += 5;
    totalPoints += 15;

    const score = Math.round((scorePoints / totalPoints) * 100);

    return {
      title: titleResult,
      metaDescription: metaDescResult,
      canonical: canonicalResult,
      headings: headingsResult,
      robots: robotsResult,
      sitemap: sitemapResult,
      score,
    };
  } catch (error) {
    console.error("Error analyzing SEO:", error);
    throw error;
  }
}
