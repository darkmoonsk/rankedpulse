"use client";

import { useState } from "react";
import { Prisma } from "@prisma/client";
import { Button } from "../ui/button";

type AnalysisResultsProps = {
  analysis: {
    id: string;
    createdAt: string;
    performance: number | null;
    accessibility: number | null;
    seo: number | null;
    bestPractices: number | null;
    rawData?: Prisma.JsonValue;
  };
  insights: {
    strengths: string[];
    improvements: string[];
  };
};

// Type for the SEO analysis data structure in rawData
interface SeoAnalysisData {
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
}

export function AnalysisResults({ analysis, insights }: AnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "seo" | "performance" | "accessibility" | "bestPractices"
  >("overview");

  // Format date
  const formattedDate = new Date(analysis.createdAt).toLocaleString();

  // Helper function to render score with color
  const renderScore = (score: number | null) => {
    if (score === null) return <span className="text-gray-500">N/A</span>;

    let colorClass = "text-red-500";
    if (score >= 90) colorClass = "text-green-500";
    else if (score >= 70) colorClass = "text-yellow-500";

    return (
      <span className={`${colorClass} font-bold`}>{Math.round(score)}</span>
    );
  };

  // Extract SEO analysis data from rawData if available
  const seoAnalysis =
    analysis.rawData &&
    typeof analysis.rawData === "object" &&
    analysis.rawData !== null &&
    "seoAnalysis" in analysis.rawData
      ? (analysis.rawData as unknown as { seoAnalysis: SeoAnalysisData })
          .seoAnalysis
      : undefined;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Analysis Results</h2>
          <span className="text-sm text-gray-500">{formattedDate}</span>
        </div>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-sm text-gray-500 mb-1">Performance</div>
          <div className="text-2xl">{renderScore(analysis.performance)}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-sm text-gray-500 mb-1">Accessibility</div>
          <div className="text-2xl">{renderScore(analysis.accessibility)}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-sm text-gray-500 mb-1">SEO</div>
          <div className="text-2xl">{renderScore(analysis.seo)}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-sm text-gray-500 mb-1">Best Practices</div>
          <div className="text-2xl">{renderScore(analysis.bestPractices)}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <Button
            onClick={() => setActiveTab("overview")}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === "overview"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Overview
          </Button>
          <Button
            onClick={() => setActiveTab("performance")}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === "performance"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Performance
          </Button>
          <Button
            onClick={() => setActiveTab("seo")}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === "seo"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            SEO
          </Button>
          <Button
            onClick={() => setActiveTab("accessibility")}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === "accessibility"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Accessibility
          </Button>
          <Button
            onClick={() => setActiveTab("bestPractices")}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === "bestPractices"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Best Practices
          </Button>
        </nav>
      </div>

      {/* Tab content */}
      <div className="p-4">
        {activeTab === "overview" && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2 text-green-600">
                Strengths
              </h3>
              {insights.strengths.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {insights.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      {strength}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  No strengths identified.
                </p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2 text-amber-600">
                Areas for Improvement
              </h3>
              {insights.improvements.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {insights.improvements.map((improvement, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      {improvement}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No improvements needed.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "seo" && (
          <div>
            {seoAnalysis ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-md font-medium mb-2">Title Tag</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between">
                      <span className="text-sm">Exists</span>
                      <span
                        className={
                          seoAnalysis.title?.exists
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {seoAnalysis.title?.exists ? "Yes" : "No"}
                      </span>
                    </div>
                    {seoAnalysis.title?.value && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-500">Content:</span>
                        <p className="text-sm mt-1 font-medium">
                          {seoAnalysis.title.value}
                        </p>
                      </div>
                    )}
                    <div className="flex justify-between mt-2">
                      <span className="text-sm">Length</span>
                      <span
                        className={
                          seoAnalysis.title?.isOptimalLength
                            ? "text-green-500"
                            : "text-amber-500"
                        }
                      >
                        {seoAnalysis.title?.length} characters
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium mb-2">Meta Description</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between">
                      <span className="text-sm">Exists</span>
                      <span
                        className={
                          seoAnalysis.metaDescription?.exists
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {seoAnalysis.metaDescription?.exists ? "Yes" : "No"}
                      </span>
                    </div>
                    {seoAnalysis.metaDescription?.value && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-500">Content:</span>
                        <p className="text-sm mt-1">
                          {seoAnalysis.metaDescription.value}
                        </p>
                      </div>
                    )}
                    <div className="flex justify-between mt-2">
                      <span className="text-sm">Length</span>
                      <span
                        className={
                          seoAnalysis.metaDescription?.isOptimalLength
                            ? "text-green-500"
                            : "text-amber-500"
                        }
                      >
                        {seoAnalysis.metaDescription?.length} characters
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium mb-2">Headings</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between">
                      <span className="text-sm">H1 Count</span>
                      <span
                        className={
                          seoAnalysis.headings?.h1?.count === 1
                            ? "text-green-500"
                            : "text-amber-500"
                        }
                      >
                        {seoAnalysis.headings?.h1?.count}
                      </span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm">H2 Count</span>
                      <span
                        className={
                          seoAnalysis.headings?.h2?.count &&
                          seoAnalysis.headings.h2.count > 0
                            ? "text-green-500"
                            : "text-amber-500"
                        }
                      >
                        {seoAnalysis.headings?.h2?.count}
                      </span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm">Structure</span>
                      <span
                        className={
                          seoAnalysis.headings?.hasProperStructure
                            ? "text-green-500"
                            : "text-amber-500"
                        }
                      >
                        {seoAnalysis.headings?.hasProperStructure
                          ? "Good"
                          : "Needs Improvement"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-md font-medium mb-2">Canonical Tag</h3>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between">
                        <span className="text-sm">Exists</span>
                        <span
                          className={
                            seoAnalysis.canonical?.exists
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {seoAnalysis.canonical?.exists ? "Yes" : "No"}
                        </span>
                      </div>
                      {seoAnalysis.canonical?.value && (
                        <div className="mt-2">
                          <span className="text-sm text-gray-500">URL:</span>
                          <p className="text-sm mt-1 break-all">
                            {seoAnalysis.canonical.value}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md font-medium mb-2">Robots.txt</h3>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between">
                        <span className="text-sm">Exists</span>
                        <span
                          className={
                            seoAnalysis.robots?.exists
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {seoAnalysis.robots?.exists ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium mb-2">Sitemap</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between">
                      <span className="text-sm">Exists</span>
                      <span
                        className={
                          seoAnalysis.sitemap?.exists
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {seoAnalysis.sitemap?.exists ? "Yes" : "No"}
                      </span>
                    </div>
                    {seoAnalysis.sitemap?.exists && (
                      <div className="flex justify-between mt-2">
                        <span className="text-sm">Valid Format</span>
                        <span
                          className={
                            seoAnalysis.sitemap?.isValid
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {seoAnalysis.sitemap?.isValid ? "Yes" : "No"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No SEO analysis data available.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "performance" && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {analysis.performance !== null
                ? `Performance score: ${Math.round(analysis.performance)}`
                : "No performance data available."}
            </p>
            {/* We could add more detailed performance metrics here in the future */}
          </div>
        )}

        {activeTab === "accessibility" && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {analysis.accessibility !== null
                ? `Accessibility score: ${Math.round(analysis.accessibility)}`
                : "No accessibility data available."}
            </p>
            {/* We could add more detailed accessibility metrics here in the future */}
          </div>
        )}

        {activeTab === "bestPractices" && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {analysis.bestPractices !== null
                ? `Best Practices score: ${Math.round(analysis.bestPractices)}`
                : "No best practices data available."}
            </p>
            {/* We could add more detailed best practices metrics here in the future */}
          </div>
        )}
      </div>
    </div>
  );
}
