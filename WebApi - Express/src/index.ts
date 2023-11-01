import express from 'express';
const cors = require('cors');
import { GameHandler } from './GameHandler';
import { UserHandler } from './UserHandler';

const app = express()
app.use(express.json())
var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200, 
    methods: "GET, PUT"
}
app.use(cors(corsOptions));
const PORT = 7777;

new GameHandler(app);
new UserHandler(app);

app.get('/api/ping', (req, res) => {
    res.send({'ping' : 'pong'});
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})