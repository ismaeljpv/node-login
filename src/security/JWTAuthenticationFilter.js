const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('./SecurityConstants');

const authenticationFilter = dbUser => {
    const user = new User(
        dbUser.id_person,
        dbUser.id_user,
        dbUser.firstname,
        dbUser.lastname,
        dbUser.identification,
        dbUser.email,
        dbUser.phone,
        dbUser.user,
        dbUser.roles
    );
    return jwt.sign(JSON.parse(JSON.stringify(user)) , JWT_SECRET, { expiresIn: '18000s' });
}

module.exports = authenticationFilter;