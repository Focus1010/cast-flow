// Health check API endpoint
export default function handler(req, res) {
  const buildTime = new Date().toISOString();
  
  res.status(200).json({
    status: 'healthy',
    message: 'Cast Flow API is running',
    buildTime,
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
}
