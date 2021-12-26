const StatusCodes = require('http-status-codes').StatusCodes;
const user = require('./user.js');
const g_messages = [];

function Message(message, id, date, from, to) {
	this.message = message;
	this.id = id;
	this.date = date;
	this.from = from;
	this.to = to;
}

function send_message(req, res) {
	const text = req.body.text;
	const friend_id = req.body.friend_id;
	const user_status = req.body.user.status;

	if(user_status === "actived"){
		if (!text) {
			res.status(StatusCodes.BAD_REQUEST);
			res.send("Missing text in request")
			return;
		}
	
		if (friend_id <= 0) {
			res.status(StatusCodes.BAD_REQUEST);
			res.send("Bad id given")
			return;
		}
	
		const current_user = user.g_users.find(user => user.id == friend_id)
		if (!current_user) {
			res.status(StatusCodes.NOT_FOUND);
			res.send("No such friend")
			return;
		}
	
		// Find max id 
		let max_id = 0;
		g_messages.forEach(
			item => { max_id = Math.max(max_id, item.id) }
		)
	
		const new_id = max_id + 1;
	
		const new_message = new Message(text, new_id, new Date(), req.body.user.id, friend_id);
		g_messages.push(new_message);
	
	
		res.send(JSON.stringify(new_message));
	}
	else{
		res.status(StatusCodes.FORBIDDEN); // Forbidden
		res.send("No access, reason is one of the following: \n 1.Register \n 2.Wait for activation \n 3.Refresh the token by Logout and Login again please");
		return;
	}
}

function get_messages(req, res)
{
	const user_status = req.body.user.status;
	if(user_status === "actived"){
		const messages = g_messages.filter(message => message.to == req.body.user.id);
		res.send(JSON.stringify(messages));
	}
	else{
		res.status(StatusCodes.FORBIDDEN); // Forbidden
		res.send("No access, reason is one of the following: \n 1.Register \n 2.Wait for activation \n 3.Refresh the token by Logout and Login again please");
		return;
	}
}

module.exports = {send_message, get_messages};