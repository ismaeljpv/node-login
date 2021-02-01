const express = require('express');
const JWTAuthorizationFilter = require('../../security/JWTAuthorizationFilter');
const login = require('./handlers/loginHandler');
const router = express.Router();

router.get('/test', JWTAuthorizationFilter, (req, res) => {
    res.json({msg: 'Request successfull.'});
});

router.post('/login', login);

module.exports = router;