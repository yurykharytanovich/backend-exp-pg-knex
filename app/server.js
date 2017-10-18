import 'babel-polyfill';
import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 3010;
app.listen(port, () => {
    console.log(`Application server started at http://localhost:${port}`);
});
