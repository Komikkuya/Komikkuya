/**
 * History Controller
 * Handles the history page functionality
 */

const getHistory = async (req, res) => {
  try {
    // In a real application, you would fetch the history from a database
    // For now, we'll return an empty array as the history is managed client-side
    res.render('history/index', {
      title: 'Reading History - Komikkuya',
      history: []
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).render('error', {
      title: 'Error - Komikkuya',
      message: 'An error occurred while fetching your reading history.'
    });
  }
};

module.exports = {
  getHistory
}; 
