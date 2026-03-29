import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'  // ✅ NEW: useSearchParams to read ?fn= from URL
import api from '../api/axios'

export default function InvokePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()  // ✅ NEW: read URL params

  const [functions, setFunctions]               = useState([])
  // ✅ CHANGED: pre-select function if navigated from Functions page with ?fn=name
  const [selectedFunction, setSelectedFunction] = useState(searchParams.get('fn') || '')
  const [apiKey, setApiKey]                     = useState('')
  const [payload, setPayload]                   = useState('{\n  \n}')
  const [jobId, setJobId]                       = useState(null)
  const [loading, setLoading]                   = useState(false)
  const [error, setError]                       = useState(null)
  const [recentJobs, setRecentJobs]             = useState([])

  useEffect(() => {
    api.get('/functions')
      .then(res => setFunctions(res.data))
      .catch(() => setFunctions([]))
  }, [])

  async function handleInvoke() {
    if (!selectedFunction) return setError('Please select a function')
    if (!apiKey)           return setError('Please enter your API key')
    if (!payload)          return setError('Please enter a payload')

    let parsedPayload
    try {
      parsedPayload = JSON.parse(payload)
    } catch {
      return setError('Payload is not valid JSON')
    }

    try {
      setLoading(true)
      setError(null)
      setJobId(null)
      const res = await api.post('/invoke', {
        function_name: selectedFunction,
        payload: parsedPayload
      }, {
        headers: { 'X-API-Key': apiKey }
      })
      setJobId(res.data.jobId)
      setRecentJobs(prev => [{
        fn: selectedFunction,
        jobId: res.data.jobId,
        time: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 3))
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    setSelectedFunction('')
    setApiKey('')
    setPayload('{\n  \n}')
    setJobId(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#e2e8f0] font-mono">
      <div className="max-w-5xl mx-auto p-8">

        {/* Header */}
        <div className="inline-block text-xs text-slate-500 uppercase tracking-widest border border-[#1f2530] bg-[#181c24] px-3 py-1 rounded-full mb-4">
          Page 03 / Invoke
        </div>
        <h1 className="text-3xl font-bold text-white mb-1" style={{fontFamily:'sans-serif'}}>
          Invoke Function
        </h1>
        <p className="text-slate-500 text-sm mb-8">Execute a cloud function asynchronously with a payload</p>

        {/* Two column layout */}
        <div className="grid grid-cols-2 gap-6">

          {/* LEFT — Form */}
          <div className="bg-[#111318] border border-[#1f2530] rounded-xl p-6">

            {/* Function selector */}
            <div className="mb-5">
              <label className="block text-xs text-slate-500 uppercase tracking-widest mb-2">
                Select Function
              </label>
              <select
                value={selectedFunction}
                onChange={e => setSelectedFunction(e.target.value)}
                className="w-full bg-[#181c24] border border-[#1f2530] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400 transition-all"
              >
                <option value="">— choose a function —</option>
                {functions.map(fn => (
                  <option key={fn.name} value={fn.name}>{fn.name}</option>
                ))}
              </select>
            </div>

            {/* API Key */}
            <div className="mb-5">
              <label className="block text-xs text-slate-500 uppercase tracking-widest mb-2">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="w-full bg-[#181c24] border border-[#1f2530] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400 transition-all"
              />
            </div>

            {/* Payload */}
            <div className="mb-6">
              <label className="block text-xs text-slate-500 uppercase tracking-widest mb-2">
                Payload (JSON)
              </label>
              <textarea
                value={payload}
                onChange={e => setPayload(e.target.value)}
                rows={6}
                className="w-full bg-[#181c24] border border-[#1f2530] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400 transition-all resize-none"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 text-red-400 text-xs bg-red-950 border border-red-900 rounded-lg px-4 py-2.5">
                ⚠ {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleClear}
                className="flex-1 bg-transparent border border-[#1f2530] text-slate-500 hover:text-white hover:border-slate-500 rounded-lg py-2.5 text-sm font-semibold transition-all"
              >
                Clear
              </button>
              <button
                onClick={handleInvoke}
                disabled={loading}
                className="flex-2 flex-grow-[2] bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-lg py-2.5 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Invoking...' : '⚡ Invoke Function'}
              </button>
            </div>
          </div>

          {/* RIGHT — Result */}
          <div className="flex flex-col gap-4">

            {/* Response card */}
            <div className="bg-[#111318] border border-[#1f2530] rounded-xl p-6">
              <div className="text-sm font-bold text-white mb-3">Response</div>

              {/* Waiting state */}
              {!jobId && !loading && (
                <div className="text-slate-600 text-xs border-2 border-dashed border-[#1f2530] rounded-lg p-6 text-center">
                  Job ID will appear here after invoking
                </div>
              )}

              {/* Loading state */}
              {loading && (
                <div className="text-cyan-400 text-xs border border-cyan-900 bg-[#001a2e] rounded-lg p-4 text-center animate-pulse">
                  ⟳ Sending to gateway...
                </div>
              )}

              {/* Success state */}
              {jobId && (
                <>
                  <div className="bg-[#001a00] border border-green-900 rounded-lg p-4 flex items-center justify-between mb-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Job Created Successfully</div>
                      <div className="text-green-400 text-sm break-all">{jobId}</div>
                    </div>
                    <button
                      onClick={() => navigate(`/jobs/${jobId}`)}
                      className="ml-4 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-bold px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
                    >
                      Track Job →
                    </button>
                  </div>

                  <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Raw Response</div>
                  <div className="bg-[#050709] border border-[#1f2530] rounded-lg p-4 text-xs">
                    <span className="text-cyan-400">"jobId"</span>
                    <span className="text-white">: </span>
                    <span className="text-green-400">"{jobId}"</span>
                  </div>

                  <div className="mt-3 text-xs text-slate-600">
                    Function will execute asynchronously.<br/>
                    Use the Job ID above to check the result.
                  </div>
                </>
              )}
            </div>

            {/* Recent invocations */}
            <div className="bg-[#111318] border border-yellow-900/20 rounded-xl p-5">
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-3">
                Recent Invocations
              </div>
              {recentJobs.length === 0 ? (
                <div className="text-slate-600 text-xs">No invocations yet</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {recentJobs.map((job, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-white">{job.fn}</span>
                      <span className="text-slate-500 text-xs">{job.time}</span>
                      <span className="text-xs bg-green-950 text-green-400 border border-green-900 px-2 py-0.5 rounded-full">
                        invoked
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}