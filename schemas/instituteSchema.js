var mongoose = require('mongoose');
var redis = require('../middlewares/redis');

var instituteSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    valid: { type: Boolean }
}, { collection: 'coachingInstitutes' });

instituteSchema.statics.SearchInstitutes = function (instituteDetails, callback) {

    const redisKey = 'instituteDetails';

    redis.get(redisKey, function (err, institutes) {
        if (err) {
            return callback(err, null);
        }
        else if (institutes) {
            return callback(null, institutes);
        }
    });

    if (instituteDetails.city === "Select") {

        this.model('CoachingInstitute').find({ name: instituteDetails.tag }, function (err, institute) {

            if (err) {

                console.log(err);
                return callback(err, null);
            }
            redis.setex(redisKey, 60, JSON.stringify(institute), function (err, reply) {
                if (err) {
                    console.log(err);
                }
                console.log(reply);
            });
            return callback(null, institute);
        });
    }
    else if (instituteDetails.location === "SelectLocation") {

        this.model('CoachingInstitute').find({ name: instituteDetails.tag }, function (err, institute) {
            if (err) {
                console.log(err);
                return callback(err, null);
            }
            var i;
            var result = [];

            for (i in institute.branches) {
                if (institute.branches[i].city === instituteDetails.city) {
                    result.push(institute.branches[i]);
                }
            }
            redis.setex(redisKey, 60, JSON.stringify(result), function (err, reply) {
                if (err) {
                    console.log(err);
                }
                console.log(reply);
            });
            return callback(null, result);
        });
    }
    else {

        this.model('CoachingInstitute').findOne({ name: instituteDetails.tag }, function (err, institute) {
            if (err) {
                console.log(err);
                return callback(err, null);
            }
            else if (!institute) {

                return callback(null, null);
            }
            var i;
            for (i in institute.branches) {
                if (institute.branches[i].city === instituteDetails.city && institute.branches[i].location === instituteDetails.location) {
                    break;
                }
            }
            redis.setex(redisKey, 60, JSON.stringify(institute), function (err, reply) {
                if (err) {
                    console.log(err);
                }
                console.log(reply);
            });
            return callback(null, institute);
        });
    }
}

module.exports = mongoose.model('CoachingInstitute', instituteSchema);