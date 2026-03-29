const styles = {
  queued:    'bg-yellow-950 text-yellow-400 border border-yellow-900',
  running:   'bg-blue-950  text-blue-400   border border-blue-900',
  completed: 'bg-green-950 text-green-400  border border-green-900',
  failed:    'bg-red-950   text-red-400    border border-red-900',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full font-mono ${styles[status] || ''}`}>
      {status}
    </span>
  )
}