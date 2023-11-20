import mongoose from 'mongoose';

const proposalSchema = new mongoose.Schema({
    player_id: {
        type: Object,
        ref: 'users',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    activityList: {
        type: Array,
        required: true
    },
    enabled: {
        type: Boolean,
        required: true,
        default: true
    }
});

const ProposalModel = mongoose.model('Proposal', proposalSchema);

export { ProposalModel };