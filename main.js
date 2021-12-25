// External modules
const express = require('express')
const StatusCodes = require('http-status-codes').StatusCodes;
const package = require('./package.json');
const post = require('./post.js');
const message = require('./message.js');
const user = require('./user.js');


const app = express()
let port = 2718;


// General app settings
const set_content_type = function (req, res, next) {
	res.setHeader("Content-Type", "application/json; charset=utf-8");
	next()
}

app.use(set_content_type);
app.use(express.json());  // to support JSON-encoded bodies
app.use(express.urlencoded( // to support URL-encoded bodies
	{
		extended: true
	}));

//-----------------------------Classes-----------------------------//
// function User(name, id, email, password, date, status) {
// 	this.name = name;
// 	this.id = id;
// 	this.email = email;
// 	this.password = password;
// 	this.date = date;
// 	this.status = status;
// }

// function Message(message, id, date, from, to) {
// 	this.message = message;
// 	this.id = id;
// 	this.date = date;
// 	this.from = from;
// 	this.to = to;
// }

// function Post(message, id, date, user_id) {
// 	this.message = message;
// 	this.id = id;
// 	this.date = date;
// 	this.user_id = user_id;
// 	this.status = 'published';
// }

// Tabl
// const g_users = [new User("Root", 1, "admin@admin.com", "admin", new Date(), "actived")];
// const g_messages = [];
// const g_posts = [];
// const g_status = ["created", "actived", "suspended", "deleted"];
// const g_tokens = [];

// API functions

// function list_users(req, res) {
// 	// console.log(g_users)
// 	res.send(JSON.stringify(g_users));
// }

function get_user(req, res) {
	const id = parseInt(req.params.id);

	if (id <= 0) {
		res.status(StatusCodes.BAD_REQUEST);
		res.send("Bad id given")
		return;
	}

	const user = g_users.find(user => user.id == id)
	if (!user) {
		res.status(StatusCodes.NOT_FOUND);
		res.send("No such user")
		return;
	}

	res.send(JSON.stringify(user));
}

function delete_user(req, res) {
	const id = parseInt(req.params.id);

	if (id <= 0) {
		res.status(StatusCodes.BAD_REQUEST);
		res.send("Bad id given")
		return;
	}

	if (id == 1) {
		res.status(StatusCodes.FORBIDDEN); // Forbidden
		res.send("Can't delete root user")
		return;
	}

	const idx = g_users.findIndex(user => user.id == id)
	if (idx < 0) {
		res.status(StatusCodes.NOT_FOUND);
		res.send("No such user")
		return;
	}

	g_users.splice(idx, 1)
	res.send(JSON.stringify({}));
}

// function log_in(req, res) {
// 	const email = req.body.email;
// 	const password = req.body.password;

// 	const current_user = g_users.find(user => user.email == email);

// 	if (current_user) {
// 		bcrypt.compare(password, current_user.password, function (err, result) {
// 			if (result) {
// 				//get a token and send it instead of sending current user
// 				const token = jwt.sign({ current_user }, 'my_secret_key', { expiresIn: 60 * 10 });
// 				g_tokens[token] = true;
// 				res.send(JSON.stringify({ "token": token }));
// 			}
// 			else {
// 				// really bad request?
// 				res.status(StatusCodes.BAD_REQUEST);
// 				res.send("Wrong password");
// 				return;
// 			}
// 		});
// 	}
// 	else {
// 		// really bad request?
// 		res.status(StatusCodes.BAD_REQUEST);
// 		res.send("Didnt find user");
// 		return;
// 	}

// }

// function log_out(req, res) {

// 	jwt.verify(req.token, 'my_secret_key', function (err, result) {
// 		if (err) {
// 			res.status(StatusCodes.FORBIDDEN); // Forbidden
// 			res.send("No access")
// 			return;
// 		}
// 		else {
// 			// const current_user = result.current_user;
// 			// console.log(current_user);
// 			// res.cookie('jwt', '', { maxAge : 1});
// 			// const token = jwt.sign({current_user}, 'my_secret_key', {expiresIn: 1});
// 			g_tokens[req.token] = false;
// 			res.send(JSON.stringify("Log out succesfuly !"));
// 		}
// 	});
// }

