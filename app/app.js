import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import api from './api';

const env = process.env.NODE_ENV || 'development';
const app = express();

// if (env === 'production') {
//     app.use(function (req, res, next) {
//         if (req.headers['x-forwarded-proto'] !== 'https') {
//             return res.redirect(['https://', req.get('Host'), req.url].join(''));
//         }
//
//         return next();
//     });
// }

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

if(app.settings.env === 'development') {
    app.use(morgan('dev'));
}

app.get('/', function (req, res) {
    res.send('Backend-prototype API server ready...');
});

app.use('/', api);

app.use((err, req, res, next) => {
    if (err) {
        console.error(err.name + ': ' + err.message);
        res.status(500).send(err.message);
    } else {
        next(req, res);
    }
});

export default app;
