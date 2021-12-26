const StatusCodes = require('http-status-codes').StatusCodes;
const users = require('./user.js');

function list_users(req, res) {
	const check_admin_id = req.body.user.id;

	if(check_admin_id == 1){
		res.send(JSON.stringify(users.g_users));
	}
	else{
		res.status(StatusCodes.FORBIDDEN);
		res.send("You are not admin");
		return;
	}
	
}

function delete_user_by_admin(req, res) {
	const id = req.body.id;
	const is_admin = req.body.user.id;

	if (is_admin === 1) {
		if (id <= 0) {
			res.status(StatusCodes.BAD_REQUEST);
			res.send("Bad id given");
			return;
		}

		if (id == 1) {
			res.status(StatusCodes.FORBIDDEN);
			res.send("Can't delete root user");
			return;
		}

		const idx = users.g_users.findIndex(user => user.id == id);
		if (idx < 0) {
			res.status(StatusCodes.NOT_FOUND);
			res.send("No such user");
			return;
		}

		
		const curr_user = users.g_users[idx];
		users.g_users.splice(idx, 1);
		users.g_tokens[users.g_id_to_tokens[curr_user.id]] = false;
		res.send("The following user has deleted: " + JSON.stringify({ curr_user }));
	}
	else {
		res.status(StatusCodes.FORBIDDEN);
		res.send("You are not admin");
		return;
	}
}

function delete_user(req, res) {
	const self_delete_id = req.body.user.id;

	if (self_delete_id !== 1) {
		const idx = users.g_users.findIndex(user => user.id == self_delete_id);
		if (idx < 0) {
			res.status(StatusCodes.NOT_FOUND);
			res.send("No such user");
			return;
		}

		users.g_tokens[req.token] = false;
		const curr_user = users.g_users[idx];
		users.g_users.splice(idx, 1);
		res.send("The following user has deleted: " + JSON.stringify({ curr_user }));
	}
	else {
		res.status(StatusCodes.FORBIDDEN);
		res.send("Can't delete root user");
		return;
	}
}

function approve_user(req, res) {
	const id = parseInt(req.params.id);
	const check_admin_id = req.body.user.id;

	const curr_status = "created";
	const new_status = "actived";
	const message = "Status is not 'created', can't active";

	if (check_admin_id != 1) {
		res.status(StatusCodes.FORBIDDEN);
		res.send("You are not admin");
		return;
	}

	if (id <= 0) {
		res.status(StatusCodes.BAD_REQUEST);
		res.send("Bad id given");
		return;
	}

	if (id == 1) {
		res.status(StatusCodes.FORBIDDEN);
		res.send("Can't approve root user");
		return;
	}

	const idx = users.g_users.findIndex(user => user.id == id);
	if (idx < 0) {
		res.status(StatusCodes.NOT_FOUND);
		res.send("No such user")
		return;
	}

	if (users.g_users[idx].status === curr_status) {
		users.g_users[idx].status = new_status;
	}
	else {
		res.status(StatusCodes.BAD_REQUEST);
		res.send(message);
		return;
	}

	const curr_user = users.g_users[idx];
	res.send("The following user has approved: " + JSON.stringify({ curr_user }));

}

function suspend_user(req, res) {
	const id = parseInt(req.params.id);
	const check_admin_id = req.body.user.id;

	const curr_status = "actived";
	const new_status = "suspended";
	const message = "Status is not 'actived', can't suspend";

	if (check_admin_id != 1) {
		res.status(StatusCodes.FORBIDDEN);
		res.send("You are not admin");
		return;
	}

	if (id <= 0) {
		res.status(StatusCodes.BAD_REQUEST);
		res.send("Bad id given");
		return;
	}

	if (id == 1) {
		res.status(StatusCodes.FORBIDDEN);
		res.send("Can't approve root user");
		return;
	}

	const idx = users.g_users.findIndex(user => user.id == id);
	if (idx < 0) {
		res.status(StatusCodes.NOT_FOUND);
		res.send("No such user")
		return;
	}

	if (users.g_users[idx].status === curr_status) {
		users.g_users[idx].status = new_status;
	}
	else {
		res.status(StatusCodes.BAD_REQUEST);
		res.send(message);
		return;
	}

	const curr_user = users.g_users[idx];
	users.g_tokens[users.g_id_to_tokens[curr_user.id]] = false;
	res.send("The following user has suspended: " + JSON.stringify({ curr_user }));
}

function restore_user(req, res) {
	const id = parseInt(req.params.id);
	const check_admin_id = req.body.user.id;

	const curr_status = "suspended";
	const new_status = "actived";
	const message = "Status is not 'suspended', can't restore";

	if (check_admin_id != 1) {
		res.status(StatusCodes.FORBIDDEN);
		res.send("You are not admin");
		return;
	}

	if (id <= 0) {
		res.status(StatusCodes.BAD_REQUEST);
		res.send("Bad id given");
		return;
	}

	if (id == 1) {
		res.status(StatusCodes.FORBIDDEN);
		res.send("Can't approve root user");
		return;
	}

	const idx = users.g_users.findIndex(user => user.id == id)
	if (idx < 0) {
		res.status(StatusCodes.NOT_FOUND);
		res.send("No such user")
		return;
	}

	if (users.g_users[idx].status === curr_status) {
		users.g_users[idx].status = new_status;
	}
	else {
		res.status(StatusCodes.BAD_REQUEST);
		res.send(message);
		return;
	}

	const curr_user = users.g_users[idx];
	res.send("The following user has restored: " + JSON.stringify({ curr_user }));
}


// export
//-------------------------------------------------------------------------------------------------------------------------------------------

module.exports = { list_users, delete_user_by_admin, delete_user, approve_user, suspend_user, restore_user };