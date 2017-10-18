import express from 'express';

const app = express();

app.get('/', function (req, res) {
    res.send('Backend-prototype API server ready');
});

const port = process.env.PORT || 3010;
app.listen(port, function () {
    console.log('Server listening on port ' + port);
});
