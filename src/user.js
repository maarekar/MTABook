const StatusCodes = require('http-status-codes').StatusCodes;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const correct_status = "actived";
const db = require('./database.js');

function User(name, id, email, password, date, status) {
	this.name = name;
	this.id = id;
	this.email = email;
	this.password = password;
	this.date = date;
	this.status = status;
}

const g_users = [];
const g_tokens = [];
const g_id_to_tokens = [];
const users_file = './files/users.json';

db.read_data(g_users, users_file).then(
	() => { console.log('Done reading users') }
).catch(reason => console.log('Failure:' + reason))

function list_users(req, res) {
	res.send(JSON.stringify(g_users));
}

function log_in(req, res) {
	const email = req.body.email;
	const password = req.body.password;
	const current_user = g_users.find(user => user.email == email);

	if (!current_user) {
		res.status(StatusCodes.BAD_REQUEST);
		res.send("Didn't find user");
		return;
	}

	if (current_user.status != correct_status) {
		let message;
		if (current_user.status == "suspended") {
			message = "You are suspended for violating terms, please contact the developers";
		}
		else {
			message = "No access";
		}
		res.status(StatusCodes.UNAUTHORIZED); 
		res.send(message)
		return;
	}

	bcrypt.compare(password, current_user.password, function (err, result) {
		if (result) {
			//get a token and send it instead of sending current user
			const token = jwt.sign({ current_user }, 'my_secret_key', { expiresIn: 60 * 10 });
			g_tokens[token] = true;
			g_id_to_tokens[current_user.id] = token;
			res.send(JSON.stringify({ "token": token }));
		}
		else {
			res.status(StatusCodes.BAD_REQUEST);
			res.send("Wrong password");
			return;
		}
	});
}

function log_out(req, res) {
	const user_email = req.body.user.email;
	g_tokens[req.token] = false;
	if (g_users.find(user => user.email === user_email)) {
		res.send(JSON.stringify("Log out succesfuly !"));
	}
	else {
		res.send(JSON.stringify("User not logged in, cant logout"));
	}
}

function register(req, res) {
	const name = req.body.name;
	const email = req.body.email;
	const password = req.body.password;

	if (!name) {
		res.status(StatusCodes.BAD_REQUEST);
		res.send("Missing name in request")
		return;
	}

	if (g_users.find(user => user.email === email)) {
		res.status(StatusCodes.BAD_REQUEST);
		res.send("Email already exists")
		return;
	}

	// Find max id 
	let max_id = 0;
	g_users.forEach(
		item => { max_id = Math.max(max_id, item.id) }
	)

	const new_id = max_id + 1;
	bcrypt.hash(password, saltRounds, function (err, hash) {
		const new_user = new User(name, new_id, email, hash, new Date(), "created");
		g_users.push(new_user);

		db.write_file(g_users, users_file);
		res.send(JSON.stringify(new_user));
	});


}

function verifyToken(req, res, next) {
	// Get auth header value
	const bearerHeader = req.headers['authorization'];
	// Check if bearer is undefined
	if (typeof bearerHeader !== 'undefined') {
		// Split at the space
		const bearer = bearerHeader.split(' ');
		// Get token from array
		const bearerToken = bearer[1];
		// Set the token
		req.token = bearerToken;
		// Next middleware
		next();
	} else {
		// Forbidden
		res.sendStatus(403);
	}

}

function check_validation_token(req, res, next) {
	jwt.verify(req.token, 'my_secret_key', function (err, result) {
		if (err) {
			res.status(StatusCodes.FORBIDDEN); // Forbidden
			res.send("No access")
			return;
		}
		else {
			if (g_tokens[req.token]) {
				req.body.user = result.current_user;
				next();
			}
			else {
				res.status(StatusCodes.FORBIDDEN); // Forbidden
				res.send("No access, reason is one of the following: \n 1.Register \n 2.Wait for activation \n 3.Refresh the token by Logout and Login again please");
				return;
			}

		}
	});
}

// function check_activate_authorization(req, res, next) { 
// 	const user_status = req.body.user.status;
// 	if (user_status === "actived") {
// 		next();
// 	}
// 	else {
// 		res.status(StatusCodes.UNAUTHORIZED); 
// 		res.send("No access, reason is one of the following: \n 1.Register \n 2.Wait for activation \n 3.Refresh the token by Logout and Login again please");
// 		return;
// 	}
// }




module.exports = {users_file, g_users, g_tokens, g_id_to_tokens, list_users, verifyToken, check_validation_token, log_in, log_out, register };