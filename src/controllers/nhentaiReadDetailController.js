// nhentaiReadDetailController.js
const fetch = require('node-fetch');

const nhentaiReadDetailController = {
    detail: async (req, res) => {
        try {
            const { galleryId, page } = req.params; // ambil dari URL param

            if (!galleryId || !page) {
                return res.status(400).render('error', {
                    title: 'Invalid Request - Komikkuya',
                    error: 'Gallery ID atau Page tidak ditemukan'
                });
            }

            // Bentuk href sesuai format API
            const href = `/g/${galleryId}/${page}/`;
            const apiUrl = `https://nh.komikkuya.my.id/readdetail?href=${encodeURIComponent(href)}`;

            const response = await fetch(apiUrl, {
                headers: {
                    "ngrok-skip-browser-warning": "69420",
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                    "Accept": "*/*"
                }
            });

            const json = await response.json();

            if (!json || !json.image) {
                return res.status(500).render('error', {
                    title: 'Error - Komikkuya',
                    error: 'Failed to load read detail'
                });
            }

            const readDetail = {
                href: json.href || href,
                title: json.title || "Untitled",
                galleryId: json.galleryId || galleryId,
                image: json.image || "/images/placeholder.jpg",
                pagination: json.pagination || {}
            };

            return res.render('nhentai/readDetail', {
                title: `${readDetail.title} - Komikkuya`,
                readDetail
            });

        } catch (error) {
            console.error('Error fetching read detail:', error);

            return res.status(500).render('error', {
                title: 'Error - Komikkuya',
                error: 'Failed to load read detail'
            });
        }
    }
};

module.exports = nhentaiReadDetailController;
