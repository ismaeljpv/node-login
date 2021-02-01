const HttpStatus = require('http-status-codes');
const uuid = require('uuid');
const nunjucks = require('nunjucks');
const bcrypt = require('bcrypt');
const Exception = require('../../../models/Exception');
const sendMail = require('../../../service/mailService');
const { getUserInfoByEmail, updateUserPassword } = require('../../../service/userService');
const { createSecurityToken, updateTokenStatus, getActiveTokenByUser } = require('../../../service/tokenService');

const sendPasswordRecoveryEmail = async (req, res) => {

    let token = '';
    const dbUser = await getUserInfoByEmail(req.params.email).catch(error => {
        return res.status(HttpStatus.StatusCodes.BAD_REQUEST)
                  .json(new Exception(error.message, 
                                      HttpStatus.ReasonPhrases.BAD_REQUEST,
                                      HttpStatus.StatusCodes.BAD_REQUEST
                                      ));
    });

    const activeToken = await getActiveTokenByUser(dbUser.data.id_user).catch(error => console.log(error.message));
    if (!activeToken || !activeToken.hasToken) {
        const newToken = await createSecurityToken(dbUser.data.id_user, uuid.v4()).catch(error => {
            return res.status(HttpStatus.StatusCodes.EXPECTATION_FAILED)
                      .json(new Exception(error.message, 
                            HttpStatus.ReasonPhrases.EXPECTATION_FAILED, 
                            HttpStatus.StatusCodes.EXPECTATION_FAILED
                            ));
        });
        token = newToken.token;
    } else {
        token = activeToken.token;
    }

    const template = nunjucks.render('src/templates/passwordRecovery.html',{ username: dbUser.data.username, token });
    const result = await sendMail(dbUser.data.email, 'Recuperación de contraseña', template);       
    if (!result.isSended) {
      return res.status(HttpStatus.StatusCodes.EXPECTATION_FAILED)
                 .json(new Exception(result.message, 
                       HttpStatus.ReasonPhrases.EXPECTATION_FAILED, 
                       HttpStatus.StatusCodes.EXPECTATION_FAILED
                      ));
    }

    await updateTokenStatus(dbUser.data.id_user, token).catch(error => console.log(error));
    res.status(HttpStatus.StatusCodes.OK)
       .json({ message : "token de recuperación de contraseña enviado exitosamente."});
}


const passwordRecovery = async (req, res) => {

    const saltRounds = 10;
    const {password, token} = req.body;
    const newPassword = await bcrypt.hash(password, saltRounds);
    const result = await updateUserPassword(newPassword, token).catch(error => {
        return res.status(HttpStatus.StatusCodes.BAD_REQUEST)
                  .json(new Exception(error.message, 
                    HttpStatus.ReasonPhrases.BAD_REQUEST,
                    HttpStatus.StatusCodes.BAD_REQUEST));
    });
    
    res.status(HttpStatus.StatusCodes.OK).json({ message: result.message }); 
}

module.exports = {
    sendPasswordRecoveryEmail, 
    passwordRecovery
};