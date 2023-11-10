const mongoose = require('mongoose');

async function main() {
    await mongoose.connect('mongodb://root:root@localhost:9999');
}

main().catch(err => console.log(err));

export default main;