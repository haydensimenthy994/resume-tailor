import { useState } from "react";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import JobSearch from "./components/JobSearch";
import ResumeUploader from "./components/ResumeUploader";

export default function App() {
  const [selectedJob, setSelectedJob] = useState(null);

  // Apply light or dark theme to the root
  const rootClasses = selectedJob
    ? "min-h-screen flex flex-col bg-gray-900 text-white"
    : "min-h-screen flex flex-col bg-gray-50 text-gray-900";

  return (
    <div className={rootClasses}>
      {/* Site Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-700">Resume Tailor</h1>
          <nav className="space-x-4">
            <button className="text-sm text-green-700 hover:underline">Home</button>
            <button className="text-sm text-green-700 hover:underline">About</button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-10">
        {selectedJob ? (
          <>
            {/* Back Button */}
            <button
              onClick={() => setSelectedJob(null)}
              className="mb-6 text-sm underline text-blue-400"
            >
              ← Back to Search
            </button>

            {/* Job Details + Resume Uploader */}
            <div className="space-y-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-2">
                  {selectedJob.job_title}
                </h2>
                <p className="text-gray-400 mb-1">
                  {selectedJob.employer_name} • {selectedJob.job_city}
                </p>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">
                  {selectedJob.job_description}
                </p>
              </div>

              <ResumeUploader jobDescription={selectedJob.job_description} />
            </div>
          </>
        ) : (
          // Job Search + Upload Layout
          <div className="flex items-start space-x-6">
            {/* Job Search on left */}
            <div className="flex-1">
              <JobSearch onSelectJob={setSelectedJob} />
            </div>
            {/* Upload Resume button on right of search */}
            <div>
              <ResumeUploader />
            </div>
          </div>
        )}
      </main>

      {/* Site Footer */}
      <footer className="bg-white border-t">
        <div className="container mx-auto px-6 py-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Resume Tailor. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
