// doujinDetailController.js
const fetch = require('node-fetch');

const doujinDetailController = {
    detail: async (req, res) => {
        try {
            const { slug } = req.params;

            if (!slug) {
                return res.status(400).render('error', {
                    title: 'Invalid Request - Komikkuya',
                    error: 'Slug tidak ditemukan'
                });
            }

            // URL asli doujin
            const doujinUrl = `https://doujinku.org/manga/${slug}/`;
            const apiUrl = `https://cdn.komikkuya.my.id/api/seri?url=${encodeURIComponent(doujinUrl)}`;

            const response = await fetch(apiUrl, {
                headers: {
                    "ngrok-skip-browser-warning": "69420",
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                    "Accept": "*/*"
                }
            });

            const json = await response.json();

            if (!json.success || !json.data) {
                return res.status(500).render('error', {
                    title: 'Error - Komikkuya',
                    error: 'Failed to load doujin details'
                });
            }

            const doujin = {
                title: json.data.title || "Untitled",
                alternative_title: json.data.alternative_title || "",
                thumbnail: json.data.thumbnail || "/images/placeholder.jpg",
                description: json.data.description || "No description available.",
                rating: json.data.rating || "-",
                metadata: json.data.metadata || {},
                tags: json.data.tags || [],
                startChapter: json.data.startChapter || "-",
                latestChapter: json.data.latestChapter || "-",
                chapters: json.data.chapters || []
            };

            return res.render('doujin/detail', {
                title: `${doujin.title} - Komikkuya`,
                doujin
            });

        } catch (error) {
            console.error('Error fetching doujin details:', error);

            return res.status(500).render('error', {
                title: 'Error - Komikkuya',
                error: 'Failed to load doujin details'
            });
        }
    }
};

module.exports = doujinDetailController;
