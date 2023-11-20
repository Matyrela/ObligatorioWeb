import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userName: String,
    userPassword: String,
    userToken: String
});

const UserModel = mongoose.model('User', userSchema);

export { UserModel };