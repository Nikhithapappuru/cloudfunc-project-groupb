import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import StatusBadge from '../components/shared/StatusBadge'

export default function Dashboard() {
  const navigate = useNavigate()

  const [jobs, setJobs]           = useState([])
  const [functions, setFunctions] = useState([])  // ✅ NEW: fetch functions count too

  // ✅ CHANGED: fetch both jobs and functions from backend
  useEffect(() => {
    api.get('/jobs')
      .then(res => setJobs(res.data))
      .catch(() => setJobs([]))

    api.get('/functions')
      .then(res => setFunctions(res.data))
      .catch(() => setFunctions([]))
  }, [])

  // ✅ CHANGED: compute stats from real data instead of hardcoding
  const completedJobs = jobs.filter(j => j.status === 'completed').length
  const queuedJobs    = jobs.filter(j => j.status === 'queued' || j.status === 'running').length
  const failedJobs    = jobs.filter(j => j.status === 'failed').length
  const failureRate   = jobs.length > 0 ? ((failedJobs / jobs.length) * 100).toFixed(1) : '0.0'

  const stats = [
    {
      label: 'Functions Registered',
      value: functions.length,
      delta: functions.length === 0 ? 'None registered yet' : `${functions.length} total`,
      color: 'text-cyan-400',
      border: 'border-t-cyan-400'
    },
    {
      label: 'Jobs Completed',
      value: completedJobs,
      delta: completedJobs === 0 ? 'No jobs yet' : `${completedJobs} completed`,
      color: 'text-green-400',
      border: 'border-t-green-400'
    },
    {
      label: 'Jobs Queued / Running',
      value: queuedJobs,
      delta: queuedJobs === 0 ? 'Nothing running' : 'Processing now',
      color: 'text-yellow-400',
      border: 'border-t-yellow-400'
    },
    {
      label: 'Jobs Failed',
      value: failedJobs,
      delta: jobs.length === 0 ? 'No jobs yet' : `${failureRate}% failure rate`,
      color: 'text-red-400',
      border: 'border-t-red-400'
    },
  ]

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#e2e8f0] font-mono">
      <div className="max-w-5xl mx-auto p-8">

        {/* Header */}
        <div className="inline-block text-xs text-slate-500 uppercase tracking-widest border border-[#1f2530] bg-[#181c24] px-3 py-1 rounded-full mb-4">
          Page 01 / Dashboard
        </div>
        <h1 className="text-3xl font-bold text-white mb-1" style={{fontFamily:'sans-serif'}}>Dashboard</h1>
        <p className="text-slate-500 text-sm mb-8">System overview — live metrics and recent activity</p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className={`bg-[#111318] border border-[#1f2530] border-t-2 ${s.border} rounded-xl p-5`}>
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">{s.label}</div>
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-1">{s.delta}</div>
            </div>
          ))}
        </div>

        {/* Recent Jobs */}
        <div className="bg-[#111318] border border-[#1f2530] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f2530]">
            <div className="font-bold text-white">Recent Jobs</div>
            <button
              onClick={() => navigate('/invoke')}
              className="bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-bold px-4 py-2 rounded-lg transition-all"
            >
              + Invoke Function
            </button>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1f2530]">
                {['Job ID','Function','Submitted','Duration','Status','Result'].map(h => (
                  <th key={h} className="text-left text-xs text-slate-500 uppercase tracking-widest px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-slate-600 py-10 text-sm">
                    No jobs yet — invoke a function to get started
                  </td>
                </tr>
              ) : (
                jobs.map((job, i) => (
                  <tr
                    key={i}
                    className="border-b border-[#0f131a] hover:bg-[#181c24] transition-all cursor-pointer"
                    onClick={() => navigate(`/jobs/${job.job_id}`)}
                  >
                    <td className="px-4 py-3 text-xs text-slate-500">{job.job_id?.slice(0, 12)}…</td>
                    <td className="px-4 py-3 text-sm">{job.function_name}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{job.submitted_at}</td>
                    <td className="px-4 py-3 text-sm">{job.result?.executionTime ?? '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
                    <td className={`px-4 py-3 text-sm ${
                      job.status === 'completed' ? 'text-green-400' :
                      job.status === 'failed'    ? 'text-red-400'   : 'text-slate-500'
                    }`}>
                      {job.result?.result ?? job.error ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}