var mongoose = require('mongoose');
var enums = require('../enums');
const bcrypt = require('bcrypt');
const saltRounds = 10;

var studentSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
});

/* --------------------------------------------------------- */

studentSchema.statics.SignUp = async (student, callback) => {

    var dbData = await GetStudent(student);

    if (dbData.error != null) {

        return callback(enums.LoginAndSignUpStatus.Error);
    }

    else if (dbData.student != null) {

        return callback(enums.LoginAndSignUpStatus.AlreadyExists);
    }

    bcrypt.hash(student.password, saltRounds, function (err, passwordHash) {

        if (err) {

            console.log(err);
            return callback(enums.LoginAndSignUpStatus.Error);
        }

        student.password = passwordHash;

        mongoose.connection.model('Student').create(student, function (err, data) {
            if (err) {

                console.log(err);
                return callback(enums.LoginAndSignUpStatus.Error);
            }

            return callback(enums.LoginAndSignUpStatus.Registered);
        });
    });
}

studentSchema.statics.Login = async (student, callback) => {

    var dbData = await GetStudent(student);

    if (dbData.error != null) {

        return callback(enums.LoginAndSignUpStatus.Error);
    }

    if (dbData.student == null) {

        return callback(enums.LoginAndSignUpStatus.DoesNotExist);
    }

    bcrypt.compare(student.password, dbData.student.password, function (err, isPasswordCorrect) {

        if (err) {

            console.log(err);
            return callback(enums.LoginAndSignUpStatus.Error);
        }

        if (!isPasswordCorrect) {

            return callback(enums.LoginAndSignUpStatus.Unauthorized);
        }

        callback(enums.LoginAndSignUpStatus.Authorized);
    });
}

async function GetStudent(student) {

    let studentData;
    await mongoose.connection.model('Student').findOne({ email: student.email }, function (err, studentFromDb) {

        if (err) {

            console.log(err);
            return { error: err, student: null };
        }

        studentData = studentFromDb;
    });
    console.log(studentData);
    return { error: null, student: studentData };
}

module.exports = studentSchema;