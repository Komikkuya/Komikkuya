const { fetchWithFallback, fetchJsonWithFallback } = require('../utils/apiFetch');
const fetch = require('node-fetch');

class LatestController {
    async index(req, res) {
        try {
            // Get category and page from query parameters, with defaults
            const category = req.query.category || 'manga';
            const page = parseInt(req.query.page) || 1;

            // Validate category (now includes international)
            const validCategories = ['manga', 'manhwa', 'manhua', 'international'];
            const validCategory = validCategories.includes(category) ? category : 'manga';

            let processedItems = [];
            let hasNextPage = false;
            let currentPage = page;

            if (validCategory === 'international') {
                // Fetch from international API (weebcentral)
                const intlResponse = await fetch(`https://internationalbackup.komikkuya.my.id/api/international/last-update?page=${page}`);
                const intlData = await intlResponse.json();

                if (!intlData.success) {
                    return res.status(500).render('error', {
                        message: 'Failed to load international manga',
                        error: process.env.NODE_ENV === 'development' ? intlData : {}
                    });
                }

                // Normalize international data to match Komiku format
                processedItems = (intlData.data?.results || []).map(item => {
                    const updatedAt = item.latestChapter?.updatedAt ? new Date(item.latestChapter.updatedAt) : new Date();
                    const diffMs = Date.now() - updatedAt.getTime();
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffHours = Math.floor(diffMs / 3600000);
                    const diffDays = Math.floor(diffMs / 86400000);
                    let timeAgo = 'Baru';
                    if (diffDays > 0) {
                        timeAgo = `${diffDays} hari`;
                    } else if (diffHours > 0) {
                        timeAgo = `${diffHours} jam`;
                    } else if (diffMins > 0) {
                        timeAgo = `${diffMins} menit`;
                    }

                    return {
                        title: item.title,
                        url: `/manga/series/${item.seriesId}`,
                        imageUrl: item.cover,
                        type: 'International',
                        genre: 'English',
                        stats: {
                            views: '-',
                            timeAgo: timeAgo,
                            isColored: false
                        },
                        latestChapter: {
                            title: item.latestChapter?.chapterNumber || 'Chapter',
                            url: `/chapter/chapters/${item.latestChapter?.chapterId || ''}`
                        },
                        source: 'international'
                    };
                });

                hasNextPage = intlData.data?.totalResults > (page * 32);
                currentPage = intlData.data?.page || page;
            } else {
                // Fetch latest manga from Komiku API with fallback
                const data = await fetchJsonWithFallback(`/api/last-update?category=${validCategory}&page=${page}`);

                if (!data.success) {
                    return res.status(500).render('error', {
                        message: 'Failed to load latest manga',
                        error: process.env.NODE_ENV === 'development' ? data : {}
                    });
                }

                // Process manga items to ensure URLs are valid
                processedItems = data.data.mangaList.map(item => {
                    // Fix malformed URLs
                    if (item.url && item.url.includes('https://komiku.idhttps://komiku.id')) {
                        item.url = item.url.replace('https://komiku.idhttps://komiku.id', 'https://komiku.id');
                    }

                    // Fix malformed image URLs
                    if (item.imageUrl && item.imageUrl.includes('undefined')) {
                        item.imageUrl = '/images/placeholder.jpg';
                    }

                    return {
                        ...item,
                        source: 'komiku'
                    };
                });

                hasNextPage = data.data.hasNextPage;
                currentPage = data.data.page;
            }

            // Prepare pagination data
            const pagination = {
                currentPage: currentPage,
                hasNextPage: hasNextPage,
                nextPage: page + 1,
                prevPage: page > 1 ? page - 1 : 1,
                category: validCategory
            };

            const categoryDisplay = validCategory === 'international'
                ? 'International'
                : validCategory.charAt(0).toUpperCase() + validCategory.slice(1);

            // Render the view with the data
            return res.render('latest/index', {
                title: `${categoryDisplay} Terbaru - Update Komik Hari Ini | Komikkuya`,
                metaDescription: `Baca ${categoryDisplay} terbaru update hari ini gratis di Komikkuya. Chapter terbaru ${categoryDisplay} tanpa iklan!`,
                metaKeywords: `${categoryDisplay} terbaru, update ${validCategory}, ${validCategory} chapter terbaru, baca ${validCategory} gratis, ${validCategory} update hari ini, ${validCategory} rilis terbaru, ${validCategory} chapter baru, new chapter ${validCategory}, latest ${validCategory}, komikkuya update, ${validCategory} 2025, ${validCategory} 2026`,
                canonicalUrl: `https://komikkuya.my.id/latest?category=${validCategory}`,
                currentPath: `/latest?category=${validCategory}`,
                mangaList: processedItems,
                pagination,
                categories: validCategories,
                currentCategory: validCategory
            });
        } catch (error) {
            console.error('Error in latest controller:', error);
            return res.status(500).render('error', {
                message: 'Failed to load latest manga',
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    }
}

module.exports = new LatestController();

