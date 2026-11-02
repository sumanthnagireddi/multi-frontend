import { useRef, useState } from 'react';

import { environment } from '@/shared/config/env';

const API = environment.aiApiUrl;

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  description: string;
  applyUrl: string;
  source: string;
  salary: string | null;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  freshness: string;
};

export default function JobAgentPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [resume, setResume] = useState<{ text: string; skills: string[]; suggestedQuery: string } | null>(null);
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [remote, setRemote] = useState(true);
  const [experience, setExperience] = useState('All levels');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [fileName, setFileName] = useState('');

  async function uploadResume(file: File) {
    setLoading(true);
    setError('');
    setFileName(file.name);
    try {
      const form = new FormData();
      form.append('resume', file);
      const response = await fetch(`${API}/agent/jobs/resume`, { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to read resume');
      if (!data.text?.trim()) throw new Error('No readable text was found in this resume');
      setResume(data);
      setKeywords(data.suggestedQuery || data.skills?.slice(0, 5).join(' ') || '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to parse resume');
    } finally {
      setLoading(false);
    }
  }

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setError('');
    setSearched(true);
    const skillTerms = [...new Set([
      ...keywords.split(/[,\n]/).map(value => value.trim()).filter(Boolean),
      ...(resume?.skills || []),
    ])];
    try {
      const response = await fetch(`${API}/agent/jobs/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: skillTerms,
          skills: resume?.skills || [],
          location,
          remote,
          experience,
          resumeText: resume?.text || '',
          limit: 25,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Job search failed');
      setJobs(data.jobs || []);
      if (!data.jobs?.length && data.sources?.errors?.length) {
        setError(`Live job sources are temporarily unavailable: ${data.sources.errors.join('; ')}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to search jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--canvas)] px-4 py-5 text-[var(--ink)] md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <button type="button" onClick={() => window.location.assign('/ai')} className="mb-2 text-sm font-semibold text-indigo-600 dark:text-indigo-300">← Back to AI workspace</button>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">AI Job Agent</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Scan live job sources, match skills, and rank the strongest opportunities.</p>
          </div>
          <button type="button" onClick={() => fileRef.current?.click()} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm dark:border-slate-700 dark:bg-slate-900">
            {fileName || 'Upload resume'}
          </button>
          <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.txt" hidden onChange={e => { const file = e.target.files?.[0]; if (file) void uploadResume(file); }} />
        </div>

        <form onSubmit={search} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:grid-cols-[minmax(220px,1.5fr)_minmax(170px,.8fr)_auto_auto] md:items-end">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Skills or keywords
            <input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="React, TypeScript, NestJS" className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm normal-case tracking-normal outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900" />
          </label>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Location
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Remote or Hyderabad" className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm normal-case tracking-normal outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900" />
          </label>
          <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold dark:border-slate-700">
            <input type="checkbox" checked={remote} onChange={e => setRemote(e.target.checked)} /> Remote only
          </label>
          <button type="submit" disabled={loading || (!keywords.trim() && !resume)} className="h-11 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"> {loading ? 'Scanning…' : 'Find jobs'}
          </button>
        </form>

        {resume?.skills?.length ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <strong className="text-slate-700 dark:text-slate-200">Detected skills:</strong>
            {resume.skills.slice(0, 14).map(skill => <span key={skill} className="rounded-full border border-slate-200 px-2.5 py-1 text-xs dark:border-slate-700">{skill}</span>)}
          </div>
        ) : null}
        {error ? <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">{error}</div> : null}

        <section className="mt-5">
          {!searched ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center dark:border-slate-700">
              <div className="text-4xl">◎</div>
              <h2 className="mt-3 text-lg font-bold">Ready to scan the live job market</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">Upload a resume or enter skills, then search across active public job feeds.</p>
            </div>
          ) : loading ? (
            <div className="py-16 text-center text-sm font-semibold text-slate-500">Matching live opportunities…</div>
          ) : jobs.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500">No matching jobs found. Try broader skills or remove the location filter.</div>
          ) : (
            <div className="space-y-3">
              {jobs.map(job => (
                <article key={`${job.source}-${job.id}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold">{job.title}</h2>
                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{job.matchScore}% match</span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">{job.company} · {job.location}</p>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{job.description}</p>
                      {job.matchedSkills?.length ? <div className="mt-3 flex flex-wrap gap-1.5">{job.matchedSkills.slice(0, 8).map(skill => <span key={skill} className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{skill}</span>)}</div> : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                      <span className="text-xs text-slate-400">{job.source} · {job.freshness}</span>
                      <a href={job.applyUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white dark:bg-white dark:text-slate-950">View & apply</a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
