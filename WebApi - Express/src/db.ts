const mongoose = require('mongoose');

async function main() {
    await mongoose.connect('mongodb://root:root@10.13.142.185:9999/');
}

main().catch(err => console.log(err));

export default main;