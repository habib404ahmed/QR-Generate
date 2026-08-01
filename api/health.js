module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({ success: true, message: 'Server is healthy and online' });
};
