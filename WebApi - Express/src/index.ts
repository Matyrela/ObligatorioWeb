import express from 'express'
import cardRouter from './routes/cards'
import { GameManager } from './Classes/GameManager'

const app = express()
app.use(express.json()) //middleware

const PORT = 8080;

app.get('/test', (req, res) => {    
    console.log("hello world");
    res.send('V 1.1');
})
app.get('/api/game/create', (req, res) => { 
    console.log("Recibido : " + req.query.name);
    if (GameManager.getInstance().game == null) {
        GameManager.getInstance().createGame(req.query.name as string);
    }    
});

app.get('/api/game/get', (req, res) => { 
    console.log("Recibido : " + req.query.name);
    if(GameManager.getInstance().game != null) {
        res.send(GameManager.getInstance().getGame());
    }else{
        res.send("");
    }
});


app.use('/api/cards', cardRouter)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
