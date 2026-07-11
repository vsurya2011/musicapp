export default async function handler(req, res) {
    // 1. Grab the token from Vercel's Environment Variables
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
        return res.status(500).json({ error: "Server missing GitHub Token" });
    }

    // 2. Handle GET requests (Fetching songs)
    if (req.method === 'GET') {
        const { owner, repo, path } = req.query;
        const targetUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?t=${Date.now()}`;
        
        try {
            const response = await fetch(targetUrl, {
                headers: { 'Authorization': `token ${token}` }
            });
            const data = await response.json();
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // 3. Handle PUT and DELETE requests (Uploading and Deleting)
    if (req.method === 'PUT' || req.method === 'DELETE') {
        const { targetUrl, githubBody } = req.body;

        try {
            const response = await fetch(targetUrl, {
                method: req.method,
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(githubBody)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                return res.status(response.status).json(data);
            }
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // 4. Fallback for other methods
    res.status(405).json({ error: "Method not allowed" });
}