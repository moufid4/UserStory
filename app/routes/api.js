var User = require('../modules/user');
var config = require('../../config');

var secretKey = config.secretKey;

var jsonwebtoken = require('jsonwebtoken');

function createToken(user) {
	var token = jsonwebtoken.sign({
		_id: user._id,
		name: user.name,
		username: user.username
	}, secretKey, {
		expirtesInMinute: 1440
	})
	return token;
}

module.exports = function(app, express) {
	var api = express.Router();

// api for signup
	api.post('/signup', function(req, res) {
		var user = new User({
			name: req.body.name,
			username: req.body.username,
			password: req.body.password
		});
		
		user.save(function(err) {
			if(err) {
				res.send(err);
				return;
			}
			res.json({ message: 'User has been created!'});
		});

	});
// api to get all the users from the database

	api.get('/users', function(req, res){
		User.find({}, function(err, users) {
			if(err) {
				res.send(err);
				return;
			}

			res.json(users);
		})
	
	});

	api.post('/login', function(req, res) {
		User.findOne({ 
			username: req.body.username
		}).select('password').exec(function(err, user) {
			if(err) throw err;
			if(!user){
				res.send({message: "User doesnt exist"});
			} else if(user) {
				var validPassword = user.comparePassword(req.body.password);
				if(!validPassword) {
					res.send({ message: "Invalid Password"});
				} else {
					// success -> token
					var token = createToken(user);
					res.json({
						success: true,
						message: "Successfuly logged in",
						token: token
					});
				}
			}
		});
	});

	return api;
}

