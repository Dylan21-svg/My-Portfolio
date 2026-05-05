const bcrypt = require('bcrypt');
const hash = '$2b$10$GugPuq6E02DhusLmtHaY3e0mi21azYzmsoLBpQ5xZxTWPXfrHGC.i';
const password = '#Dawson21';
bcrypt.compare(password, hash, (err, res) => {
    if (err) throw err;
    console.log('Match:', res);
});
