// External modules
const express = require('express')
const package = require('./package.json');
const post = require('./src/post.js');
const message = require('./src/message.js');
const admin = require('./src/admin.js');
const user = require('./src/user.js');
const fs = require('./src/database.js');

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

// Routing
const router = express.Router();

router.get('/users', user.verifyToken, user.check_validation_token, (req, res) => { user.list_users(req, res) })
router.post('/login', (req, res) => { user.log_in(req, res) })
router.delete('/logout', user.verifyToken, user.check_validation_token, (req, res) => { user.log_out(req, res) })
router.post('/register', (req, res) => { user.register(req, res) })
router.delete('/delete_user', user.verifyToken, user.check_validation_token, (req, res) => { admin.delete_user(req, res) })
router.delete('/delete_user_by_admin', user.verifyToken, user.check_validation_token, admin.check_admin, (req, res) => { admin.delete_user_by_admin(req, res) })
router.put('/approve/:id', user.verifyToken, user.check_validation_token, admin.check_admin, admin.check_id, (req, res) => { admin.approve_user(req, res) })
router.put('/suspend/:id', user.verifyToken, user.check_validation_token, admin.check_admin, admin.check_id, (req, res) => { admin.suspend_user(req, res) })
router.put('/restore/:id', user.verifyToken, user.check_validation_token, admin.check_admin, admin.check_id, (req, res) => { admin.restore_user(req, res) })
router.post('/publish', user.verifyToken, user.check_validation_token, (req, res) => { post.publish_post(req, res) })
router.delete('/delete_post', user.verifyToken, user.check_validation_token, (req, res) => { post.delete_post(req, res) })
router.get('/get_posts', user.verifyToken, user.check_validation_token, (req, res) => { post.get_posts(req, res) })
router.get('/get_messages', user.verifyToken, user.check_validation_token, (req, res) => { message.get_messages(req, res) })
router.post('/send_message', user.verifyToken, user.check_validation_token, (req, res) => { message.send_message(req, res) })

app.use('/api', router)


// Init 

let msg = `${package.description} listening at port ${port}`
app.listen(port, () => { console.log(msg); })



