// nhentaiSearchController.js
const fetch = require('node-fetch');

const nhentaiSearchController = {
    search: async (req, res) => {
        try {
            const { q, page } = req.query;

            if (!q) {
                return res.json({ success: true, data: [] });
            }

            const pageNum = page || 1;
            const apiUrl = `https://nh.komikkuya.my.id/search?q=${encodeURIComponent(q)}&page=${pageNum}`;

            const response = await fetch(apiUrl, {
                headers: {
                    "ngrok-skip-browser-warning": "69420",
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                    "Accept": "*/*"
                }
            });

            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('API did not return JSON');
            }

            const data = await response.json();

            if (!data || typeof data !== 'object' || !Array.isArray(data.galleries)) {
                throw new Error('Invalid response format from API');
            }

            // Normalisasi hasil agar lebih konsisten
            const results = data.galleries.map(item => ({
                href: `/nhentai${item.href}`,
                caption: item.caption,
                thumb: item.localThumb
            }));

            res.json({
                success: true,
                query: data.query,
                page: data.page,
                data: results
            });
        } catch (error) {
            console.error('Error searching nhentai:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to search nhentai'
            });
        }
    }
};

module.exports = nhentaiSearchController;
