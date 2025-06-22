import mongoose from 'mongoose';
const uri = process.env.MONGODB_URI;

const clientOptions = {
  serverApi: { version: '1' as const, strict: true, deprecationErrors: true },
};
mongoose.connect(uri!, clientOptions);

export const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});
