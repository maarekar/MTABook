const StatusCodes = require('http-status-codes').StatusCodes;
const users = require('./user.js');
const files = require('./database.js');

function delete_user_by_admin(req, res) {
	const id = req.body.id;

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
	// if (idx < 0) {
	// 	res.status(StatusCodes.NOT_FOUND);
	// 	res.send("No such user");
	// 	return;
	// }
	check_user(idx, res);

	const curr_user = users.g_users[idx];
	curr_user.status = "deleted";
	users.g_users.splice(idx, 1);
	users.g_tokens[users.g_id_to_tokens[curr_user.id]] = false;
	res.send("The following user has been deleted: " + JSON.stringify({ curr_user }));
}

function delete_user(req, res) {
	const self_delete_id = req.body.user.id;

	if (self_delete_id !== 1) {
		const idx = users.g_users.findIndex(user => user.id == self_delete_id);
		// if (idx < 0) {
		// 	res.status(StatusCodes.NOT_FOUND);
		// 	res.send("No such user");
		// 	return;
		// }
		check_user(idx, res);

		users.g_tokens[req.token] = false;
		const curr_user = users.g_users[idx];
		curr_user.status = "deleted";
		users.g_users.splice(idx, 1);

		files.write_file(users.g_users, users.users_file);
		res.send("The following user has been deleted: " + JSON.stringify({ curr_user }));
	}
	else {
		res.status(StatusCodes.FORBIDDEN);
		res.send("Can't delete root user");
		return;
	}
}

function approve_user(req, res) {
	const id = parseInt(req.params.id);
	const curr_status = "created";
	const new_status = "actived";
	const message = "Status is not 'created', can't active";

	const idx = users.g_users.findIndex(user => user.id == id);
	// if (idx < 0) {
	// 	res.status(StatusCodes.NOT_FOUND);
	// 	res.send("No such user")
	// 	return;
	// }
	check_user(idx, res);

	// check_user_status(users.g_users[idx].status, res);
	if (users.g_users[idx].status === curr_status) {
		users.g_users[idx].status = new_status;

		files.write_file(users.g_users, users.users_file);
	}
	else {
		res.status(StatusCodes.BAD_REQUEST);
		res.send(message);
		return;
	}

	const curr_user = users.g_users[idx];
	res.send("The following user has been approved: " + JSON.stringify({ curr_user }));

}

function suspend_user(req, res) {
	const id = parseInt(req.params.id);
	const curr_status = "actived";
	const new_status = "suspended";
	const message = "Status is not 'actived', can't suspend";

	const idx = users.g_users.findIndex(user => user.id == id);
	// if (idx < 0) {
	// 	res.status(StatusCodes.NOT_FOUND);
	// 	res.send("No such user")
	// 	return;
	// }
	check_user(idx, res);

	if (users.g_users[idx].status === curr_status) {
		users.g_users[idx].status = new_status;

		files.write_file(users.g_users, users.users_file);
	}
	else {
		res.status(StatusCodes.BAD_REQUEST);
		res.send(message);
		return;
	}

	const curr_user = users.g_users[idx];
	users.g_tokens[users.g_id_to_tokens[curr_user.id]] = false;
	res.send("The following user has been suspended: " + JSON.stringify({ curr_user }));

}

function restore_user(req, res) {
	const id = parseInt(req.params.id);
	const curr_status = "suspended";
	const new_status = "actived";
	const message = "Status is not 'suspended', can't restore";

	const idx = users.g_users.findIndex(user => user.id == id)
	// if (idx < 0) {
	// 	res.status(StatusCodes.NOT_FOUND);
	// 	res.send("No such user")
	// 	return;
	// }
	check_user(idx, res);

	if (users.g_users[idx].status === curr_status) {
		users.g_users[idx].status = new_status;

		files.write_file(users.g_users, users.users_file);
	}
	else {
		res.status(StatusCodes.BAD_REQUEST);
		res.send(message);
		return;
	}

	const curr_user = users.g_users[idx];
	res.send("The following user has been restored: " + JSON.stringify({ curr_user }));
}

function check_admin(req, res, next) {
	if (req.body.user.id != 1) {
		res.status(StatusCodes.UNAUTHORIZED);
		res.send("You are not admin");
		return;
	}
	else {
		next();
	}
}

function check_id(req, res, next) {
	const id = parseInt(req.params.id);
	if (id <= 0) {
		res.status(StatusCodes.BAD_REQUEST);
		res.send("Bad id given");
		return;
	}

	if (id == 1) {
		res.status(StatusCodes.FORBIDDEN);
		res.send("Can't change root user");
		return;
	}

	next();
}

function check_user(id, res) {
	if (id < 0) {
		res.status(StatusCodes.NOT_FOUND);
		res.send("No such user")
		return;
	}
}



// export
//-------------------------------------------------------------------------------------------------------------------------------------------

module.exports = {check_id, check_admin, delete_user_by_admin, delete_user, approve_user, suspend_user, restore_user };