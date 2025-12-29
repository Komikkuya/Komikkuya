const { fetchJsonWithFallback } = require("../utils/apiFetch");

const API_BASE = "https://komiku-api-self.vercel.app";

class DoujinController {
    async index(req, res) {
        try {
            const pageNumber = Number(req.query.page) || 1;

            // Use fetchJsonWithFallback for automatic fallback
            const json = await fetchJsonWithFallback(`/api/doujin/last-update?page=${pageNumber}`);

            if (!json.success || !json.data) {
                return res.status(500).render("error", {
                    title: "Error - Komikkuya",
                    message: "Unable to load doujin list.",
                    error: process.env.NODE_ENV === "development" ? json : {}
                });
            }

            const entries = json.data.results.map(item => ({
                title: item.title || "Untitled",
                slug: item.slug || "",
                imageUrl: item.imageUrl || "/images/placeholder.jpg",
                genres: item.genres || [],
                chapters: item.chapters || [],
                latestChapter: item.chapters && item.chapters[0] ? item.chapters[0].title : "-"
            }));

            const TOTAL_PAGES = 88; // Total known pages

            const pagination = {
                page: json.data.page || pageNumber,
                totalPages: TOTAL_PAGES,
                totalItems: json.data.totalResults || entries.length,
                prev: pageNumber > 1 ? pageNumber - 1 : null,
                next: pageNumber < TOTAL_PAGES ? pageNumber + 1 : null
            };

            return res.render("doujin/index", {
                title: "Doujin Update - Komikkuya",
                metaDescription: "Baca doujin terbaru di Komikkuya. Update harian komik dewasa gratis tanpa iklan.",
                items: entries,
                pagination
            });

        } catch (err) {
            console.error("DoujinController Error:", err);

            return res.status(500).render("error", {
                title: "Error - Komikkuya",
                message: "Error fetching doujin data.",
                error: process.env.NODE_ENV === "development" ? err : {}
            });
        }
    }
}

module.exports = new DoujinController();
