import { Link, useLocation } from 'react-router-dom'

const links = [
  { to: '/',          label: 'Dashboard'  },
  { to: '/functions', label: 'Functions'  },
  { to: '/invoke',    label: 'Invoke'     },
  { to: '/jobs/demo', label: 'Job Status' },
]

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav className="bg-[#111318] border-b border-[#1f2530] px-8 h-14 flex items-center justify-between sticky top-0 z-50">
      <div className="text-cyan-400 font-bold text-lg">☁️ CloudFunc</div>
      <div className="flex gap-1">
        {links.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`px-4 py-1.5 rounded-md text-sm font-mono transition-all
              ${pathname === link.to
                ? 'text-cyan-400 bg-[#181c24]'
                : 'text-slate-500 hover:text-white hover:bg-[#181c24]'
              }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="text-xs text-green-400 border border-green-900 bg-[#0a1a0a] px-3 py-1 rounded-full">
        ● API KEY ACTIVE
      </div>
    </nav>
  )
}