// function register(req, res) {
// 	const name = req.body.name;
// 	const email = req.body.email;
// 	const password = req.body.password;

// 	if (!name) {
// 		res.status(StatusCodes.BAD_REQUEST);
// 		res.send("Missing name in request")
// 		return;
// 	}

// 	if (g_users.find(user => user.email === email)) {
// 		res.status(StatusCodes.BAD_REQUEST);
// 		res.send("Email already exists")
// 		return;
// 	}

// 	// Find max id 
// 	let max_id = 0;
// 	g_users.forEach(
// 		item => { max_id = Math.max(max_id, item.id) }
// 	)

// 	const new_id = max_id + 1;
// 	bcrypt.hash(password, saltRounds, function (err, hash) {
// 		const newUser = new User(name, new_id, email, hash, new Date(), "created");
// 		g_users.push(newUser);
// 	});

// 	res.send(JSON.stringify(g_users));
// }

function approve_user(req, res) {
	const id = parseInt(req.params.id);

	if (id <= 0) {
		res.status(StatusCodes.BAD_REQUEST);
		res.send("Bad id given")
		return;
	}

	if (id == 1) {
		res.status(StatusCodes.FORBIDDEN); // Forbidden
		res.send("Can't approve root user")
		return;
	}

	const idx = g_users.findIndex(user => user.id == id)
	if (idx < 0) {
		res.status(StatusCodes.NOT_FOUND);
		res.send("No such user")
		return;
	}

	if (g_users[idx].status === "created") {
		g_users[idx].status = "actived";
	}
	else {
		res.status(StatusCodes.BAD_REQUEST);
		res.send("Bad id given")
		return;
	}
	res.send(JSON.stringify({}));
}

function suspend_user(req, res) {
	const id = parseInt(req.params.id);

	if (id <= 0) {
		res.status(StatusCodes.BAD_REQUEST);
		res.send("Bad id given")
		return;
	}

	if (id == 1) {
		res.status(StatusCodes.FORBIDDEN); // Forbidden
		res.send("Can't suspend root user")
		return;
	}

	const idx = g_users.findIndex(user => user.id == id)
	if (idx < 0) {
		res.status(StatusCodes.NOT_FOUND);
		res.send("No such user")
		return;
	}
	if (g_users[idx].status === "actived") {
		g_users[idx].status = "suspended";
	}
	else {
		res.status(StatusCodes.BAD_REQUEST);
		res.send("Bad id given")
		return;
	}

	res.send(JSON.stringify({}));
}

function restore_user(req, res) {
	const id = parseInt(req.params.id);

	if (id <= 0) {
		res.status(StatusCodes.BAD_REQUEST);
		res.send("Bad id given")
		return;
	}

	if (id == 1) {
		res.status(StatusCodes.FORBIDDEN); // Forbidden
		res.send("Can't delete root user")
		return;
	}

	const idx = g_users.findIndex(user => user.id == id)
	if (idx < 0) {
		res.status(StatusCodes.NOT_FOUND);
		res.send("No such user")
		return;
	}

	g_users[idx].status = "restored";
	res.send(JSON.stringify({}));
}

// function send_message(req, res) {
// 	const text = req.body.text;
// 	const friend_id = req.body.friend_id;

// 	if (!text) {
// 		res.status(StatusCodes.BAD_REQUEST);
// 		res.send("Missing text in request")
// 		return;
// 	}

// 	if (friend_id <= 0) {
// 		res.status(StatusCodes.BAD_REQUEST);
// 		res.send("Bad id given")
// 		return;
// 	}

// 	const user = g_users.find(user => user.id == friend_id)
// 	if (!user) {
// 		res.status(StatusCodes.NOT_FOUND);
// 		res.send("No such friend")
// 		return;
// 	}

// 	// Find max id 
// 	let max_id = 0;
// 	g_messages.forEach(
// 		item => { max_id = Math.max(max_id, item.id) }
// 	)

// 	const new_id = max_id + 1;

