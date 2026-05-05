const bcrypt = require('bcrypt');
const fs = require('fs');
const password = '#Dawson21';
bcrypt.hash(password, 10, (err, hash) => {
    if (err) throw err;
    fs.writeFileSync('scripts/last_hash.txt', hash);
    console.log('Hash generated successfully.');
});
