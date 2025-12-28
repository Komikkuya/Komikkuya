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
        res.render('legal/contact', {
            title: 'Contact Us - Komikkuya'
        });
    }
};

module.exports = legalController; 