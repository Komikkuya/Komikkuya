const { fetchJsonWithFallback } = require("../utils/apiFetch");

const DOUJIN_SITE = "https://komikdewasa.id";

const DoujinChapterController = {
    read: async (req, res) => {
        try {
            const { slug } = req.params;
            const server = req.query.server || '1'; // Default to server 1

            if (!slug) {
                return res.status(400).render("error", {
                    title: "Error - Komikkuya",
                    error: "Chapter slug is required"
                });
            }

            let apiPath;
            if (server === '2') {
                // Server 2: /api/doujin/v2/chapter?slug=SLUG
                apiPath = `/api/doujin/v2/chapter?slug=${slug}`;
            } else {
                // Server 1: /api/doujin/chapter?url=URL (default)
                const chapterUrl = `${DOUJIN_SITE}/baca/${slug}/`;
                apiPath = `/api/doujin/chapter?url=${encodeURIComponent(chapterUrl)}`;
            }

            // Use fetchJsonWithFallback for automatic fallback
            const json = await fetchJsonWithFallback(apiPath);

            if (!json.success || !json.data) {
                return res.status(404).render("error", {
                    title: "Chapter Not Found - Komikkuya",
                    error: "Unable to load doujin chapter. Try switching server."
                });
            }

            const data = json.data;

            // Build navigation with server param
            const navigation = {
                prev: data.prevChapter && data.prevChapter.slug
                    ? `/doujin/chapter/${data.prevChapter.slug}?server=${server}`
                    : null,
                next: data.nextChapter && data.nextChapter.slug
                    ? `/doujin/chapter/${data.nextChapter.slug}?server=${server}`
                    : null,
                mangaUrl: data.mangaSlug ? `/doujin/${data.mangaSlug}` : null
            };

            // Map images
            const images = (data.images || []).map(img => ({
                page: img.page || 0,
                url: img.url || "",
                alt: img.alt || `Page ${img.page}`
            }));

            return res.render("doujin/chapter", {
                title: `${data.mangaTitle || 'Doujin'} - ${data.chapterNumber || 'Chapter'} - Komikkuya`,
                metaDescription: `Baca ${data.mangaTitle} ${data.chapterNumber} di Komikkuya. Komik dewasa gratis tanpa iklan.`,
                mangaTitle: data.mangaTitle || "Doujin",
                mangaSlug: data.mangaSlug || "",
                chapterNumber: data.chapterNumber || "Chapter",
                chapterSlug: data.slug || slug,
                totalImages: data.totalImages || images.length,
                images,
                navigation,
                currentServer: server
            });

        } catch (error) {
            console.error("DoujinChapterController Error:", error);
            return res.status(500).render("error", {
                title: "Error - Komikkuya",
                error: "Failed to load doujin chapter."
            });
        }
    }
};

module.exports = DoujinChapterController;
