// nhentaiDetailController.js
const fetch = require('node-fetch');

const nhentaiDetailController = {
    detail: async (req, res) => {
        try {
            const { slug } = req.params;

            if (!slug) {
                return res.status(400).render('error', {
                    title: 'Invalid Request - Komikkuya',
                    error: 'Slug tidak ditemukan'
                });
            }

            // URL asli nhentai gallery
            const nhUrl = `/g/${slug}/`;
            const apiUrl = `https://nh.komikkuya.my.id/read?href=${encodeURIComponent(nhUrl)}`;

            const response = await fetch(apiUrl, {
                headers: {
                    "ngrok-skip-browser-warning": "69420",
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                    "Accept": "*/*"
                }
            });

            const json = await response.json();

            if (!json || !json.title) {
                return res.status(500).render('error', {
                    title: 'Error - Komikkuya',
                    error: 'Failed to load nhentai details'
                });
            }

            // Normalisasi pages: ambil src dan href
            const pages = Array.isArray(json.pages)
                ? json.pages.map(p => ({
                    src: p.src,
                    href: p.href
                }))
                : [];

            const nhentai = {
                id: json.galleryId || slug,
                title: json.title || "Untitled",
                cover: json.cover || "/images/placeholder.jpg",
                tags: json.tags || [],
                pages
            };

            return res.render('nhentai/detail', {
                title: `${nhentai.title} - Komikkuya`,
                nhentai
            });

        } catch (error) {
            console.error('Error fetching nhentai details:', error);

            return res.status(500).render('error', {
                title: 'Error - Komikkuya',
                error: 'Failed to load nhentai details'
            });
        }
    }
};

module.exports = nhentaiDetailController;

