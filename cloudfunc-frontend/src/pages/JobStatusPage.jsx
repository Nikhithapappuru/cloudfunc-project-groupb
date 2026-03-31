import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import gateway from '../api/gateway'              // ✅ NEW: import axios instance
import StatusBadge from '../components/shared/StatusBadge'

// ✅ REMOVED: mock job data — we fetch real data now

const logs = [
  { time: '14:23:01.002', service: 'GATEWAY',   color: 'text-blue-400',   message: <>Job received — <span className="text-cyan-400">addNumbers</span> · payload <span className="text-yellow-400">{'{a:5, b:10}'}</span></> },
  { time: '14:23:01.045', service: 'QUEUE',      color: 'text-yellow-400', message: <>Job published to RabbitMQ · queue <span className="text-cyan-400">executions</span> · status → <span className="text-yellow-400">queued</span></> },
  { time: '14:23:01.112', service: 'WORKER',     color: 'text-purple-400', message: <>Job picked up by worker · attempt <span className="text-cyan-400">1 / 3</span> · status → <span className="text-blue-400">running</span></> },
  { time: '14:23:01.134', service: 'CONTAINER',  color: 'text-pink-400',   message: <>Warm container found · image <span className="text-cyan-400">node-add:v1</span> · reused · cold start skipped ⚡</> },
  { time: '14:23:01.198', service: 'RUNNER',     color: 'text-green-400',  message: <>Function executed · duration <span className="text-green-400">2ms</span> · result <span className="text-yellow-400">15</span></> },
  { time: '14:23:01.221', service: 'REGISTRY',   color: 'text-green-400',  message: <>Job result saved to PostgreSQL · status → <span className="text-green-400">completed</span> ✓</> },
]

