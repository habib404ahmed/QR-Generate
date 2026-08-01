const app = require('../backend/server');

module.exports = async (req, res) => {
  try {
    return app(req, res);
  } catch (err) {
    console.error('[Vercel API Error]', err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: err.message || 'Internal Vercel Serverless Error',
        stack: err.stack,
      });
    }
  }
};
