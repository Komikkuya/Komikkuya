const fetch = require('node-fetch');

const popularController = {
    index: async (req, res) => {
        try {
            const { category = 'manga', page = 1 } = req.query;

            // Validate category
            const validCategories = ['manga', 'manhwa', 'manhua'];
            const validCategory = validCategories.includes(category) ? category : 'manga';

            // Fetch popular data from API
            const response = await fetch(`https://komiku-api-self.vercel.app/api/popular?category=${validCategory}&page=${page}`);

            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`);
            }

            const result = await response.json();

            if (!result.success || !result.data || !result.data.mangaList) {
                return res.status(404).render('error', {
                    title: 'Error - Komikkuya',
                    error: 'Popular items not found'
                });
            }

            const data = result.data;

            // Process manga items to ensure URLs are valid
            const processedItems = data.mangaList.map(item => {
                try {
                    // Fix URL if it's malformed
                    let mangaUrl = item.url;
                    if (mangaUrl.includes('https://komiku.org/https://komiku.org')) {
                        mangaUrl = mangaUrl.replace('https://komiku.org/https://komiku.org', 'https://komiku.org');
                    }

                    // Fix chapter URL if it's malformed
                    if (item.latestChapter && item.latestChapter.url) {
                        let chapterUrl = item.latestChapter.url;
                        if (chapterUrl.includes('https://komiku.org/https://komiku.org')) {
                            chapterUrl = chapterUrl.replace('https://komiku.org/https://komiku.org', 'https://komiku.org');
                        }
                        item.latestChapter.url = chapterUrl;
                    }

                    item.url = mangaUrl;
                    return item;
                } catch (error) {
                    console.error('Error processing manga item:', error);
                    return item; // Return original item if processing fails
                }
            });

            // Calculate pagination info
            const currentPage = parseInt(page);
            const hasNextPage = data.hasNextPage;
            const hasPrevPage = currentPage > 1;

            const categoryDisplay = validCategory.charAt(0).toUpperCase() + validCategory.slice(1);

            res.render('popular/index', {
                title: `${categoryDisplay} Populer - Baca Komik Gratis Online | Komikkuya`,
                metaDescription: `Baca ${categoryDisplay} populer gratis online di Komikkuya. Koleksi ${categoryDisplay} terbaik dan terpopuler tanpa iklan!`,
                metaKeywords: `${categoryDisplay} populer, ${validCategory} terpopuler, baca ${validCategory} gratis, ${validCategory} terbaik, komikkuya`,
                canonicalUrl: `https://komikkuya.my.id/popular?category=${validCategory}`,
                currentPath: `/popular?category=${validCategory}`,
                items: processedItems,
                category: validCategory,
                categories: validCategories,
                pagination: {
                    currentPage,
                    hasNextPage,
                    hasPrevPage,
                    nextPage: hasNextPage ? currentPage + 1 : null,
                    prevPage: hasPrevPage ? currentPage - 1 : null
                }
            });
        } catch (error) {
            console.error('Error fetching popular items:', error);
            res.status(500).render('error', {
                title: 'Error - Komikkuya',
                error: 'Failed to load popular items'
            });
        }
    }
};

module.exports = popularController; 