export default function JobStatusPage() {
  const { jobId } = useParams()
  const [inputId, setInputId]   = useState(jobId || '')
  const [apiKey, setApiKey]     = useState('')            // ✅ NEW: API key state
  const [job, setJob]           = useState(null)          // ✅ CHANGED: null instead of mock data
  const [logsOpen, setLogsOpen] = useState(true)
  const [error, setError]       = useState(null)          // ✅ NEW: error state
  const [loading, setLoading]   = useState(false)         // ✅ NEW: loading state

  // ✅ NEW: auto-fetch job if jobId comes from URL (e.g. navigated from Invoke page)
  useEffect(() => {
    if (jobId && apiKey) {
      fetchJob(jobId)
    }
  }, [])

  // ✅ NEW: real fetch function
  async function fetchJob(id) {
    if (!id) return setError('Please enter a Job ID')
    if (!apiKey) return setError('Please enter your API key')

    try {
      setLoading(true)
      setError(null)
      const res = await gateway.get(`/jobs/${id}`, {
        headers: { 'X-API-Key': apiKey }
      })
      setJob(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Job not found')
      setJob(null)
    } finally {
      setLoading(false)
    }
  }

  const steps = ['queued', 'running', 'completed']
  const currentStep = job ? steps.indexOf(job.status) : -1

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#e2e8f0] font-mono">
      <div className="max-w-5xl mx-auto p-8">

        {/* Header */}
        <div className="inline-block text-xs text-slate-500 uppercase tracking-widest border border-[#1f2530] bg-[#181c24] px-3 py-1 rounded-full mb-4">
          Page 04 / Job Status
        </div>
        <h1 className="text-3xl font-bold text-white mb-1" style={{fontFamily:'sans-serif'}}>Job Status</h1>
        <p className="text-slate-500 text-sm mb-8">Track execution status and retrieve results in real-time</p>

        {/* ✅ CHANGED: Search now has API key input + calls real backend */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={inputId}
            onChange={e => setInputId(e.target.value)}
            placeholder="Enter Job ID..."
            className="flex-1 bg-[#181c24] border border-[#1f2530] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400 transition-all"
          />
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="API Key"
            className="w-40 bg-[#181c24] border border-[#1f2530] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400 transition-all"
          />
          <button
            onClick={() => fetchJob(inputId)}
            disabled={loading}
            className="bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-sm px-5 py-2.5 rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Track Job'}
          </button>
        </div>

        {/* ✅ NEW: error message */}
        {error && (
          <div className="mb-6 text-red-400 text-xs bg-red-950 border border-red-900 rounded-lg px-4 py-2.5">
            ⚠ {error}
          </div>
        )}

        {/* ✅ NEW: empty state before any job is fetched */}
        {!job && !loading && !error && (
          <div className="text-slate-600 text-sm text-center border-2 border-dashed border-[#1f2530] rounded-xl py-16">
            Enter a Job ID and your API key above to track a job
          </div>
        )}

        {/* ✅ CHANGED: only show job details when job is loaded */}
        {job && (
          <>
            {/* Two col */}
            <div className="grid grid-cols-2 gap-6 mb-6">

              {/* LEFT */}
              <div className="flex flex-col gap-4">

                {/* Status card */}
                <div className="bg-[#111318] border border-[#1f2530] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="font-bold text-white">Execution Status</div>
                    <StatusBadge status={job.status} />
                  </div>

                  {/* Stepper */}
                  <div className="flex items-center mb-6">
                    {steps.map((step, i) => (
                      <div key={step} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                          <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold z-10
                            ${i <= currentStep
                              ? 'border-green-400 bg-green-950 text-green-400'
                              : 'border-[#1f2530] bg-[#181c24] text-slate-600'
                            }`}>
                            {i <= currentStep ? '✓' : i + 1}
                          </div>
                          <div className={`text-xs mt-2 uppercase tracking-widest ${i <= currentStep ? 'text-green-400' : 'text-slate-600'}`}>
                            {step}
                          </div>
                        </div>
                        {i < steps.length - 1 && (
                          <div className={`flex-1 h-0.5 mb-5 ${i < currentStep ? 'bg-green-400' : 'bg-[#1f2530]'}`} />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { val: job.result?.executionTime ?? '—', label: 'Exec Time', color: 'text-green-400'  },
                      { val: job.attempts ?? '—',              label: 'Attempts',  color: 'text-cyan-400'   },
                      { val: job.result?.result ?? '—',        label: 'Result',    color: 'text-yellow-400' },
                    ].map((m, i) => (
                      <div key={i} className="bg-[#181c24] rounded-lg p-3">
                        <div className={`text-xl font-bold ${m.color}`}>{m.val}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Result */}
                <div className="bg-[#111318] border border-[#1f2530] rounded-xl p-6">
                  <div className="font-bold text-white text-sm mb-3">Execution Result</div>
                  <div className="bg-[#050709] border border-[#1f2530] rounded-lg p-4 text-xs leading-6">
                    {(() => {
  try {
    const parsed =
      typeof job.result === "string"
        ? JSON.parse(job.result)
        : job.result;

    return (
      <div className="text-sm">
        <div className="text-green-400 font-semibold">
          Result: {parsed?.result ?? "—"}
        </div>
        <div className="text-cyan-400 mt-1">
          Execution Time: {parsed?.executionTime ?? "—"}
        </div>
      </div>
    );
  } catch {
    return (
      <pre className="text-green-400 whitespace-pre-wrap">
        {job.result}
      </pre>
    );
  }
})()}
                  </div>
                  {/* ✅ Show error if job failed */}
                  {job.status === 'failed' && job.error && (
                    <div className="mt-3 text-red-400 text-xs bg-red-950 border border-red-900 rounded-lg px-4 py-2.5">
                      ⚠ {job.error}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex flex-col gap-4">

                {/* Job details */}
                <div className="bg-[#111318] border border-[#1f2530] rounded-xl p-6">
                  <div className="font-bold text-white text-sm mb-4">Job Details</div>
                  <table className="w-full text-sm">
                    <tbody>
                      {[
                        { label: 'Job ID',    value: job.job_id?.slice(0,18) + '…', color: 'text-white'    },
                        { label: 'Function',  value: job.function_name,              color: 'text-cyan-400' },
                        { label: 'Submitted', value: job.submitted_at,               color: 'text-white'    },
                        { label: 'Completed', value: job.completed_at ?? '—',        color: 'text-white'    },
                        { label: 'Attempts',  value: `${job.attempts} / 3`,          color: 'text-white'    },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-[#0f131a]">
                          <td className="text-slate-500 py-2 w-1/3">{row.label}</td>
                          <td className={`py-2 text-xs ${row.color}`}>{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-4 pt-4 border-t border-[#1f2530]">
                    <div className="font-bold text-white text-sm mb-3">Input Payload</div>
                    <div className="bg-[#050709] border border-[#1f2530] rounded-lg p-4 text-xs leading-6">
                      <pre className="text-yellow-400 whitespace-pre-wrap">
                        {JSON.stringify(job.payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Polling */}
                <div className="bg-[#111318] border border-blue-900/30 rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-500">Auto-polling every 2s</div>
                    <div className={`text-xs ${job.status === 'completed' || job.status === 'failed' ? 'text-green-400' : 'text-cyan-400'}`}>
                      {job.status === 'completed' || job.status === 'failed' ? '● Job resolved' : '● Polling...'}
                    </div>
                  </div>
                  <div className="h-0.5 bg-[#1f2530] rounded mt-3 overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded animate-pulse" style={{width:'100%'}}/>
                  </div>
                  <div className="text-xs text-slate-600 mt-3">
                    Last checked: just now · {job.status === 'completed' || job.status === 'failed' ? 'Next poll cancelled (job complete)' : 'Next poll in 2s'}
                  </div>
                </div>
              </div>
            </div>

            {/* Execution Logs */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-bold text-white">Execution Logs</div>
                  <div className="text-xs text-slate-500 mt-0.5">Full timeline of what happened inside the platform</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-green-400 bg-green-950 border border-green-900 px-3 py-1 rounded-full">● 6 events</span>
                  <button
                    onClick={() => setLogsOpen(p => !p)}
                    className="text-xs border border-[#1f2530] text-slate-500 hover:text-white px-3 py-1.5 rounded-lg transition-all"
                  >
                    {logsOpen ? 'Collapse ↑' : 'Expand ↓'}
                  </button>
                </div>
              </div>

              {logsOpen && (
                <div className="bg-[#111318] border border-[#1f2530] rounded-xl overflow-hidden">
                  <div className="bg-[#050709] border-b border-[#1f2530] px-5 py-2.5 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"/>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"/>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"/>
                    <span className="text-xs text-slate-500 ml-2">cloudfunc — execution trace — job {job.job_id?.slice(0,8)}</span>
                  </div>
                  <div className="bg-[#050709] p-5 flex flex-col gap-3">
                    {logs.map((log, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <span className="text-slate-600 text-xs whitespace-nowrap mt-0.5 min-w-[90px]">{log.time}</span>
                        <span className={`text-xs font-bold min-w-[75px] ${log.color}`}>{log.service}</span>
                        <span className="text-sm text-slate-300">{log.message}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-[#050709] border-t border-[#1f2530] px-5 py-2.5 flex justify-between">
                    <span className="text-xs text-slate-500">Total pipeline time: <span className="text-green-400">219ms</span> · 0 errors · 0 retries</span>
                    <span className="text-xs text-slate-600">no server management · auto scaled · isolated execution</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  )
}