// 	const new_message = new Message(text, new_id, new Date(), req.body.user.id, friend_id);
// 	g_messages.push(new_message);


// 	res.send(JSON.stringify(new_message));
// }

// function get_messages(req, res)
// {
// 	const messages = g_messages.filter(message => message.to == req.body.user.id);
// 	res.send(JSON.stringify(messages));
// }

// function publish_post(req, res) {
// 	const text = req.body.text;

// 	if (!text) {
// 		res.status(StatusCodes.BAD_REQUEST);
// 		res.send("Missing text in request")
// 		return;
// 	}

// 	// Find max id 
// 	let max_id = 0;
// 	g_posts.forEach(
// 		item => { max_id = Math.max(max_id, item.id) }
// 	)

// 	const new_id = max_id + 1;

// 	const new_post = new Post(text, new_id, new Date(), req.body.user.id);
// 	g_posts.push(new_post);


// 	res.send(JSON.stringify(new_post));

// }

// function get_posts(req, res) {
// 	const posts = g_posts.filter(post => post.status == "published");
// 	res.send(JSON.stringify(posts));
// }

// function delete_post(req, res) {
// 	let writer;

// 	for (let i = 0; i < g_posts.length; i++) {
// 		if (g_posts[i].id == req.body.post) {
// 			writer = g_posts[i].user_id;
// 		}
// 	}

// 	if (req.body.user.id != writer) {
// 		res.status(StatusCodes.FORBIDDEN); // Forbidden
// 		res.send("No access")
// 		return;
// 	}
// 	else {
// 		for (let i = 0; i < g_posts.length; i++) {
// 			if (g_posts[i].id == req.body.post) {
// 				g_posts[i].status = "deleted";
// 			}
// 		}
// 		res.send(JSON.stringify("You delete the post successfuly !"));
// 	}

// }

// Verify Token
// function verifyToken(req, res, next) {
// 	// Get auth header value
// 	const bearerHeader = req.headers['authorization'];
// 	// Check if bearer is undefined
// 	if (typeof bearerHeader !== 'undefined') {
// 		// Split at the space
// 		const bearer = bearerHeader.split(' ');
// 		// Get token from array
// 		const bearerToken = bearer[1];
// 		// Set the token
// 		req.token = bearerToken;
// 		// Next middleware
// 		next();
// 	} else {
// 		// Forbidden
// 		res.sendStatus(403);
// 	}

// }

// function check_validation_token(req, res, next) {
// 	jwt.verify(req.token, 'my_secret_key', function (err, result) {
// 		if (err) {
// 			res.status(StatusCodes.FORBIDDEN); // Forbidden
// 			res.send("No access")
// 			return;
// 		}
// 		else {
// 			if (g_tokens[req.token]) {
// 				req.body.user = result.current_user;
// 				next();
// 			}
// 			else {
// 				res.send(JSON.stringify("You have to log in !"));
// 			}

// 		}
// 	});
// }


// Routing
const router = express.Router();

router.get('/users', (req, res) => { user.list_users(req, res) })

router.post('/login', (req, res) => { user.log_in(req, res) })
router.delete('/logout', user.verifyToken, (req, res) => { user.log_out(req, res) })
router.post('/register', async (req, res) => { user.register(req, res) })
router.post('/approve', (req, res) => { approve_user(req, res) })
router.put('/suspend', (req, res) => { suspend_user(req, res) })
router.post('/publish', user.verifyToken, user.check_validation_token, (req, res) => { post.publish_post(req, res) })
router.delete('/delete_post', user.verifyToken, user.check_validation_token, (req, res) => { post.delete_post(req, res) })
router.get('/get_posts', user.verifyToken, user.check_validation_token, (req, res) => { post.get_posts(req, res) })
router.get('/get_messages', user.verifyToken, user.check_validation_token, (req, res) => { message.get_messages(req, res) })
router.post('/send_message', user.verifyToken, user.check_validation_token, (req, res) => { message.send_message(req, res) })

app.use('/api', router)


// Init 

let msg = `${package.description} listening at port ${port}`
app.listen(port, () => { console.log(msg); })



