const fs = require("fs").promises;
// const user = require('./user.js');
// const message = require('./message.js');
// const post = require('./post.js');

async function exists(path) {
	try {
		const stat = await fs.stat(path)
		return true;
	}
	catch (e) {
		return false;
	}
}

async function read_data(data_array, file) {
	if (!(await exists(file))) {
		console.log(`Unable to access ${file}`)
		return;
	}

	const data = await fs.readFile(file);
	const arr = JSON.parse(data);

	for (var i in arr) {
		data_array.push(arr[i]);
	}

	return data_array;
}

// async function read_users() {
// 	if (!(await exists(user.users_file))) {
// 		console.log(`Unable to access ${user.users_file}`)
// 		return;
// 	}

// 	const users_data = await fs.readFile(user.users_file);
// 	const user_arr = JSON.parse(users_data);

// 	for (var i in user_arr) {
// 		user.g_users.push(user_arr[i]);
// 	}
// }

// async function read_messages()
// {

//     if ( !( await exists(message.messages_file )))
//     {
//         console.log( `Unable to access ${message.messages_file}`)
//         return;
//     }

//     const messages_data = await fs.readFile(message.messages_file);
//     const messages_arr = JSON.parse(messages_data);

// 	for (var i in messages_arr) {
// 		message.g_messages.push(messages_arr[i]);
// 	}
// }

// async function read_posts()
// {
//     console.log("check")
//     console.log(post.posts_file)
// 	if ( !( await exists(post.posts_file)))
//     {
//         console.log( `Unable to access ${post.posts_file}`)
//         return;
//     }

//     const posts_data = await fs.readFile(post.posts_file);
//     const posts_arr = JSON.parse(posts_data);

// 	for (var i in posts_arr) {
// 		post.g_posts.push(posts_arr[i]);
// 	}
// }

async function write_file(array, file) {
	await fs.writeFile(file, JSON.stringify(array), function (err) {
		if (err) throw err;
		console.log('complete');
	});
}

module.exports = { read_data, write_file };
