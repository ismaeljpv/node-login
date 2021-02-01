const jwt = require('jsonwebtoken');
const Exception = require('../models/Exception');
const HttpStatus = require('http-status-codes');
const roles = require('../config/rolesEnum');
const { JWT_SECRET, HEADER_NAME } = require('./SecurityConstants');

const authorizationFilter = (req, res, next) => {

  const authHeader = req.headers[HEADER_NAME];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) { 
    return res.status(HttpStatus.StatusCodes.FORBIDDEN)
              .json(new Exception("Request forbidden.", 
                                  HttpStatus.ReasonPhrases.FORBIDDEN, 
                                  HttpStatus.StatusCodes.FORBIDDEN));
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
        return res.status(HttpStatus.StatusCodes.FORBIDDEN)
                  .json(new Exception(err, HttpStatus.ReasonPhrases.FORBIDDEN, HttpStatus.StatusCodes.FORBIDDEN));
    }  
    req.user = user;
    req.isAdmin = user.authorities.includes(roles.ADMIN);
    next();
  })

}

module.exports = authorizationFilter;