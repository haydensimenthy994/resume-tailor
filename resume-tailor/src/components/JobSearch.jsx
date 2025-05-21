"use client"

import { useState, useEffect } from "react"
import ResumeUploader from "./ResumeUploader"

export default function JobSearch() {
  const [query, setQuery] = useState("")
  const [location, setLocation] = useState("")
  const [jobType, setJobType] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)

  // Autocomplete for 'Where'
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)

  useEffect(() => {
    if (!location || location.length < 2) {
      setLocationSuggestions([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://${import.meta.env.VITE_GEODB_HOST}/v1/geo/cities?limit=10&countryIds=AU&namePrefix=${encodeURIComponent(
            location
          )}`,
          {
            method: "GET",
            headers: {
              "X-RapidAPI-Key": import.meta.env.VITE_RAPIDAPI_GEODB_KEY,
              "X-RapidAPI-Host": import.meta.env.VITE_GEODB_HOST,
            },
          }
        )
        const data = await res.json()
        const names = data.data.map(
          (city) =>
            `${city.name} ${city.regionCode}${city.postalCodes?.[0] ? ` ${city.postalCodes[0]}` : ""}`
        )
        setLocationSuggestions(names)
      } catch (err) {
        console.error("Location suggestion error:", err)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [location])

  // Fetch jobs
  const fetchJobs = async () => {
    setLoading(true)
    try {
      const fullQuery = `${query} ${location}`.trim()
      const res = await fetch(
        `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(
          fullQuery
        )}&num_pages=1`,
        {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": import.meta.env.VITE_RAPIDAPI_KEY,
            "X-RapidAPI-Host": import.meta.env.VITE_RAPIDAPI_HOST,
          },
        }
      )
      const { data } = await res.json()
      setResults(data || [])
    } catch (err) {
      console.error("Job fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  // Filter client-side by employment type
  const filteredResults = jobType
    ? results.filter(
        (job) =>
          job.job_employment_type?.toLowerCase() === jobType.toLowerCase()
      )
    : results

  return (
    <div className="min-h-screen bg-gray-50 lg:flex lg:space-x-6">
      {/* Sidebar */}
      <div className="lg:w-1/3 w-full p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Search Jobs</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">What</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Job title, company…"
              className="mt-1 w-full p-2 border rounded focus:ring-green-500"
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium">Where</label>
            <input
              type="text"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value)
                setShowLocationSuggestions(true)
              }}
              onFocus={() => setShowLocationSuggestions(true)}
              onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
              placeholder="City, state…"
              className="mt-1 w-full p-2 border rounded focus:ring-green-500"
            />
            {showLocationSuggestions && locationSuggestions.length > 0 && (
              <ul className="absolute bg-white border w-full mt-1 rounded max-h-40 overflow-auto z-10">
                {locationSuggestions.map((name) => (
                  <li
                    key={name}
                    onMouseDown={() => {
                      setLocation(name)
                      setShowLocationSuggestions(false)
                    }}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex space-x-2">
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">All job types</option>
              <option value="full time">Full-time</option>
              <option value="part time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="temporary">Temporary</option>
              <option value="internship">Internship</option>
            </select>
            <button
              onClick={fetchJobs}
              className="bg-green-600 text-white px-4 rounded hover:bg-green-700"
            >
              Search
            </button>
            <button
              onClick={() => {
                setQuery("")
                setLocation("")
                setJobType("")
                setResults([])
              }}
              className="text-blue-600 hover:underline"
            >
              Reset
            </button>
          </div>
        </div>
        <div className="mt-6">
          {loading ? (
            <p>Loading jobs…</p>
          ) : (
            <ul className="space-y-4">
              {filteredResults.map((job) => (
                <li
                  key={job.job_id}
                  onClick={() => setSelectedJob(job)}
                  className="p-3 border rounded hover:bg-gray-50 cursor-pointer"
                >
                  <h3 className="font-medium">{job.job_title}</h3>
                  <p className="text-sm text-gray-600">
                    {job.employer_name} — {job.job_city || "Remote"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 w-full p-6 bg-white rounded-lg shadow-md">
        {selectedJob ? (
          <>
            <button
              onClick={() => setSelectedJob(null)}
              className="mb-4 text-sm text-blue-600 hover:underline"
            >
              ← Back to list
            </button>
            <h2 className="text-2xl font-bold">
              {selectedJob.job_title}
            </h2>
            <p className="text-gray-600 mb-4">
              {selectedJob.employer_name} — {selectedJob.job_city || "Remote"}
            </p>
            <div
              className="prose max-w-none mb-6"
              dangerouslySetInnerHTML={{
                __html: selectedJob.job_description,
              }}
            />
            <ResumeUploader jobDescription={selectedJob.job_description} />
          </>
        ) : (
          <p className="text-gray-500">Select a job to view details</p>
        )}
      </div>
    </div>
  )
}
