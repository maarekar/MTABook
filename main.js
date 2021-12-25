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



