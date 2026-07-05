import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { long_url } = req.body ?? {}

    if (!long_url) {
        return res.status(400).json({ error: 'long_url is required' })
    }

    const apiKey = process.env.API_KEY
    const backendUrl = process.env.BACKEND_URL

    if (!apiKey) {
        return res.status(500).json({ error: 'API_KEY not configured' })
    }

    if (!backendUrl) {
        return res.status(500).json({ error: 'BACKEND_URL not configured' })
    }

    try {
        const upstream = await fetch(`${backendUrl}/api/v1/shorten`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey,
            },
            body: JSON.stringify({ long_url }),
        })

        const data = await upstream.json()
        return res.status(upstream.status).json(data)
    } catch (err) {
        return res.status(502).json({ error: 'Failed to reach upstream service', detail: String(err) })
    }
}
