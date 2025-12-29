const fetch = require('node-fetch');

/**
 * Search Controller
 * Aggregates search results from multiple API sources:
 * - Komiku API (Indonesian manga from komiku.id)
 * - Asia API (Korean/Chinese manga from westmanga.me)
 * - International API (English manga from weebcentral.com)
 */
const searchController = {
    search: async (req, res) => {
        try {
            const { query } = req.query;

            if (!query) {
                return res.json({ success: true, data: [] });
            }

            // Fetch from all endpoints in parallel
            const [komikuResponse, asiaResponse, internationalResponse] = await Promise.allSettled([
                fetch(`https://komiku-api-self.vercel.app/api/search?query=${encodeURIComponent(query)}`),
                fetch(`https://komiku-api-self.vercel.app/api/asia/search?q=${encodeURIComponent(query)}`),
                fetch(`https://international.komikkuya.my.id/api/international/search?q=${encodeURIComponent(query)}`)
            ]);

            let allResults = [];

            // Process Komiku API response
            if (komikuResponse.status === 'fulfilled' && komikuResponse.value.ok) {
                try {
                    const komikuData = await komikuResponse.value.json();
                    if (komikuData.success && Array.isArray(komikuData.data)) {
                        komikuData.data.forEach(item => {
                            allResults.push({
                                title: item.title,
                                imageUrl: item.imageUrl,
                                mangaUrl: item.mangaUrl,
                                latestChapter: item.latestChapter,
                                source: 'komiku'
                            });
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
                            allResults.push({
                                title: item.title,
                                imageUrl: item.imageUrl,
                                mangaUrl: item.url,
                                latestChapter: null,
                                rating: item.rating,
                                status: item.status,
                                slug: item.slug,
                                source: 'asia'
                            });
                        });
                    }
                } catch (e) {
                    console.error('Error parsing Asia response:', e);
                }
            }

            // Process International API response (weebcentral.com)
            if (internationalResponse.status === 'fulfilled' && internationalResponse.value.ok) {
                try {
                    const intlData = await internationalResponse.value.json();
                    if (intlData.success && intlData.data && Array.isArray(intlData.data.results)) {
                        intlData.data.results.forEach(item => {
                            allResults.push({
                                title: item.title,
                                imageUrl: item.cover,
                                mangaUrl: item.url,
                                latestChapter: null,
                                seriesId: item.seriesId,
                                slug: item.slug,
                                source: 'international'
                            });
                        });
                    }
                } catch (e) {
                    console.error('Error parsing International response:', e);
                }
            }

            // Return combined results (no deduplication)
            res.json({
                success: true,
                data: allResults,
                meta: {
                    total: allResults.length,
                    sources: {
                        komiku: allResults.filter(r => r.source === 'komiku').length,
                        asia: allResults.filter(r => r.source === 'asia').length,
                        international: allResults.filter(r => r.source === 'international').length
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
