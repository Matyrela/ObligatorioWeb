import { Express } from 'express';
import { Activity } from "./Classes/Activity";

export class ActivityHandler {

    activityList: Activity[] = [new Activity(0, "", "")];

    constructor(app: Express) {

        app.post('/api/activity/create', (req, res) => {

            let playerName = req.body.playerName as string;
            let description = req.body.description as string;

            let newActivity = new Activity(this.activityList.length, playerName, description);
            this.activityList.push(newActivity);
        });

        app.put('/api/activity/remove', (req, res) => {
                
            let id = req.body.id as number;
            let activity = this.activityList.find(activity => activity.id == id);
            if (activity != undefined) {
                activity.disableActivity();
            }                                                                                                         
        });
    }
}