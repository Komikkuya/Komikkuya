const fetch = require('node-fetch');

class GenreController {
    async index(req, res) {
        try {
            const { genre, category = 'manga', page = 1 } = req.query;

            // If no genre is specified, fetch all genres
            if (!genre) {
                try {
                    const response = await fetch('https://komiku-api-self.vercel.app/api/genres');
                    const data = await response.json();

                    if (!data.success) {
                        return res.render('genre/index', {
                            title: 'Genres - Komikkuya',
                            genres: [],
                            selectedGenre: null,
                            selectedCategory: category,
                            currentPage: parseInt(page),
                            items: [],
                            error: 'Failed to fetch genres. Please try again later.',
                            pagination: {
                                currentPage: parseInt(page),
                                hasNextPage: false,
                                hasPrevPage: false
                            }
                        });
                    }

                    return res.render('genre/index', {
                        title: 'Semua Genre Komik - Baca Manga, Manhwa, Manhua Gratis | Komikkuya',
                        metaDescription: 'Jelajahi semua genre komik di Komikkuya. Baca manga, manhwa, dan manhua favoritmu gratis tanpa iklan!',
                        metaKeywords: 'genre komik, genre manga, manhwa genre, manhua genre, baca komik gratis, komikkuya genre',
                        canonicalUrl: 'https://komikkuya.my.id/genre',
                        currentPath: '/genre',
                        genres: data.data,
                        selectedGenre: null,
                        selectedCategory: category,
                        currentPage: parseInt(page),
                        items: [],
                        error: null,
                        pagination: {
                            currentPage: parseInt(page),
                            hasNextPage: false,
                            hasPrevPage: false
                        }
                    });
                } catch (error) {
                    console.error('Error fetching genres:', error);
                    return res.render('genre/index', {
                        title: 'Genres - Komikkuya',
                        genres: [],
                        selectedGenre: null,
                        selectedCategory: category,
                        currentPage: parseInt(page),
                        items: [],
                        error: 'Failed to fetch genres. Please try again later.',
                        pagination: {
                            currentPage: parseInt(page),
                            hasNextPage: false,
                            hasPrevPage: false
                        }
                    });
                }
            }

            // Fetch manga for the selected genre
            let genreData;
            let error = null;
            try {
                const response = await fetch(`https://komiku-api-self.vercel.app/api/genre?genre=${genre}&category=${category}&page=${page}`);
                genreData = await response.json();

                if (!genreData.success) {
                    error = 'Failed to fetch manga for this genre. Please try again later.';
                }
            } catch (error) {
                console.error('Error fetching genre manga:', error);
                error = 'Failed to fetch manga for this genre. Please try again later.';
            }

            // Fetch all genres for the sidebar
            let genresData = { success: false, data: [] };
            try {
                const genresResponse = await fetch('https://komiku-api-self.vercel.app/api/genres');
                genresData = await genresResponse.json();
            } catch (error) {
                console.error('Error fetching genres list:', error);
                // Continue with empty genres list
            }

            // Process manga items to ensure URLs are valid
            let processedItems = [];

            if (genreData && genreData.success && genreData.data && genreData.data.mangaList) {
                processedItems = genreData.data.mangaList.map(item => {
                    // Fix malformed URLs
                    if (item.url && item.url.includes('https://komiku.org/https://komiku.org')) {
                        item.url = item.url.replace('https://komiku.org/https://komiku.org', 'https://komiku.org');
                    }

                    // Fix malformed image URLs
                    if (item.imageUrl && item.imageUrl.includes('undefined')) {
                        item.imageUrl = '/images/placeholder.jpg';
                    }

                    return item;
                });
            } else if (!error) {
                error = 'Failed to fetch manga for this genre. Please try again later.';
            }

            const genreTitle = genre ? genre.charAt(0).toUpperCase() + genre.slice(1) : '';
            const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);

            return res.render('genre/index', {
                title: genre ? `${genreTitle} ${categoryTitle} - Baca Komik Gratis | Komikkuya` : 'Semua Genre - Komikkuya',
                metaDescription: genre ? `Baca komik genre ${genreTitle} gratis online. Koleksi ${categoryTitle} ${genreTitle} terlengkap di Komikkuya!` : 'Jelajahi semua genre komik di Komikkuya',
                metaKeywords: genre ? `${genreTitle}, ${categoryTitle} ${genreTitle}, baca ${genreTitle} gratis, komik ${genreTitle}` : 'genre komik, genre manga',
                canonicalUrl: `https://komikkuya.my.id/genre${genre ? '?genre=' + genre : ''}`,
                currentPath: `/genre${genre ? '?genre=' + genre : ''}`,
                genres: genresData.success ? genresData.data : [],
                selectedGenre: genre,
                selectedCategory: category,
                currentPage: parseInt(page),
                items: processedItems,
                error: error,
                pagination: {
                    currentPage: parseInt(page),
                    hasNextPage: genreData && genreData.success ? genreData.data.hasNextPage : false,
                    hasPrevPage: parseInt(page) > 1,
                    nextPage: parseInt(page) + 1,
                    prevPage: parseInt(page) - 1
                }
            });
        } catch (error) {
            console.error('Error in genre controller:', error);
            return res.status(500).render('error', {
                message: 'Failed to load genre page',
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    }
}

module.exports = new GenreController(); 
