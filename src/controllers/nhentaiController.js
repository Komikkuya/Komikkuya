const fetch = require("node-fetch");

class NhentaiController {
    async index(req, res) {
        try {
            const pageNumber = Number(req.query.page) || 1;

            const apiUrl = `https://nh.komikkuya.my.id/scrape?page=${pageNumber}`;

            const result = await fetch(apiUrl, {
                headers: {
                    "ngrok-skip-browser-warning": "true",
                    "skip-browser-warning": "1",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                    "Accept": "*/*"
                }
            });

            const json = await result.json();

            if (!json.galleries || !Array.isArray(json.galleries)) {
                return res.status(500).render("error", {
                    message: "Unable to load nhentai list.",
                    error: process.env.NODE_ENV === "development" ? json : {}
                });
            }

            const entries = json.galleries.map(item => {
                let slug = "#";
                if (item.href) {
                    try {
                        const parts = item.href.split("/").filter(Boolean);
                        slug = parts.pop();
                    } catch (e) {
                        console.error("Invalid href:", item.href);
                    }
                }

                return {
                    title: item.caption || "Untitled",
                    thumbnail: item.localThumb?.includes("undefined")
                        ? "/images/placeholder.jpg"
                        : item.localThumb,
                    link: `/nhentai/g/${slug}`,
                    popular: item.popular === true // include the new flag
                };
            });

            const pagination = {
                page: Number(json.page) || pageNumber,
                totalItems: 23000, 
                prev: pageNumber > 1 ? pageNumber - 1 : 1,
                next: pageNumber + 1
            };

            return res.render("nhentai/index", {
                title: "nhentai Update",
                layout: 'layouts/doujin',
                items: entries,
                pagination
            });

        } catch (err) {
            console.error("NhentaiController Error:", err);

            return res.status(500).render("error", {
                message: "Error fetching nhentai data.",
                error: process.env.NODE_ENV === "development" ? err : {}
            });
        }
    }
}

module.exports = new NhentaiController();

