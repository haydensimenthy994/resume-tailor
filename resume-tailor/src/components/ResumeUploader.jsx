import { useState } from 'react';
// Import PDF.js and its worker, ensuring Vite treats the worker as an asset URL
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.js?url';

// Set the workerSrc to the imported URL
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function ResumeUploader({ jobDescription }) {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  // Extract text from PDF or plain-text file
  const extractText = async (file) => {
    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      let text = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item) => item.str).join(' ') + '\n';
      }

      return text;
    } else if (file.type === 'text/plain') {
      return await file.text();
    }

    throw new Error('Unsupported file type. Please upload a PDF or TXT file.');
  };

  // Call OpenAI's Chat Completion endpoint for feedback
  const getResumeFeedback = async (jobDescription, resumeText) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a professional resume reviewer. Provide concise, actionable feedback on how well the resume matches the job description. Also provide tips on where I can make improvements on my resume',
          },
          {
            role: 'user',
            content: `Job Description:\n"""${jobDescription}"""\n\nResume:\n"""${resumeText}"""`,
          },
        ],
        temperature: 0.2,
        max_tokens: 800,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    return data.choices[0].message.content.trim();
  };

  // Handle file selection and kick off analysis
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setFeedback('');

    try {
      const resumeText = await extractText(file);
      const aiFeedback = await getResumeFeedback(jobDescription, resumeText);
      setFeedback(aiFeedback);
    } catch (err) {
      console.error(err);
      setFeedback(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-uploader">
      <input
        type="file"
        accept=".pdf,text/plain"
        onChange={handleFileChange}
      />

      {loading && <p>⏳ Analyzing resume…</p>}

      {feedback && (
        <div className="feedback">
          <h3>Feedback:</h3>
          <pre>{feedback}</pre>
        </div>
      )}
    </div>
  );
}