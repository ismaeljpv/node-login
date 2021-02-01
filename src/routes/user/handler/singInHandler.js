const HttpStatus = require("http-status-codes");
const bcrypt = require("bcrypt");
const nunjucks = require("nunjucks");
const Exception = require("../../../models/Exception");
const sendMail = require("../../../service/mailService");
const {
    savePersonAndUser,
    validateEmail,
    validateUsername,
} = require("../../../service/userService");

const signIn = async (req, res) => {
    const saltRounds = 10;
    const user = req.body;
    const isValidUsername = await validateUsername(user.username);
    const isValidEmail = await validateEmail(user.email);

    if (!isValidUsername || !isValidEmail) {
        const msg = !isValidEmail ? "El email ya se encuentra registrado." : "El user ya se encuentra registrado.";
        return res.status(HttpStatus.StatusCodes.BAD_REQUEST)
            .json(
                new Exception(
                    msg,
                    HttpStatus.ReasonPhrases.BAD_REQUEST,
                    HttpStatus.StatusCodes.BAD_REQUEST
                )
            );
    }

    user.password = await bcrypt.hash(user.password, saltRounds);
    const dbInsertion = await savePersonAndUser(user).catch((error) => {
        res.status(HttpStatus.StatusCodes.EXPECTATION_FAILED)
            .json(
                new Exception(
                    error.message,
                    HttpStatus.ReasonPhrases.EXPECTATION_FAILED,
                    HttpStatus.StatusCodes.EXPECTATION_FAILED
                )
            );
    });

    if (dbInsertion) {
        const newUser = dbInsertion.user;
        const template = nunjucks.render("src/templates/userRegistration.html", {
            username: newUser.username,
        });
        const result = await sendMail(newUser.email, "Registro de usuario", template);

        if (!result.isSended) {
            console.log(`Error al enviar email de registro para usuario ${newUser.username}`, result.error);
        }
        res.status(HttpStatus.StatusCodes.OK).json(newUser);
    }
};

module.exports = signIn;
