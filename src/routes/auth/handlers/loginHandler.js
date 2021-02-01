const HttpStatus = require('http-status-codes');
const bcrypt = require('bcrypt');
const Exception = require('../../../models/Exception');
const JWTAutheticationFilter = require('../../../security/JWTAuthenticationFilter');
const { HEADER_SIGN, HEADER_NAME } = require('../../../security/SecurityConstants');
const { findUserByUsername } = require('../../../service/userService');

const login = async (req, res) => {
    
    const { username, password } = req.body;
    const dbUser = await findUserByUsername(username).catch(error => {
        return res.status(HttpStatus.StatusCodes.NOT_FOUND)
                  .json(new Exception(error.message, 
                                      HttpStatus.ReasonPhrases.NOT_FOUND, 
                                      HttpStatus.StatusCodes.NOT_FOUND
                                      )); 
    });

    const match = await bcrypt.compare(password, dbUser.data.password);
    if (!match) {
        return res.status(HttpStatus.StatusCodes.BAD_REQUEST)
                  .json(new Exception('Contraseña inválida', 
                                      HttpStatus.ReasonPhrases.BAD_REQUEST, 
                                      HttpStatus.StatusCodes.BAD_REQUEST
                                      ));
    }
    const token = JWTAutheticationFilter(dbUser.data);
    res.set(HEADER_NAME, HEADER_SIGN + token);
    res.send();  
}   

module.exports = login;