/**
 * Bing URL Submission Script
 * Submit URLs to Bing Webmaster API for faster indexing
 * 
 * Setup:
 * 1. Login to https://www.bing.com/webmasters
 * 2. Verify your site
 * 3. Go to Settings > API Access > API Key
 * 4. Copy API Key and paste below
 * 
 * Usage: node bing-submit.js
 */

const https = require('https');

// ============ CONFIGURATION ============
const API_KEY = 'cddcb043c8664911b04cb5bcbb251868'; // Get from Bing Webmaster Tools
const SITE_URL = 'https://komikkuya.my.id';
// =======================================

// URLs to submit (100 URLs)
const urlsToSubmit = [
    // Main Pages
    '/',
    '/popular',
    '/popular?category=manga',
    '/popular?category=manhwa',
    '/popular?category=manhua',
    '/latest',
    '/latest?category=manga',
    '/latest?category=manhwa',
    '/latest?category=manhua',
    '/genre',
    '/doujin',
    '/nhentai',
    '/terms',
    '/privacy',
    '/dmca',
    '/contact',
    // Genre Pages
    '/genre?genre=Action',
    '/genre?genre=Adventure',
    '/genre?genre=Comedy',
    '/genre?genre=Drama',
    '/genre?genre=Fantasy',
    '/genre?genre=Horror',
    '/genre?genre=Romance',
    '/genre?genre=School',
    '/genre?genre=Isekai',
    '/genre?genre=Martial+Arts',
    '/genre?genre=Slice+of+Life',
    '/genre?genre=Sports',
    '/genre?genre=Supernatural',
    '/genre?genre=Mystery',
    '/genre?genre=Psychological',
];

// Build full URLs
const fullUrls = urlsToSubmit.map(path => `${SITE_URL}${path}`);

/**
 * Submit single URL to Bing
 */
function submitUrl(url) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({ siteUrl: SITE_URL, url: url });

        const options = {
            hostname: 'ssl.bing.com',
            port: 443,
            path: `/webmaster/api.svc/json/SubmitUrl?apikey=${API_KEY}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve({ url, status: 'success', response: data });
                } else {
                    resolve({ url, status: 'error', code: res.statusCode, response: data });
                }
            });
        });

        req.on('error', (e) => {
            resolve({ url, status: 'error', error: e.message });
        });

        req.write(postData);
        req.end();
    });
}

/**
 * Submit URLs in batch (Bing batch API)
 */
function submitUrlBatch(urls) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            siteUrl: SITE_URL,
            urlList: urls
        });

        const options = {
            hostname: 'ssl.bing.com',
            port: 443,
            path: `/webmaster/api.svc/json/SubmitUrlBatch?apikey=${API_KEY}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve({ status: 'success', count: urls.length, response: data });
                } else {
                    resolve({ status: 'error', code: res.statusCode, response: data });
                }
            });
        });

        req.on('error', (e) => {
            resolve({ status: 'error', error: e.message });
        });

        req.write(postData);
        req.end();
    });
}

/**
 * Main function
 */
async function main() {
    console.log('='.repeat(50));
    console.log('Bing URL Submission Script');
    console.log('='.repeat(50));
    console.log(`Site: ${SITE_URL}`);
    console.log(`Total URLs to submit: ${fullUrls.length}`);
    console.log('');

    if (API_KEY === 'YOUR_BING_API_KEY_HERE') {
        console.log('ERROR: Please set your Bing API Key first!');
        console.log('');
        console.log('How to get API Key:');
        console.log('1. Go to https://www.bing.com/webmasters');
        console.log('2. Add and verify your site');
        console.log('3. Go to Settings > API Access > API Key');
        console.log('4. Copy the API Key and paste in this script');
        return;
    }

    // Submit in batch (more efficient)
    console.log('Submitting URLs in batch mode...');
    console.log('');

    // Bing batch API accepts up to 500 URLs at once
    const batchSize = 100;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < fullUrls.length; i += batchSize) {
        const batch = fullUrls.slice(i, i + batchSize);
        console.log(`Submitting batch ${Math.floor(i / batchSize) + 1} (${batch.length} URLs)...`);

        const result = await submitUrlBatch(batch);

        if (result.status === 'success') {
            successCount += batch.length;
            console.log(`  [OK] Batch submitted successfully`);
        } else {
            errorCount += batch.length;
            console.log(`  [ERROR] ${result.response || result.error}`);
        }
    }

    console.log('');
    console.log('='.repeat(50));
    console.log('Summary:');
    console.log(`  Success: ${successCount} URLs`);
    console.log(`  Error: ${errorCount} URLs`);
    console.log('='.repeat(50));
}

// Run
main();
