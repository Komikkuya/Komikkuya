const fetch = require('node-fetch');

class HomeController {
    async index(req, res) {
        try {
            // Fetch all data in parallel for better performance
            const [recommendationsRes, genresRes, hotRes, latestRes, popularDailyRes, popularWeeklyRes, popularAllRes] = await Promise.all([
                fetch('https://komiku-api-self.vercel.app/api/recommendations'),
                fetch('https://komiku-api-self.vercel.app/api/genres'),
                fetch('https://komiku-api-self.vercel.app/api/hot?page=1'),
                fetch('https://komiku-api-self.vercel.app/api/last-update?category=manga&page=1'),
                fetch('https://komiku-api-self.vercel.app/api/popular?category=manga&page=1&sorttime=daily'),
                fetch('https://komiku-api-self.vercel.app/api/popular?category=manga&page=1&sorttime=weekly'),
                fetch('https://komiku-api-self.vercel.app/api/popular?category=manga&page=1&sorttime=all')
            ]);

            const [recommendationsData, genresData, hotData, latestData, popularDailyData, popularWeeklyData, popularAllData] = await Promise.all([
                recommendationsRes.json(),
                genresRes.json(),
                hotRes.json(),
                latestRes.json(),
                popularDailyRes.json(),
                popularWeeklyRes.json(),
                popularAllRes.json()
            ]);


            if (!recommendationsData.success) {
                return res.status(500).render('error', {
                    message: 'Failed to load home page',
                    error: process.env.NODE_ENV === 'development' ? recommendationsData : {}
                });
            }

            // Process recommendations
            const processedRecommendations = recommendationsData.data.map(item => {
                if (item.url && item.url.includes('https://komiku.idhttps://komiku.id')) {
                    item.url = item.url.replace('https://komiku.idhttps://komiku.id', 'https://komiku.id');
                }
                if (item.imageUrl && item.imageUrl.includes('undefined')) {
                    item.imageUrl = '/images/placeholder.jpg';
                }
                return item;
            });

            // Process hot manga (for Project Update)
            const hotManga = hotData.success && hotData.data?.mangaList
                ? hotData.data.mangaList.map(item => {
                    if (item.url && item.url.includes('https://komiku.org/https://komiku.org')) {
                        item.url = item.url.replace('https://komiku.org/https://komiku.org', 'https://komiku.org');
                    }
                    return item;
                })
                : [];

            // Process latest manga (for Serial Baru)
            const latestManga = latestData.success && latestData.data?.mangaList
                ? latestData.data.mangaList.slice(0, 10).map(item => {
                    if (item.url && item.url.includes('https://komiku.idhttps://komiku.id')) {
                        item.url = item.url.replace('https://komiku.idhttps://komiku.id', 'https://komiku.id');
                    }
                    return item;
                })
                : [];

            // Process popular manga by sorttime
            const processPopular = (data) => {
                if (!data.success || !data.data?.mangaList) return [];
                return data.data.mangaList.slice(0, 10).map((item, index) => {
                    if (item.url && item.url.includes('https://komiku.org/https://komiku.org')) {
                        item.url = item.url.replace('https://komiku.org/https://komiku.org', 'https://komiku.org');
                    }
                    item.rank = index + 1;
                    return item;
                });
            };

            const popularDaily = processPopular(popularDailyData);
            const popularWeekly = processPopular(popularWeeklyData);
            const popularAll = processPopular(popularAllData);

            // Get top genres
            const topGenres = genresData.success ? genresData.data.slice(0, 5) : [];

            return res.render('index', {
                title: 'Komikkuya - Baca & Read Komik Gratis Online | Manga, Manhwa, Manhua Chapter Terbaru',
                metaDescription: 'Baca komik gratis online di Komikkuya! Read manga chapter terbaru, genres lengkap: aksi, fantasi, romantis. Koleksi manga, manhwa, manhua update setiap hari tanpa iklan!',
                metaKeywords: 'baca komik gratis, manga online, manhwa indonesia, manhua terbaru, komik lengkap, baca manga gratis, baca manhwa gratis, read manga online, read manhwa free, chapter terbaru, update chapter, genre komik, komik romantis, komik action, komik fantasi, komik isekai, komik populer, trending manga, trending manhwa, solo leveling, one piece, naruto, demon slayer, jujutsu kaisen, attack on titan, blue lock, chainsaw man, spy x family, tower of god, lookism, manga terbaru 2025, manhwa terbaru 2025, manga terbaru 2026, komikkuya, komik online gratis, baca komik tanpa iklan, webtoon indonesia',
                canonicalUrl: 'https://komikkuya.my.id/',
                currentPath: '/',
                recommendations: processedRecommendations,
                hotManga: hotManga,
                latestManga: latestManga,
                popularDaily: popularDaily,
                popularWeekly: popularWeekly,
                popularAll: popularAll,
                genres: topGenres
            });

        } catch (error) {
            console.error('Error in home controller:', error);
            return res.status(500).render('error', {
                message: 'Failed to load home page',
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    }
}

module.exports = new HomeController(); 
