const mongoose = require('mongoose');

async function main() {
    await mongoose.connect('mongodb://desarrollo-web:kaZfRFQumAJ7B90SElNRoOPiYYvmYqIy7ck62hoc5810kXN4oXIGSKcUncuPsHSY3YNymVTjTaX9ACDbKZDNNA==@desarrollo-web.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@desarrollo-web@');
}

main().catch(err => console.log(err));

export default main;