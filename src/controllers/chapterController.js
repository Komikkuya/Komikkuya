const fetch = require('node-fetch');

const chapterController = {
    read: async (req, res) => {
        try {
            const { chapterUrl } = req.params;

            if (!chapterUrl) {
                return res.status(400).render('error', {
                    title: 'Error - Komikkuya',
                    error: 'Chapter URL is required'
                });
            }

            // Remove leading slash if present and construct the full URL
            const cleanUrl = chapterUrl.startsWith('/') ? chapterUrl.slice(1) : chapterUrl;

            // Determine if this is an Asia manga chapter
            // Asia chapters have format like "view/manga-slug-chapter-X-bahasa-indonesia"
            const isAsiaChapter = cleanUrl.includes('bahasa-indonesia') || cleanUrl.startsWith('view/');

            let data;
            let isAsiaSource = false;

            if (isAsiaChapter) {
                const asiaUrl = `https://westmanga.me/${cleanUrl}`;
                const response = await fetch(`https://komiku-api-self.vercel.app/api/asia/chapter?url=${encodeURIComponent(asiaUrl)}`);
                const asiaData = await response.json();

                if (asiaData.success && asiaData.data) {
                    isAsiaSource = true;
                    // Normalize Asia API response to match Komiku format
                    data = {
                        title: asiaData.data.title,
                        mangaTitle: asiaData.data.title.replace(/Chapter.*$/i, '').trim(),
                        releaseDate: asiaData.data.createdAt,
                        images: (asiaData.data.images || []).map((url, index) => ({
                            url: url,
                            alt: `Page ${index + 1}`,
                            width: 'auto',
                            height: 'auto'
                        })),
                        navigation: {
                            prev: asiaData.data.prevChapter ? {
                                url: asiaData.data.prevChapter,
                                title: 'Previous Chapter'
                            } : null,
                            next: asiaData.data.nextChapter ? {
                                url: asiaData.data.nextChapter,
                                title: 'Next Chapter'
                            } : null,
                            chapterList: asiaData.data.comicUrl
                        },
                        source: 'asia'
                    };
                }
            }

            // If not Asia or Asia API failed, try Komiku API
            if (!data) {
                const fullUrl = `https://komiku.id/${cleanUrl}`;
                const response = await fetch(`https://komiku-api-self.vercel.app/api/chapter?url=${encodeURIComponent(fullUrl)}`);
                data = await response.json();
            }

            if (!data || !data.images) {
                return res.status(404).render('error', {
                    title: 'Error - Komikkuya',
                    error: 'Chapter not found'
                });
            }

            // Extract chapter numbers from URLs for navigation
            const currentChapterNumber = cleanUrl.match(/chapter-(\d+)/)?.[1] || '';
            const prevChapterNumber = data.navigation?.prev?.url?.match(/chapter-(\d+)/)?.[1] || '';
            const nextChapterNumber = data.navigation?.next?.url?.match(/chapter-(\d+)/)?.[1] || '';

            // Extract manga detail URL from chapterList
            let mangaDetailUrl = null;
            if (data.navigation?.chapterList) {
                try {
                    const chapterListUrl = new URL(data.navigation.chapterList);
                    if (chapterListUrl.hostname.includes('westmanga')) {
                        // Asia manga - extract slug from /comic/slug
                        const slug = chapterListUrl.pathname.split('/comic/')[1]?.replace('/', '') || '';
                        mangaDetailUrl = `/manga/${slug}`;
                    } else {
                        mangaDetailUrl = chapterListUrl.pathname;
                    }
                } catch (e) {
                    mangaDetailUrl = null;
                }
            }

            // Build navigation URLs
            let prevNavigation = null;
            let nextNavigation = null;

            if (data.navigation?.prev?.url) {
                try {
                    const prevUrl = new URL(data.navigation.prev.url);
                    if (isAsiaSource || prevUrl.hostname.includes('westmanga')) {
                        // Asia chapter navigation
                        prevNavigation = {
                            url: `/chapter/${prevUrl.pathname.replace('/view/', 'view/')}`,
                            title: data.navigation.prev.title || 'Previous Chapter'
                        };
                    } else {
                        prevNavigation = {
                            url: `/chapter${prevUrl.pathname}`,
                            title: data.navigation.prev.title
                        };
                    }
                } catch (e) {
                    prevNavigation = null;
                }
            }

            if (data.navigation?.next?.url) {
                try {
                    const nextUrl = new URL(data.navigation.next.url);
                    if (isAsiaSource || nextUrl.hostname.includes('westmanga')) {
                        // Asia chapter navigation
                        nextNavigation = {
                            url: `/chapter/${nextUrl.pathname.replace('/view/', 'view/')}`,
                            title: data.navigation.next.title || 'Next Chapter'
                        };
                    } else {
                        nextNavigation = {
                            url: `/chapter${nextUrl.pathname}`,
                            title: data.navigation.next.title
                        };
                    }
                } catch (e) {
                    nextNavigation = null;
                }
            }

            res.render('manga/chapter', {
                title: `${data.title} - ${data.mangaTitle} | Baca Gratis Komikkuya`,
                metaDescription: `Baca ${data.title} dari ${data.mangaTitle} gratis online di Komikkuya. Tanpa iklan, loading cepat!`,
                metaKeywords: `${data.mangaTitle}, ${data.title}, baca ${data.mangaTitle} gratis, baca ${data.mangaTitle} online, read ${data.mangaTitle} free, read ${data.mangaTitle} online, chapter ${currentChapterNumber}, ${data.mangaTitle} chapter ${currentChapterNumber}, baca chapter ${currentChapterNumber}, ${data.mangaTitle} chapter terbaru, ${data.mangaTitle} chapter lengkap, ${data.mangaTitle} bahasa indonesia, ${data.mangaTitle} sub indo, ${data.mangaTitle} indo, ${data.mangaTitle} terjemahan indonesia, ${data.mangaTitle} translate indonesia, ${data.mangaTitle} komik, manga ${data.mangaTitle} chapter ${currentChapterNumber}, komik ${data.mangaTitle} chapter ${currentChapterNumber}, baca manga ${data.mangaTitle}, baca komik ${data.mangaTitle}, ${data.mangaTitle} full, ${data.mangaTitle} lengkap, ${data.mangaTitle} komikkuya, ${data.title} bahasa indonesia, ${data.title} sub indo, baca ${data.title} gratis, baca ${data.title} online, komikkuya ${data.mangaTitle}, ${data.mangaTitle} update terbaru, ${data.mangaTitle} chapter baru, ${data.mangaTitle} ch ${currentChapterNumber}`,
                canonicalUrl: `https://komikkuya.my.id/chapter/${cleanUrl}`,
                currentPath: `/chapter/${cleanUrl}`,
                breadcrumbs: [
                    { name: 'Home', url: 'https://komikkuya.my.id/' },
                    { name: data.mangaTitle, url: `https://komikkuya.my.id${mangaDetailUrl || '/popular'}` },
                    { name: data.title, url: `https://komikkuya.my.id/chapter/${cleanUrl}` }
                ],
                chapter: data,
                navigation: {
                    prev: prevNavigation,
                    next: nextNavigation,
                    currentChapter: currentChapterNumber,
                    prevChapter: prevChapterNumber,
                    nextChapter: nextChapterNumber,
                    mangaDetailUrl
                },
                isAsiaSource: isAsiaSource
            });
        } catch (error) {
            console.error('Error fetching chapter:', error);
            res.status(500).render('error', {
                title: 'Error - Komikkuya',
                error: 'Failed to load chapter'
            });
        }
    }
};

module.exports = chapterController;
