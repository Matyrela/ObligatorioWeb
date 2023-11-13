import { Activity } from "./Classes/Activity";
import { Proposal } from "./Classes/Proposal";
import { Express } from 'express';
import { UserHandler } from "./UserHandler";
import { Player } from "./Classes/Player";


export class ProposalHandler {

    proposalList: Proposal[] = [new Proposal(0, "enzo", "propuesta prueba", new Array(new Activity(0, "prueba", "prueba")))];
    proposalID: number = 0;
    playerName: string = "";
    description: string = "";
    activityList: Activity[] = [];

    constructor(app: Express) {
        app.post('/api/proposal/create', (req, res) => {
            let token = req.body.token as string;
            let player = UserHandler.getInstance().getPlayer(token) as Player;
            if (player != null) {
                let playerName = player?.name;
                let description = req.body.description as string;
                let activityList = req.body.activityList as Activity[];
                console.log(playerName);
                console.log(description);
                console.log(activityList);

                let newProposal = new Proposal(this.proposalList.length, playerName, description, activityList);
                this.proposalList.push(newProposal);
                res.send({ 'proposalCreated': true });
                return;
            }
            console.log("player null");
            return;

        });

        app.put('/api/proposal/remove', (req, res) => {

            let id = req.body.id as number;
            let proposal = this.proposalList.find(proposal => proposal.id == id);
            if (proposal != undefined) {
                proposal.disableProposal();
            }
            console.log(proposal);
            res.send({ 'proposalRemoved': true });
            return;
        });

        app.get('/api/proposal/get', (req, res) => {
            let proposals = this.proposalList.filter(proposal => proposal.enabled);
            res.send({ 'proposals': proposals });
            return;
        });

    }
}