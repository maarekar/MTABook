const fs = require("fs").promises;
const StatusCodes = require('http-status-codes').StatusCodes;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const correct_status = "actived";

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


async function exists( path )
{
    try {
        const stat = await fs.stat( path )
        return true;
    }
    catch( e )
    {
        return false;
    }    
}


async function read_users()
{
	if ( !( await exists(  users_file )))
    {
        console.log( `Unable to access ${users_file}`)
        return;
    }

    const users_data = await fs.readFile(users_file);
	const user_arr = JSON.parse(users_data);

	for(var i in user_arr){
		g_users.push(user_arr[i]);
	}
}

read_users().then(
    () => {console.log( 'Done reading users')}
).catch( reason => console.log('Failure:' + reason) )


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
		res.status(StatusCodes.FORBIDDEN); // Forbidden
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
		const newUser = new User(name, new_id, email, hash, new Date(), "created");
		g_users.push(newUser);

		write_file(g_users);
	});

	res.send(JSON.stringify(g_users));
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
		//console.log(req.token);
		//console.log(g_tokens[req.token]); // <<------------------------------------- when we approve the second user in a session this value is undefined
		if (err) {
			res.status(StatusCodes.FORBIDDEN); // Forbidden
			res.send("No access")
			return;
		}
		else {
			if (g_tokens[req.token]) {
				req.body.user = result.current_user;
				// if (g_users[req.body.user.id - 1].status != correct_status) {
				// 	res.status(StatusCodes.FORBIDDEN); // Forbidden
				// 	res.send("No access")
				// 	return;
				// }
				next();
			}
			else {
				console.log(g_tokens);
				res.send(JSON.stringify("No access (BUG ! - maybe the token get refresh so he come to here))"));
			}

		}
	});
}

async function write_file(users)
{
	await fs.writeFile(users_file, JSON.stringify(users), function(err) {
		if (err) throw err;
		console.log('complete');
	});	
}


module.exports = { g_users, g_tokens, g_id_to_tokens, write_file, verifyToken, check_validation_token, log_in, log_out, register };