// DoujinChapterController.js
const fetch = require("node-fetch");

const DoujinChapterController = {
    read: async (req, res) => {
        try {
            const { slug } = req.params;

            if (!slug) {
                return res.status(400).render("error", {
                    title: "Error - Komikkuya",
                    error: "Chapter slug is required"
                });
            }

            // URL chapter di https://mangapoi.my/
            const doujinUrl = `https://mangapoi.my/${slug}/`;
            const apiUrl = `https://cdn.komikkuya.my.id/api/chapter?url=${encodeURIComponent(doujinUrl)}`;

            const response = await fetch(apiUrl, {
                headers: {
                    "ngrok-skip-browser-warning": "true",
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                    "Accept": "*/*"
                }
            });

            const json = await response.json();

            // cek field baru "images"
            if (!json.success || !json.images) {
                return res.status(404).render("error", {
                    title: "Chapter Not Found - Komikkuya",
                    error: "Unable to load doujin chapter."
                });
            }

            // Navigation (prev/next)
            const navigation = {
                prev: json.prev ? `/doujin/chapter/${json.prev.split("/").filter(Boolean).pop()}` : null,
                next: json.next ? `/doujin/chapter/${json.next.split("/").filter(Boolean).pop()}` : null,
                all: null // tidak ada all_chapter di response baru
            };

            return res.render("doujin/chapter", {
                title: `Chapter - Komikkuya`,
                images: json.images, // gunakan "images" bukan "images_local"
                navigation
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

