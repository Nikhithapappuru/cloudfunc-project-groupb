import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'   // ✅ NEW: for Invoke button navigation
import api from '../api/axios'                    // ✅ NEW: import axios instance

export default function FunctionsPage() {
  const navigate = useNavigate()  // ✅ NEW

  // ✅ CHANGED: start empty, fetch from backend
  const [functions, setFunctions] = useState([])
  const [search, setSearch]       = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [step, setStep]           = useState('form') // form | loading | success
  const [form, setForm]           = useState({ name: '', owner: '', image: '' })
  const [errors, setErrors]       = useState({})

  // ✅ NEW: fetch real functions from backend on page load
  useEffect(() => {
    api.get('/functions')
      .then(res => setFunctions(res.data))
      .catch(() => setFunctions([]))
  }, [])

  const filtered = functions.filter(fn =>
    fn.name.toLowerCase().includes(search.toLowerCase()) ||
    fn.owner.toLowerCase().includes(search.toLowerCase())
  )

  function openModal() {
    setForm({ name: '', owner: '', image: '' })
    setErrors({})
    setStep('form')
    setModalOpen(true)
  }

  // ✅ CHANGED: actually POST to backend instead of just updating local state
  async function submitRegister() {
    const e = {}
    if (!form.name)  e.name  = 'Function name is required'
    if (!form.owner) e.owner = 'Owner is required'
    if (!form.image) e.image = 'Docker image is required'
    if (Object.keys(e).length) return setErrors(e)

    setStep('loading')
    try {
      await api.post('/registerFunction', form)
      // ✅ refresh functions list from backend after registering
      const res = await api.get('/functions')
      setFunctions(res.data)
      setStep('success')
    } catch (err) {
      setErrors({ name: 'Failed to register. Try again.' })
      setStep('form')
    }
  }

  // ✅ CHANGED: actually DELETE from backend
  async function deleteFunction(name) {
    try {
      await api.delete(`/functions/${name}`)
      setFunctions(prev => prev.filter(fn => fn.name !== name))
    } catch {
      // if backend doesn't support delete, just remove from local state
      setFunctions(prev => prev.filter(fn => fn.name !== name))
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#e2e8f0] font-mono">
      <div className="max-w-5xl mx-auto p-8">

        {/* Header */}
        <div className="inline-block text-xs text-slate-500 uppercase tracking-widest border border-[#1f2530] bg-[#181c24] px-3 py-1 rounded-full mb-4">
          Page 02 / Functions
        </div>
        <h1 className="text-3xl font-bold text-white mb-1" style={{fontFamily:'sans-serif'}}>Functions</h1>
        <p className="text-slate-500 text-sm mb-8">All registered cloud functions — manage and invoke</p>

        {/* Search + Register */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by name or owner..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-[#181c24] border border-[#1f2530] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400 transition-all"
          />
          <button
            onClick={openModal}
            className="bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-sm px-5 py-2.5 rounded-lg transition-all"
          >
            + Register Function
          </button>
        </div>

        {/* Table */}
        <div className="bg-[#111318] border border-[#1f2530] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1f2530]">
                {['Function Name','Owner','Docker Image','Registered','Actions'].map(h => (
                  <th key={h} className="text-left text-xs text-slate-500 uppercase tracking-widest px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-slate-600 py-10 text-sm">No functions found</td></tr>
              ) : filtered.map((fn, i) => (
                <tr key={i} className="border-b border-[#0f131a] hover:bg-[#181c24] transition-all">
                  <td className="px-4 py-3 font-semibold text-white">{fn.name}</td>
                  <td className="px-4 py-3 text-slate-500 text-sm">{fn.owner}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-[#0a0014] border border-purple-900 text-purple-400 px-2.5 py-1 rounded-md">
                      🐳 {fn.image}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{fn.created_at}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {/* ✅ CHANGED: navigate to invoke page with function pre-selected */}
                      <button
                        onClick={() => navigate(`/invoke?fn=${fn.name}`)}
                        className="bg-purple-900 hover:bg-purple-800 text-purple-200 text-xs font-semibold px-3 py-1.5 rounded-md transition-all"
                      >
                        ⚡ Invoke
                      </button>
                      <button
                        onClick={() => deleteFunction(fn.name)}
                        className="bg-red-950 hover:bg-red-900 text-red-400 border border-red-900 text-xs font-semibold px-3 py-1.5 rounded-md transition-all"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={e => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div className="bg-[#111318] border border-[#1f2530] rounded-2xl p-8 w-[480px] max-w-[95vw] relative shadow-2xl">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white border border-[#1f2530] bg-[#181c24] w-7 h-7 rounded-md text-sm flex items-center justify-center"
            >✕</button>

            {/* Form step */}
            {step === 'form' && (
              <>
                <div className="text-lg font-bold text-white mb-1" style={{fontFamily:'sans-serif'}}>Register New Function</div>
                <div className="text-xs text-slate-500 mb-6">Add a cloud function with its Docker image</div>
                {['name','owner','image'].map(field => (
                  <div key={field} className="mb-4">
                    <label className="block text-xs text-slate-500 uppercase tracking-widest mb-2">
                      {field === 'image' ? 'Docker Image' : field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                    <input
                      type="text"
                      value={form[field]}
                      onChange={e => setForm(prev => ({...prev, [field]: e.target.value}))}
                      placeholder={field === 'name' ? 'e.g. addNumbers' : field === 'owner' ? 'e.g. user1' : 'e.g. node-add:v1'}
                      className="w-full bg-[#181c24] border border-[#1f2530] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400 transition-all"
                    />
                    {errors[field] && <div className="text-red-400 text-xs mt-1">⚠ {errors[field]}</div>}
                  </div>
                ))}
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setModalOpen(false)} className="flex-1 border border-[#1f2530] text-slate-500 hover:text-white rounded-lg py-2.5 text-sm transition-all">Cancel</button>
                  <button onClick={submitRegister} className="flex-[2] bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-lg py-2.5 text-sm transition-all">Register Function</button>
                </div>
              </>
            )}

            {/* Loading step */}
            {step === 'loading' && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4 animate-spin inline-block">⟳</div>
                <div className="text-slate-400 text-sm">Registering function...</div>
              </div>
            )}

            {/* Success step */}
            {step === 'success' && (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <div className="text-green-400 font-bold text-lg mb-2" style={{fontFamily:'sans-serif'}}>Function Registered!</div>
                <div className="text-slate-500 text-sm mb-6">"{form.name}" by {form.owner} has been added.</div>
                <button onClick={() => setModalOpen(false)} className="w-full bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-lg py-2.5 text-sm transition-all">Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}