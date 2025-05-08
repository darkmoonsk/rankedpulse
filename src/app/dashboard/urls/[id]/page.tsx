"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AnalysisResults } from "@/components/analysis/analysis-results";
import { Button } from "@/components/ui/button";
import { Prisma } from "@prisma/client";

interface Analysis {
  id: string;
  createdAt: string;
  performance: number | null;
  accessibility: number | null;
  seo: number | null;
  bestPractices: number | null;
  rawData: Prisma.JsonValue;
}

interface Insights {
  strengths: string[];
  improvements: string[];
}

interface UrlDetails {
  id: string;
  url: string;
  lastScanned: string | null;
  createdAt: string;
}

export default function UrlDetailsPage() {
  const params = useParams();
  const urlId = params.id as string;

  const [url, setUrl] = useState<UrlDetails | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [insights, setInsights] = useState<Insights>({
    strengths: [],
    improvements: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");

  // Fetch URL details and analysis data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");

      try {
        // Fetch URL details
        const urlResponse = await fetch(`/api/urls/${urlId}`);
        if (!urlResponse.ok) throw new Error("Failed to fetch URL details");
        const urlData = await urlResponse.json();
        setUrl(urlData);

        // Fetch analysis data
        const analysisResponse = await fetch(`/api/urls/${urlId}/analysis`);
        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json();
          setAnalysis(analysisData.analysis);
          setInsights(analysisData.insights);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [urlId]);

  // Handle rescan
  const handleRescan = async () => {
    setIsScanning(true);
    setError("");

    try {
      const response = await fetch(`/api/urls/${urlId}/rescan`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to rescan URL");
      }

      // Refetch analysis data after rescan
      const analysisResponse = await fetch(`/api/urls/${urlId}/analysis`);
      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        setAnalysis(analysisData.analysis);
        setInsights(analysisData.insights);
      }

      // Update URL data to get new lastScanned timestamp
      const urlResponse = await fetch(`/api/urls/${urlId}`);
      if (urlResponse.ok) {
        const urlData = await urlResponse.json();
        setUrl(urlData);
      }
    } catch (error) {
      console.error("Error rescanning URL:", error);
      setError("Failed to rescan URL. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
            URL not found or you don&apos;t have permission to view it.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              URL Details
            </h1>
            <p className="text-gray-600 break-all">{url.url}</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={handleRescan}
              disabled={isScanning}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isScanning ? "Scanning..." : "Rescan Now"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700 mb-6">
            {error}
          </div>
        )}

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Last Scanned</p>
              <p className="font-medium">
                {url.lastScanned
                  ? new Date(url.lastScanned).toLocaleString()
                  : "Never"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Added On</p>
              <p className="font-medium">
                {new Date(url.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {analysis ? (
          <AnalysisResults analysis={analysis} insights={insights} />
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
            <p className="text-gray-500 mb-4">
              No analysis data available for this URL yet.
            </p>
            <Button
              onClick={handleRescan}
              disabled={isScanning}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isScanning ? "Scanning..." : "Run First Analysis"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
