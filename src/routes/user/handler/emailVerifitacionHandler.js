const HttpStatus = require('http-status-codes');
const uuid = require('uuid');
const nunjucks = require('nunjucks');
const Exception = require('../../../models/Exception');
const sendMail = require('../../../service/mailService');
const { verifyEmailByToken, checkEmailStatus } = require('../../../service/userService');
const { createSecurityToken, updateTokenStatus, getActiveTokenByUser } = require('../../../service/tokenService');

const sendEmailVerification = async (req, res) => {

    let token = '';
    const user = req.user;
    const isEmailInactive = await checkEmailStatus(user.idUser);
    if (!isEmailInactive) {
        return res.status(HttpStatus.StatusCodes.BAD_REQUEST)
            .json(new Exception('Su email ya se encuentra verificado',
                HttpStatus.ReasonPhrases.BAD_REQUEST,
                HttpStatus.StatusCodes.BAD_REQUEST
            ));
    }

    const activeToken = await getActiveTokenByUser(user.idUser).catch(error => console.log(error.message));
    if (!activeToken || !activeToken.hasToken) {
        const newToken = await createSecurityToken(user.idUser, uuid.v4())
            .catch(error => {
                return res.status(HttpStatus.StatusCodes.EXPECTATION_FAILED)
                          .json(new Exception(error.message,
                                HttpStatus.ReasonPhrases.EXPECTATION_FAILED,
                                HttpStatus.StatusCodes.EXPECTATION_FAILED
                            ));
            });
        token = (newToken) ? newToken.token : null;
    } else {
        token = activeToken.token;
    }

    if (token) {
        const template = nunjucks.render('src/templates/emailVerification.html', { email: user.email, token });
        const result = await sendMail(user.email, 'Verificación de Email', template);
        if (!result.isSended) {
            return res.status(HttpStatus.StatusCodes.EXPECTATION_FAILED)
                      .json(new Exception(result.message,
                            HttpStatus.ReasonPhrases.EXPECTATION_FAILED,
                            HttpStatus.StatusCodes.EXPECTATION_FAILED
                        ));
        }

        await updateTokenStatus(user.idUser, token).catch(error => console.log(error));
        res.status(HttpStatus.StatusCodes.OK).json({ message: "token de seguridad enviado exitosamente." });
    }
}

const verifyEmail = async (req, res) => {

    const token = req.params.token;
    const result = await verifyEmailByToken(token).catch(error => {
        return res.status(HttpStatus.StatusCodes.EXPECTATION_FAILED)
            .json(new Exception(error.message,
                HttpStatus.ReasonPhrases.EXPECTATION_FAILED,
                HttpStatus.StatusCodes.EXPECTATION_FAILED
            ));
    });

    if (result) res.status(HttpStatus.StatusCodes.OK).json(result);

}

module.exports = {
    sendEmailVerification,
    verifyEmail
};