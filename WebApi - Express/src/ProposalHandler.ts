import { Activity } from "./Classes/Activity";
import { Proposal } from "./Classes/Proposal";
import { Express } from 'express';
import { UserHandler } from "./UserHandler";
import { Player } from "./Classes/Player";
import { UserModel } from "./schemas/userSchema";
import { ProposalModel } from "./schemas/proposalSchema";


export class ProposalHandler {

    // proposalList: Proposal[] = [new Proposal(0, "enzo", "propuesta prueba", new Array(new Activity(0, "prueba", "prueba")))];
    proposalID: number = 0;
    playerName: string = "";
    description: string = "";
    activityList: Activity[] = [];

    constructor(app: Express) {
        app.post('/api/proposal/create', async (req, res) => {
            let token = req.body.token as string;
            const playerDB = await UserModel.find({ userToken: token }).exec();
            let player_id = playerDB?.[0]?._id;
            if (playerDB[0] != null) {
                let description = req.body.description as string;
                let activityList = req.body.activityList as Activity[];
                console.log(description);
                console.log(activityList);

                try {
                    let proposalModel = new ProposalModel({ player_id, description, activityList });
                    await proposalModel.save();
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ error: error });
                    return;
                }
                res.send({ 'proposalCreated': true });
                return;
            }
            console.log("player null");
            return;

        });

        app.put('/api/proposal/remove', async (req, res) => {
            try {
                const id = req.body.id as string;
                console.log("id:", id);
                const proposal = await ProposalModel.findOneAndUpdate({ _id: id }, { enabled: false }, { new: true });
                console.log("proposal: ", proposal);
                res.send({ 'proposalRemoved': true });
            } catch (err: any) {
                console.error(err);
                res.status(500).json({ error: err });
            }
        });

        app.post('/api/proposal/get', async (req, res) => {
            let playerDB = await UserModel.findOne({ userToken: req.body.token }).exec();
            if (playerDB != null) {
                let proposals = await ProposalModel.find({ enabled: true, player_id: playerDB._id }).exec();
                res.send({ 'proposals': proposals }).status(200);
            } else {
                res.status(500).json({ error: 'player not found' });
            }
        });

        app.get('/api/proposal/getAll', async (req, res) => {
            let proposals = await ProposalModel.find({ enabled: true }).exec();
            res.send({ 'proposals': proposals }).status(200);
        });


    }
}