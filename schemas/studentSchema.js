var mongoose = require('mongoose');
var enums = require('../enums');
var bcrypt = require('bcrypt');
var redis = require('../middlewares/redis');
const saltRounds = 10;

var studentSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
});

/* --------------------------------------------------------- */

studentSchema.statics.SignUp = async function (student, callback) {

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

            if (data) {

                redis.saveStudentInCache(data.email, data, function (isCached) {

                    if (isCached) {
                        console.log('student details cached');
                    }
                });

                return callback(enums.LoginAndSignUpStatus.Registered);
            }
        });
    });
}

studentSchema.methods.Login = function (callback) {

    var studentPassword = this.password;
    var studentEmail = this.email;
    var studentModel = this.model('Student');

    redis.lookUpStudentInCache(studentEmail, function (studentFromCache) {

        if (studentFromCache) {

            console.log('student found in cache for login');
            return CheckPassword(studentPassword, studentFromCache.password, callback);
        }

        studentModel.findOne({ email: studentEmail }, function (err, studentFromDb) {

            if (err) {

                return callback(enums.LoginAndSignUpStatus.Error);
            }

            if (studentFromDb == null) {

                return callback(enums.LoginAndSignUpStatus.DoesNotExist);
            }

            return CheckPassword(studentPassword, studentFromDb.password, callback);
        });
    });
}

async function GetStudent(student) {

    let studentData;

    var isCacheHit = false;

    redis.lookUpStudentInCache(student.email, function (studentFromCache) {
        if (studentFromCache) {

            isCacheHit = studentFromCache != null;
            studentData = studentFromCache;
        }
    });

    if (isCacheHit) {

        return { error: null, student: studentData };
    }

    await mongoose.connection.model('Student').findOne({ email: student.email }, function (err, studentFromDb) {

        if (err) {

            console.log(err);
            return { error: err, student: null };
        }

        if (studentFromDb) {

            redis.saveStudentInCache(student.email, studentFromDb, function (isSuccessful) {

                if (!isSuccessful) {

                    return { error: 'There was some error in saving to redis cache!', student: null };
                }
            });
        }
        studentData = studentFromDb;
    });

    return { error: null, student: studentData };
}

function CheckPassword(inputPassword, actualPassword, callback) {

    bcrypt.compare(inputPassword, actualPassword, function (err, isPasswordCorrect) {

        if (err) {

            console.log(err);
            return callback(enums.LoginAndSignUpStatus.Error);
        }

        if (!isPasswordCorrect) {

            return callback(enums.LoginAndSignUpStatus.Unauthorized);
        }

        return callback(enums.LoginAndSignUpStatus.Authorized);
    });
}

module.exports = mongoose.model('Student', studentSchema);