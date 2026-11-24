const app = require('./app');
const connectDB = require('./config/db');
const { port } = require('./config');

connectDB()
  .then(() => app.listen(port, () => console.log(`API listening on ${port}`)))
  .catch((err) => {
    console.error('Startup error:', err.message);
    process.exit(1);
  });
