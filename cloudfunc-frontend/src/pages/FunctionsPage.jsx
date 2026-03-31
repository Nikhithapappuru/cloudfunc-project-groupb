import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import registry from '../api/registry'   // ✅ FIXED

export default function FunctionsPage() {
  const navigate = useNavigate()

  const [functions, setFunctions] = useState([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [step, setStep] = useState('form')

  // ✅ UPDATED FORM (added code)
  const [form, setForm] = useState({
    name: '',
    owner: '',
    image: '',
    code: ''
  })

  const [errors, setErrors] = useState({})

  // ✅ FETCH FUNCTIONS FROM REGISTRY
  useEffect(() => {
    registry.get('/functions')
      .then(res => setFunctions(res.data))
      .catch(err => {
        console.error(err)
        setFunctions([])
      })
  }, [])

  const filtered = functions.filter(fn =>
    fn.name.toLowerCase().includes(search.toLowerCase()) ||
    fn.owner.toLowerCase().includes(search.toLowerCase())
  )

  // ✅ RESET FORM (UPDATED)
  function openModal() {
    setForm({ name: '', owner: '', image: '', code: '' })
    setErrors({})
    setStep('form')
    setModalOpen(true)
  }

  // ✅ REGISTER FUNCTION
  async function submitRegister() {
    const e = {}

    if (!form.name) e.name = 'Function name is required'
    if (!form.owner) e.owner = 'Owner is required'
    if (!form.image) e.image = 'Docker image is required'
    if (!form.code) e.code = 'Code is required'

    if (Object.keys(e).length) return setErrors(e)

    setStep('loading')

    try {
      await registry.post('/registerFunction', form)

      const res = await registry.get('/functions')
      setFunctions(res.data)

      setStep('success')
    } catch (err) {
      console.error(err)
      setErrors({ name: 'Failed to register. Try again.' })
      setStep('form')
    }
  }

  // ✅ DELETE FUNCTION
  async function deleteFunction(name) {
    try {
      await registry.delete(`/functions/${name}`)
      setFunctions(prev => prev.filter(fn => fn.name !== name))
    } catch (err) {
      console.error(err)
      setFunctions(prev => prev.filter(fn => fn.name !== name))
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#e2e8f0] font-mono">
      <div className="max-w-5xl mx-auto p-8">

        <h1 className="text-3xl font-bold text-white mb-6">Functions</h1>

        {/* Search + Button */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-[#181c24] border border-[#1f2530] rounded-lg px-4 py-2 text-white"
          />
          <button
            onClick={openModal}
            className="bg-cyan-400 px-4 py-2 rounded-lg text-black font-bold"
          >
            + Register
          </button>
        </div>

        {/* Table */}
        <div className="bg-[#111318] border border-[#1f2530] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Owner</th>
                <th className="p-3 text-left">Image</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-6 text-gray-500">
                    No functions
                  </td>
                </tr>
              ) : (
                filtered.map((fn, i) => (
                  <tr key={i} className="border-t border-[#1f2530]">
                    <td className="p-3">{fn.name}</td>
                    <td className="p-3">{fn.owner}</td>
                    <td className="p-3">{fn.image}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => navigate(`/invoke?fn=${fn.name}`)}
                        className="bg-purple-700 px-3 py-1 rounded"
                      >
                        Invoke
                      </button>
                      <button
                        onClick={() => deleteFunction(fn.name)}
                        className="bg-red-700 px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-[#111318] p-6 rounded-xl w-[400px]">

            <h2 className="text-xl mb-4">Register Function</h2>

            {/* Name */}
            <input
              placeholder="Name"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full mb-3 p-2 bg-[#181c24]"
            />
            {errors.name && <div className="text-red-400 text-xs">{errors.name}</div>}

            {/* Owner */}
            <input
              placeholder="Owner"
              value={form.owner}
              onChange={e => setForm(prev => ({ ...prev, owner: e.target.value }))}
              className="w-full mb-3 p-2 bg-[#181c24]"
            />

            {/* Image */}
            <input
              placeholder="Docker Image"
              value={form.image}
              onChange={e => setForm(prev => ({ ...prev, image: e.target.value }))}
              className="w-full mb-3 p-2 bg-[#181c24]"
            />

            {/* ✅ CODE FIELD */}
            <textarea
              placeholder="Enter function code (return something)"
              value={form.code}
              onChange={e => setForm(prev => ({ ...prev, code: e.target.value }))}
              className="w-full mb-3 p-2 bg-[#181c24]"
              rows={5}
            />
            {errors.code && <div className="text-red-400 text-xs">{errors.code}</div>}

            {/* Buttons */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 bg-gray-600 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={submitRegister}
                className="flex-1 bg-cyan-400 text-black py-2 rounded"
              >
                Submit
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}