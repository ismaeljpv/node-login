class User {

    constructor (idPerson, idUser, firstname, lastname, identification, email, phone, user, authorities) {
        this.idPerson = idPerson;
        this.idUser = idUser; 
        this.firstname = firstname;
        this.lastname = lastname;
        this.identification = identification;
        this.email = email;
        this.phone = phone;
        this.user = user;
        this.authorities = authorities;
    }
}

module.exports = User;