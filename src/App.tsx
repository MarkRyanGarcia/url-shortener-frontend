import { useState } from 'react'
import './index.css'

export default function App() {
    const [url, setUrl] = useState('')
    const [shortUrl, setShortUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [copied, setCopied] = useState(false)

    const handleShorten = async () => {
        if (!url.trim()) {
            setError('Please enter a URL.')
            return
        }

        setLoading(true)
        setError('')
        setShortUrl('')
        setCopied(false)

        try {
            const res = await fetch('/api/shorten', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ long_url: url.trim() }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data?.detail || data?.error || data?.message || `Error ${res.status}: Failed to shorten URL.`)
                return
            }

            setShortUrl(data.short_url ?? data.url ?? data.shortened_url ?? JSON.stringify(data))
        } catch {
            setError('Network error. Please check your connection and try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shortUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // fallback
            const el = document.createElement('textarea')
            el.value = shortUrl
            document.body.appendChild(el)
            el.select()
            document.execCommand('copy')
            document.body.removeChild(el)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleShorten()
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
            {/* Card */}
            <div
                className="w-full max-w-lg rounded-2xl p-8 flex flex-col gap-6"
                style={{ background: 'var(--color-base-2)', boxShadow: '0 8px 48px rgba(0,0,0,0.4)' }}
            >
                {/* Header */}
                <div className="flex flex-col items-center gap-1">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-1"
                        style={{ background: 'var(--color-tertiary)' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1D1E2D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                        URL Shortener
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--color-secondary)' }}>
                        Paste a long link and get a short one instantly.
                    </p>
                </div>

                {/* URL input */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-secondary)' }}>
                        Long URL
                    </label>
                    <input
                        type="url"
                        placeholder="https://example.com/very/long/url"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                        style={{
                            background: 'var(--color-base)',
                            color: 'var(--color-primary)',
                            border: '1.5px solid transparent',
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-tertiary)')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'transparent')}
                    />
                </div>

                {/* Error */}
                {error && (
                    <div
                        className="rounded-xl px-4 py-3 text-sm"
                        style={{ background: '#3D1E2E', color: '#F38BA8', border: '1px solid #F38BA840' }}
                    >
                        {error}
                    </div>
                )}

                {/* Shorten button */}
                <button
                    onClick={handleShorten}
                    disabled={loading}
                    className="w-full rounded-xl py-3 text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'var(--color-tertiary)', color: '#1D1E2D' }}
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            </svg>
                            Shortening…
                        </span>
                    ) : (
                        'Shorten URL'
                    )}
                </button>

                {/* Result */}
                {shortUrl && (
                    <div
                        className="rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                        style={{ background: 'var(--color-base)', border: '1.5px solid var(--color-tertiary)40' }}
                    >
                        <a
                            href={shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm truncate font-medium hover:underline"
                            style={{ color: 'var(--color-tertiary)' }}
                        >
                            {shortUrl}
                        </a>
                        <button
                            onClick={handleCopy}
                            className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all active:scale-95"
                            style={{
                                background: copied ? '#A6E3A1' : 'var(--color-base-2)',
                                color: copied ? '#1D1E2D' : 'var(--color-secondary)',
                            }}
                        >
                            {copied ? '✓ Copied' : 'Copy'}
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <p className="mt-6 text-xs" style={{ color: 'var(--color-secondary)' }}>
                Built by{' '}
                <a
                    href="https://markgarcia.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    style={{ color: 'var(--color-tertiary)' }}
                >
                    markgarcia.dev
                </a>
            </p>
        </div>
    )
}
