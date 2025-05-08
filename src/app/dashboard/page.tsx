"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import Link from "next/link";

interface Url {
  id: string;
  url: string;
  lastScanned: string | null;
  createdAt: string;
}

interface Stats {
  urlCount: number;
  latestAnalysis: string | null;
  averageScore: number | null;
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [urls, setUrls] = useState<Url[]>([]);
  const [stats, setStats] = useState<Stats>({
    urlCount: 0,
    latestAnalysis: null,
    averageScore: null,
  });
  const [newUrl, setNewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUrls();
    fetchStats();
  }, []);

  const fetchUrls = async () => {
    try {
      const response = await fetch("/api/urls");
      if (!response.ok) throw new Error("Failed to fetch URLs");
      const data = await response.json();
      setUrls(data);
    } catch {
      setError("Failed to load URLs");
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data);
    } catch {
      console.error("Failed to load stats");
    }
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateUrl(newUrl)) {
      setError("Please enter a valid URL");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/urls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: newUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to add URL");
      }

      const data = await response.json();
      setUrls([...urls, data]);
      setNewUrl("");
      setIsModalOpen(false);
      fetchStats(); // Refresh stats after adding a URL
    } catch {
      setError("Failed to add URL. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/urls/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete URL");
      }

      setUrls(urls.filter((url) => url.id !== id));
      fetchStats(); // Refresh stats after deleting a URL
    } catch {
      setError("Failed to delete URL. Please try again.");
    }
  };

  const handleRescan = async (id: string) => {
    try {
      const response = await fetch(`/api/urls/${id}/rescan`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to rescan URL");
      }

      await fetchUrls();
      fetchStats(); // Refresh stats after rescanning
    } catch {
      setError("Failed to rescan URL. Please try again.");
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-gray-900 text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {user.firstName || "User"}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add new URL
            </Button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-medium mb-4">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">URLs Monitored</p>
              <p className="text-2xl font-bold">{stats.urlCount || 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Latest Analysis</p>
              <p className="text-2xl font-bold">
                {stats.latestAnalysis
                  ? new Date(stats.latestAnalysis).toLocaleDateString()
                  : "-"}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Average Score</p>
              <p className="text-2xl font-bold">
                {stats.averageScore !== null ? (
                  <span
                    className={`
                    ${
                      stats.averageScore >= 90
                        ? "text-green-600"
                        : stats.averageScore >= 70
                        ? "text-yellow-600"
                        : "text-red-600"
                    }
                  `}
                  >
                    {stats.averageScore}
                  </span>
                ) : (
                  "-"
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Your URLs</h2>
          </div>

          {urls.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                You haven&apos;t added any URLs yet.
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add your first URL
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-300">
              {urls.map((url) => (
                <div
                  key={url.id}
                  className="p-6 flex items-center justify-between"
                >
                  <div>
                    <Link href={`/dashboard/urls/${url.id}`}>
                      <h3 className="font-medium text-blue-600 hover:underline">
                        {url.url}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500">
                      Last scanned:{" "}
                      {url.lastScanned
                        ? new Date(url.lastScanned).toLocaleString()
                        : "Never"}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/dashboard/urls/${url.id}`}>
                      <Button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                        View Details
                      </Button>
                    </Link>
                    <Button
                      onClick={() => handleRescan(url.id)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Rescan
                    </Button>
                    <Button
                      onClick={() => handleDelete(url.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New URL"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              URL to Monitor
            </label>
            <input
              type="text"
              id="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? "Adding..." : "Add URL"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
