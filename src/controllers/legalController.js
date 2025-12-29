const fetch = require('node-fetch');

// Discord webhook URLs (hidden from client)
const DISCORD_WEBHOOKS = [
    'https://discord.com/api/webhooks/1455145456014196737/sy1zEjGbXoCRLqW8JDjktN1YvvQ8Fg3-eFVXN3wS7Bls-kpWL7dwSANXLtCMbJFi_big',
    'https://discord.com/api/webhooks/1455146998876340380/o-O3OAFuwuhcIL_RQLAvYE_hGLxWMJubhDfOPx7aucgeXXknP02XKVf3W6on0-lg_cKa'
];

// In-memory rate limit store (resets on server restart)
// For production with multiple instances, use Redis or similar
const rateLimitStore = new Map();
const RATE_LIMIT_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Get client IP address (supports Vercel/proxies)
function getClientIP(req) {
    // Vercel uses x-forwarded-for
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        // x-forwarded-for can contain multiple IPs, first one is the client
        return forwarded.split(',')[0].trim();
    }
    // Fallback to x-real-ip
    const realIP = req.headers['x-real-ip'];
    if (realIP) {
        return realIP;
    }
    // Fallback to connection remote address
    return req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
}

// Check if IP is rate limited
function isRateLimited(ip) {
    const lastSubmit = rateLimitStore.get(ip);
    if (!lastSubmit) return false;

    const timeSinceLastSubmit = Date.now() - lastSubmit;
    return timeSinceLastSubmit < RATE_LIMIT_DURATION;
}

// Get remaining time until rate limit expires (in minutes)
function getRateLimitRemaining(ip) {
    const lastSubmit = rateLimitStore.get(ip);
    if (!lastSubmit) return 0;

    const remaining = RATE_LIMIT_DURATION - (Date.now() - lastSubmit);
    return Math.ceil(remaining / 60000); // Convert to minutes
}

const legalController = {
    terms: (req, res) => {
        res.render('legal/terms', {
            title: 'Terms of Usage - Komikkuya'
        });
    },

    privacy: (req, res) => {
        res.render('legal/privacy', {
            title: 'Privacy Policy - Komikkuya'
        });
    },

    dmca: (req, res) => {
        res.render('legal/dmca', {
            title: 'DMCA - Komikkuya'
        });
    },

    contact: (req, res) => {
        const clientIP = getClientIP(req);
        const isLimited = isRateLimited(clientIP);
        const remainingMinutes = getRateLimitRemaining(clientIP);

        res.render('legal/contact', {
            title: 'Contact Us - Komikkuya',
            success: req.query.success === 'true',
            error: req.query.error,
            isRateLimited: isLimited,
            remainingMinutes: remainingMinutes
        });
    },

    // POST handler for contact form - sends to Discord webhooks
    submitContact: async (req, res) => {
        try {
            const clientIP = getClientIP(req);

            // Check rate limit
            if (isRateLimited(clientIP)) {
                const remaining = getRateLimitRemaining(clientIP);
                return res.redirect(`/contact?error=You can only send one message per hour. Please try again in ${remaining} minutes.`);
            }

            const { name, email, subject, message } = req.body;

            // Validate required fields
            if (!name || !email || !subject || !message) {
                return res.redirect('/contact?error=Please fill all required fields');
            }

            // Subject mapping
            const subjectLabels = {
                'general': '📩 General Inquiry',
                'support': '🔧 Technical Support',
                'feedback': '💬 Feedback',
                'dmca': '⚠️ DMCA Notice',
                'other': '📝 Other'
            };

            // Create Discord embed
            const embed = {
                title: subjectLabels[subject] || '📩 New Contact Message',
                color: 0x8B5CF6, // Purple color
                fields: [
                    {
                        name: '👤 Name',
                        value: name,
                        inline: true
                    },
                    {
                        name: '📧 Email',
                        value: email,
                        inline: true
                    },
                    {
                        name: '📋 Subject',
                        value: subject,
                        inline: true
                    },
                    {
                        name: '🌐 IP Address',
                        value: `||${clientIP}||`, // Spoiler tag for privacy
                        inline: true
                    },
                    {
                        name: '💬 Message',
                        value: message.length > 1024 ? message.substring(0, 1021) + '...' : message,
                        inline: false
                    }
                ],
                footer: {
                    text: 'Komikkuya Contact Form'
                },
                timestamp: new Date().toISOString()
            };

            const payload = {
                username: 'Komikkuya Contact',
                avatar_url: 'https://komikkuya.my.id/assets/favicon.png',
                embeds: [embed]
            };

            // Send to all Discord webhooks in parallel
            const webhookPromises = DISCORD_WEBHOOKS.map(webhookUrl =>
                fetch(webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                })
            );

            const results = await Promise.allSettled(webhookPromises);

            // Check if at least one webhook succeeded
            const anySuccess = results.some(result =>
                result.status === 'fulfilled' && result.value.ok
            );

            if (anySuccess) {
                // Set rate limit for this IP
                rateLimitStore.set(clientIP, Date.now());
                return res.redirect('/contact?success=true');
            } else {
                console.error('All Discord webhooks failed:', results);
                return res.redirect('/contact?error=Failed to send message. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting contact form:', error);
            return res.redirect('/contact?error=An error occurred. Please try again later.');
        }
    },

    about: (req, res) => {
        res.render('legal/about', {
            title: 'Tentang Kami - Komikkuya',
            metaDescription: 'Tentang Komikkuya - Platform baca komik gratis manga, manhwa, manhua dalam Bahasa Indonesia. Baca komik online tanpa iklan!',
            metaKeywords: 'tentang komikkuya, about komikkuya, baca komik gratis, manga indonesia, manhwa indonesia, manhua indonesia',
            canonicalUrl: 'https://komikkuya.my.id/about',
            currentPath: '/about'
        });
    }
};

module.exports = legalController;
