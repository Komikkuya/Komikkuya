const fetch = require('node-fetch');

class LatestController {
    async index(req, res) {
        try {
            // Get category and page from query parameters, with defaults
            const category = req.query.category || 'manga';
            const page = parseInt(req.query.page) || 1;

            // Validate category
            const validCategories = ['manga', 'manhwa', 'manhua'];
            const validCategory = validCategories.includes(category) ? category : 'manga';

            // Fetch latest manga from API
            const response = await fetch(`https://komiku-api-self.vercel.app/api/last-update?category=${validCategory}&page=${page}`);
            const data = await response.json();

            if (!data.success) {
                return res.status(500).render('error', {
                    message: 'Failed to load latest manga',
                    error: process.env.NODE_ENV === 'development' ? data : {}
                });
            }

            // Process manga items to ensure URLs are valid
            const processedItems = data.data.mangaList.map(item => {
                // Fix malformed URLs
                if (item.url && item.url.includes('https://komiku.idhttps://komiku.id')) {
                    item.url = item.url.replace('https://komiku.idhttps://komiku.id', 'https://komiku.id');
                }

                // Fix malformed image URLs
                if (item.imageUrl && item.imageUrl.includes('undefined')) {
                    item.imageUrl = '/images/placeholder.jpg';
                }

                return item;
            });

            // Prepare pagination data
            const pagination = {
                currentPage: data.data.page,
                hasNextPage: data.data.hasNextPage,
                nextPage: page + 1,
                prevPage: page > 1 ? page - 1 : 1,
                category: validCategory
            };

            const categoryDisplay = validCategory.charAt(0).toUpperCase() + validCategory.slice(1);

            // Render the view with the data
            return res.render('latest/index', {
                title: `${categoryDisplay} Terbaru - Update Komik Hari Ini | Komikkuya`,
                metaDescription: `Baca ${categoryDisplay} terbaru update hari ini gratis di Komikkuya. Chapter terbaru ${categoryDisplay} tanpa iklan!`,
                metaKeywords: `${categoryDisplay} terbaru, update ${validCategory}, ${validCategory} chapter terbaru, baca ${validCategory} gratis, komikkuya`,
                canonicalUrl: `https://komikkuya.com/latest?category=${validCategory}`,
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