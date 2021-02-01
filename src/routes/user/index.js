const express = require('express');
const JWTAuthorizationFilter = require('../../security/JWTAuthorizationFilter');
const singIn = require('./handler/singInHandler');
const { passwordRecovery, sendPasswordRecoveryEmail } = require('./handler/passwordRecoveryHandler');
const { sendEmailVerification, verifyEmail } = require('./handler/emailVerifitacionHandler');
const router = express.Router();

router.get('/verifyEmail/:token', verifyEmail);

router.get('/emailVerification', JWTAuthorizationFilter, sendEmailVerification);

router.get('/passwordRecovery/:email', sendPasswordRecoveryEmail);

router.post('/signIn', singIn);

router.post('/passwordRecovery', passwordRecovery);

module.exports = router;