class Exception {

    constructor (message, error, statusCode) {
        this.message = message;
        this.error = error;
        this.statusCode = statusCode;
    }

}

module.exports = Exception;