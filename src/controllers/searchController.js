const fetch = require('node-fetch');

const searchController = {
    search: async (req, res) => {
        try {
            const { query } = req.query;
            
            if (!query) {
                return res.json({ success: true, data: [] });
            }

            const response = await fetch(`https://komiku-api-self.vercel.app/api/search?query=${encodeURIComponent(query)}`);
            
            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('API did not return JSON');
            }

            const data = await response.json();
            
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid response format from API');
            }
            
            res.json(data);
        } catch (error) {
            console.error('Error searching manga:', error);
            res.status(500).json({ 
                success: false, 
                error: error.message || 'Failed to search manga' 
            });
        }
    }
};

module.exports = searchController; 
