const dbConnection = require('../config/databaseConfig');

const findUserByUsername = username => {
    return new Promise((resolve, reject) => {
        dbConnection.query(`SELECT u.*, p.*,
           array(  SELECT r.role FROM role r, user_role ur 
                   WHERE r.id_role = ur.id_rol AND ur.id_user = u.id_user ) AS roles
           FROM  "user" u, person p
           WHERE u.id_person = p.id_person
           AND (u.username = $1 OR p.email = $2)
           AND u.status = 'A' `, [username, username], 
            (err, rs) => {
                if (err) {
                    reject({
                        message: 'Error al obtener usuario.'
                    });
                } else {
                    if (rs.rowCount === 0) {
                        reject({
                            message: 'El usuario no existe en base de datos.'
                        });
                    }
                    resolve({
                        message: 'Consulta exitosa',
                        data: rs.rows[0]
                    });
                }
            });
    });
}

const savePersonAndUser = user => {
    return new Promise((resolve, reject) => {
        
    const values = [user.identification, user.firstname, user.lastname, user.phone, user.email, user.username, user.password];
        
        dbConnection.query(`CALL createUser($1, $2, $3, $4, $5, $6, $7)`, values, 
        (err, _rs) => {
            if (err) {
                console.log(err);
                reject({
                    hasError: true,
                    message: err.detail
                });
            } else {
                resolve({
                    hasError: false,
                    user
                });
            }
        });

    });
}

const validateUsername = username => {
    return new Promise((resolve, _reject) => {
        dbConnection.query(`SELECT COUNT(1) FROM "user" u WHERE u.username = $1 `, [username], 
        (_err, rs) => {
            resolve(parseInt(rs.rows[0].count) === 0);
        });
    });
}

const validateEmail = email => {
    return new Promise((resolve, _reject) => {
        dbConnection.query(`SELECT COUNT(1) FROM person p WHERE p.email = $1 `, [email], 
        (_err, rs) => {
            resolve(parseInt(rs.rows[0].count) === 0);
        });
    })
}

const checkEmailStatus = idUser => {
    return new Promise((resolve, _reject) => {
        dbConnection.query(`SELECT COUNT(*) FROM person p, "user" u  
                            WHERE u.id_person = p.id_person 
                            AND   u.id_user = $1
                            AND   p.email_status = 'A' `, [idUser], 
        (_err, rs) => {
            resolve(parseInt(rs.rows[0].count) === 0);
        });
    })
}

const verifyEmailByToken = token => {
    return new Promise((resolve, reject) => {
        dbConnection.query(`CALL verifyEmail($1)`, [token], 
        (err, _rs) => {
            if (err) {
                reject({
                    message: err.detail
                });
            }
            resolve({
                message: "Email verificado exitosamente."
            });
        });
    })
}

const getUserInfoByEmail = email => {
    return new Promise((resolve, reject) => {
        dbConnection.query(`SELECT p.email, p.id_person, u.id_user, u.username
                            FROM person p, "user" u
                            WHERE p.id_person = u.id_person
                            AND p.email = $1 `, [email], 
        (err, rs) => {
            if (err) {
                reject({
                    message: err.detail
                });
            } else if (parseInt(rs.rowCount) === 0) {
                reject({
                    message: 'El email no esta registrado.'
                });
            }
            resolve({
                data: rs.rows[0]
            });
        });
    })
}

const updateUserPassword = (password, token) => {
    return new Promise((resolve, reject) => {
        dbConnection.query(` CALL updatePassword($1, $2) `, [token, password], 
        (err, _rs) => {
            if (err) {
                reject({
                    message: err.detail
                });
            }
            resolve({
                message: 'Contraseña actualizada exitosamente.'
            });
        });
    })
}

module.exports = { 
    findUserByUsername,
    savePersonAndUser,
    validateEmail,
    validateUsername,
    verifyEmailByToken,
    checkEmailStatus,
    getUserInfoByEmail,
    updateUserPassword
};