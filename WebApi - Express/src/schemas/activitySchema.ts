import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    player_id: {
        type: Object,
        ref: 'users',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    enabled: {
        type: Boolean,
        required: true,
        default: true
    }
});

const ActivityModel = mongoose.model('Activity', activitySchema);

export { ActivityModel };