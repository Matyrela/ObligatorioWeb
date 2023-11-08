import { Express } from 'express';
import { Activity } from "./Classes/Activity";
import { UserHandler } from './UserHandler';
import { Player } from './Classes/Player';

export class ActivityHandler {

    activityList: Activity[] = [new Activity(0, "prueba", "prueba")];
    activityID: number = 0;
    playerName: string = "";
    description: string = "";
    habilitado: boolean = false;

    constructor(app: Express) {

        app.post('/api/activity/create', (req, res) => {
            let token = req.body.token as string;
            let player = UserHandler.getInstance().getPlayer(token) as Player;
            if (player != null) {
                let playerName = player?.name;
                let description = req.body.description as string;
                console.log(playerName);
                console.log(description);

                let newActivity = new Activity(this.activityList.length, playerName, description);
                this.activityList.push(newActivity);
                res.send({ 'activityCreated': true });
                return;
            } else {
                console.log("player null");
            }

            return;
        });

        app.put('/api/activity/remove', (req, res) => {

            let id = req.body.id as number;
            let activity = this.activityList.find(activity => activity.id == id);
            if (activity != undefined) {
                activity.disableActivity();
            }
            console.log(activity);
            res.send({ 'activityRemoved': true });
            return;
        });

        app.get('/api/activity/get', (req, res) => {
            let activities = this.activityList.filter(activity => activity.enabled);
            res.send({ 'activities': activities });
            return;
        });

    }
}