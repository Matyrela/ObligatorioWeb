import express from 'express';
const cors = require('cors');
import { GameHandler } from './GameHandler';
import { UserHandler } from './UserHandler';
import { createServer } from "http";

const app = express()
var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200, 
    methods: "GET, PUT"
}
app.use(express.json())

const httpServer = createServer(app);


app.use(cors(corsOptions));
const PORT = 7777;

new GameHandler(app, httpServer);
new UserHandler(app);

app.get('/api/ping', (req, res) => {
    res.send('pong');
});

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})