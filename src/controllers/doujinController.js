const fetch = require("node-fetch");

class DoujinController {
    async index(req, res) {
        try {
            const pageNumber = Number(req.query.page) || 1;

            const apiUrl = `https://cdn.komikkuya.my.id/api/d/${pageNumber}`;

            const result = await fetch(apiUrl, {
                headers: {
                    "ngrok-skip-browser-warning": "true",
                    "skip-browser-warning": "1",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                    "Accept": "*/*"
                }
            });

            const json = await result.json();

            if (!json.success) {
                return res.status(500).render("error", {
                    message: "Unable to load doujin list.",
                    error: process.env.NODE_ENV === "development" ? json : {}
                });
            }

            const entries = json.data.map(item => {
                let slug = "#";
                if (item.link) {
                    try {
                        const urlObj = new URL(item.link);
                        const parts = urlObj.pathname.split("/").filter(Boolean);
                        slug = parts.pop();
                    } catch (e) {
                        console.error("Invalid URL:", item.link);
                    }
                }

                return {
                    title: item.title || "Untitled",
                    type: item.type || "UNKNOWN",
                    thumbnail: item.thumbnail?.includes("undefined")
                        ? "/images/placeholder.jpg"
                        : item.thumbnail,
                    link: `/doujin/${slug}`,
                    chapter: item.chapter || "-",
                    rating: item.rating || "-"
                };
            });

            const pagination = {
                page: json.page,
                totalItems: json.total || entries.length,
                prev: pageNumber > 1 ? pageNumber - 1 : 1,
                next: pageNumber + 1
            };

            return res.render("doujin/index", {
                title: "Doujin Update",
                items: entries,
                pagination
            });

        } catch (err) {
            console.error("DoujinController Error:", err);

            return res.status(500).render("error", {
                message: "Error fetching doujin data.",
                error: process.env.NODE_ENV === "development" ? err : {}
            });
        }
    }
}

module.exports = new DoujinController();
