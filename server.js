const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

const { Server } = require('./app');

console.log(`#${process.env.NODE_ENV}# mode is on`);

if (process.env.NODE_ENV == 'production') {
  [db, dbServerName] = [
    process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD),
    'Production Server',
  ];
} else {
  [db, dbServerName] = [process.env.DATABASE_LOCAL, 'Local'];
}

mongoose
  .connect(db, {
    // useNewUrlParser: true,
    // useCreateIndex: false, // Deprecated, no longer needed
    // useFindAndModify: false, // Deprecated, no longer needed
    // useUnifiedTopology: false,
    serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds if no server is available
  })
  .then((con) => {
    console.log(`MongoDB connected at ${dbServerName}`);
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit with error code 1
  });

// Test
Server.listen(process.env.PORT || 3000, (err) => {
  if (err) {
    console.error('Server startup error:', err);
    process.exit(1); // Exit with error code 1
  } else {
    console.log(`Server started at port ${process.env.PORT || 3000}`);
  }
});
