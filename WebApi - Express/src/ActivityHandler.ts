import { Express } from 'express';
import { Activity } from "./Classes/Activity";
import { UserHandler } from './UserHandler';
import { Player } from './Classes/Player';
import { ActivityModel } from "./schemas/activitySchema";
import { UserModel } from './schemas/userSchema';


export class ActivityHandler {
    activityID: number = 0;
    playerName: string = "";
    description: string = "";
    habilitado: boolean = false;

    constructor(app: Express) {

        app.post('/api/activity/get', async (req, res) => {
            let playerDB = await UserModel.findOne({ userToken: req.body.token }).exec();
            if (playerDB != null) {
                let activities = await ActivityModel.find({ enabled: true, player_id: playerDB._id }).exec();
                res.send({ 'activities': activities }).status(200);
            } else {
                res.status(500).json({ error: 'player not found' });
            }

            return;
        });

        app.get('/api/activity/getAll', async (req, res) => {
            let activities = await ActivityModel.find({ enabled: true }).exec();
            res.send({ 'activities': activities }).status(200);
        });

        app.post('/api/activity/getPlayerByID', async (req, res) => {
            let playerID = req.body.playerID as string;
            let player = await UserHandler.getInstance().getPlayerByID(playerID);
            res.send({ 'player': player }).status(200);
        });

        app.post('/api/activity/create', async (req, res) => {
            let token = req.body.token as string;
            let description = req.body.description as string;
            const playerDB = await UserModel.find({ userToken: token }).exec();
            let player_id = playerDB?.[0]?._id;
            if (playerDB[0] != null) {
                try {
                    if (playerDB != null) {
                        const newActivity = new ActivityModel({ player_id: player_id, description });
                        await newActivity.save();
                    } else {
                        res.status(500).json({ error: 'No se encuentra en la bd' });
                        return;
                    }
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ error: error });
                    return;
                }
                res.send({ 'activityCreated': true });
                return;
            } else {
                res.status(500).json({ error: 'player nulo' });
            }
            return;
        });

        app.put('/api/activity/remove', async (req, res) => {
            try {
                const id = req.body.id as number;
                const activity = await ActivityModel.findOneAndUpdate({ _id: id }, { enabled: false }, { new: true });
                console.log(activity);
                res.send({ 'activityRemoved': true });
            } catch (err: any) {
                console.error(err);
                res.status(500).json({ error: err });
            }
        });
    }
}

