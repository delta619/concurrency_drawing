const express = require('express');

const app = express();

const publicRoutes = require('./routes/publicRoute')


const globalErrorController = require('./controller/errorController');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require('helmet');
const hpp = require('hpp');
const cors = require('cors');
const rawBody = require('raw-body');
const path = require('path');
// GLOBAL
app.use(morgan('dev'));
// protect
app.use(helmet());


// prevent NOSQL injection

// prevent xss

app.use(xss());

// setting global cors

// if(process.env.NODE_ENV == "development"){
app.use(cors());
// }

// prevent parameter pollution

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// fetch initial data 

app.use('/api/public', publicRoutes);

app.all('*', (req, res, next) => {
  return res.status(204).end();
});

app.use(globalErrorController);

exports.Server = app;
