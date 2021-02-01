const dbConnection = require('../config/databaseConfig');

const createSecurityToken = (idUser, token) => {
    return new Promise((resolve, reject) => {
        const values = [idUser, token]
        dbConnection.query(`INSERT INTO security_token(id_user, token, token_status, "isSended") 
                            VALUES($1, $2, 'A', false)`, values, 
        (err, _rs) => {
            if (err) {
                reject({
                    message: 'Error al crear token de seguridad.'
                });
            } else {
                resolve({
                    token,
                    message: 'Token de seguridad creado exitosamente.'
                });
            }
        });
    });
}

const updateTokenStatus = (idUser, token) => {
    return new Promise((resolve, reject) => {
        const values = [idUser, token]
        dbConnection.query(`UPDATE security_token SET "isSended" = true WHERE id_user = $1 AND token = $2`, values, 
        (err, _rs) => {
            if (err) {
                reject({
                    message: `Error al actualizar estado del token de seguridad para usuario con ID ${idUser}.`
                });
            } else {
                resolve({
                    message: `Estado del token de seguridad actualizado exitosamente para el usuario con ID ${idUser}.`
                });
            }
        });
    });
}


const getActiveTokenByUser = (idUser) => {
    return new Promise((resolve, reject) => {
        dbConnection.query(`SELECT token FROM security_token 
                            WHERE id_user = $1
                            AND token_status = 'A' `, [idUser], 
        (err, rs) => {
            if (err) {
                console.log(err);
                reject({
                    message: `Error al obtener token de seguridad del usuario con ID ${idUser}.`
                });
            } else {
                if (parseInt(rs.rowCount) === 0) {
                    resolve({
                        hasToken : false
                    });
                } else {
                    resolve({
                        hasToken: true,
                        token: rs.rows[0].token
                    })
                }
            }
        });
    });
}

module.exports = {
    createSecurityToken,
    updateTokenStatus,
    getActiveTokenByUser
};