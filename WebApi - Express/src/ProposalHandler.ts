import { Activity } from "./Classes/Activity";
import { Express } from 'express';
import { UserModel } from "./schemas/userSchema";
import { ProposalModel } from "./schemas/proposalSchema";
import { Auth } from "./Auth";


export class ProposalHandler {

    // proposalList: Proposal[] = [new Proposal(0, "enzo", "propuesta prueba", new Array(new Activity(0, "prueba", "prueba")))];
    proposalID: number = 0;
    playerName: string = "";
    description: string = "";
    activityList: Activity[] = [];

    constructor(app: Express) {
        app.post('/api/proposal/create', Auth.checkToken, async (req, res) => {
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

        app.put('/api/proposal/remove', Auth.checkToken, async (req, res) => {
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

        app.post('/api/proposal/get', Auth.checkToken, async (req, res) => {
            let playerDB = await UserModel.findOne({ userToken: req.body.token }).exec();
            if (playerDB != null) {
                let proposals = await ProposalModel.find({ enabled: true, player_id: playerDB._id }).exec();
                res.send({ 'proposals': proposals }).status(200);
            } else {
                res.status(500).json({ error: 'player not found' });
            }
        });

        app.get('/api/proposal/getAll', Auth.checkToken, async (req, res) => {
            try {
                let proposals = await ProposalModel.aggregate([
                    { $match: { enabled: true } },
                    { $lookup: {
                        from: 'users',
                        localField: 'player_id',
                        foreignField: '_id',
                        as: 'player'
                    }},
                    { $unwind: '$player' },

                    {
                        $project: {
                            _id: 1,
                            description: 1,
                            activityList: 1,
                            'player.userName': 1,
                            'player._id': 1
                        }
                    }
                    
                ]);
                console.log(proposals);
                res.json({ 'proposals': proposals }).status(200);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Something went wrong!' });
            }
        });


    }
}