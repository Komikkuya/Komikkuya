const fetch = require('node-fetch');

const searchController = {
    search: async (req, res) => {
        try {
            const { query } = req.query;

            if (!query) {
                return res.json({ success: true, data: [] });
            }

            // Fetch from both endpoints in parallel
            const [komikuResponse, asiaResponse] = await Promise.allSettled([
                fetch(`https://komiku-api-self.vercel.app/api/search?query=${encodeURIComponent(query)}`),
                fetch(`https://komiku-api-self.vercel.app/api/asia/search?q=${encodeURIComponent(query)}`)
            ]);

            let allResults = [];
            const seenTitles = new Set();

            // Process Komiku API response
            if (komikuResponse.status === 'fulfilled' && komikuResponse.value.ok) {
                try {
                    const komikuData = await komikuResponse.value.json();
                    if (komikuData.success && Array.isArray(komikuData.data)) {
                        komikuData.data.forEach(item => {
                            const normalizedTitle = item.title?.toLowerCase().trim();
                            if (normalizedTitle && !seenTitles.has(normalizedTitle)) {
                                seenTitles.add(normalizedTitle);
                                allResults.push({
                                    title: item.title,
                                    imageUrl: item.imageUrl,
                                    mangaUrl: item.mangaUrl,
                                    latestChapter: item.latestChapter,
                                    source: 'komiku'
                                });
                            }
                        });
                    }
                } catch (e) {
                    console.error('Error parsing Komiku response:', e);
                }
            }

            // Process Asia API response
            if (asiaResponse.status === 'fulfilled' && asiaResponse.value.ok) {
                try {
                    const asiaData = await asiaResponse.value.json();
                    if (asiaData.success && asiaData.data && Array.isArray(asiaData.data.results)) {
                        asiaData.data.results.forEach(item => {
                            const normalizedTitle = item.title?.toLowerCase().trim();
                            if (normalizedTitle && !seenTitles.has(normalizedTitle)) {
                                seenTitles.add(normalizedTitle);
                                // Normalize Asia API format to match Komiku format
                                allResults.push({
                                    title: item.title,
                                    imageUrl: item.imageUrl,
                                    mangaUrl: item.url, // Asia API uses 'url' instead of 'mangaUrl'
                                    latestChapter: null, // Asia API doesn't provide latest chapter
                                    rating: item.rating,
                                    status: item.status,
                                    slug: item.slug,
                                    source: 'asia'
                                });
                            }
                        });
                    }
                } catch (e) {
                    console.error('Error parsing Asia response:', e);
                }
            }

            // Return combined results
            res.json({
                success: true,
                data: allResults,
                meta: {
                    total: allResults.length,
                    sources: {
                        komiku: allResults.filter(r => r.source === 'komiku').length,
                        asia: allResults.filter(r => r.source === 'asia').length
                    }
                }
            });
        } catch (error) {
            console.error('Error searching manga:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to search manga'
            });
        }
    }
};

module.exports = searchController;
