const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI;

console.log(uri);

const clientOptions = {
  serverApi: { version: '1', strict: true, deprecationErrors: true },
};
mongoose.connect(uri, clientOptions);

export const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});
