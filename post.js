const g_posts = []

function Post(message, id, date, user_id) {
	this.message = message;
	this.id = id;
	this.date = date;
	this.user_id = user_id;
	this.status = 'published';
}

function publish_post(req, res) {
	const text = req.body.text;

	if (!text) {
		res.status(StatusCodes.BAD_REQUEST);
		res.send("Missing text in request")
		return;
	}

	// Find max id 
	let max_id = 0;
	g_posts.forEach(
		item => { max_id = Math.max(max_id, item.id) }
	)

	const new_id = max_id + 1;

	const new_post = new Post(text, new_id, new Date(), req.body.user.id);
	g_posts.push(new_post);


	res.send(JSON.stringify(new_post));

}

function get_posts(req, res) {
	const posts = g_posts.filter(post => post.status == "published");
	res.send(JSON.stringify(posts));
}

function delete_post(req, res) {
	let writer;

	for (let i = 0; i < g_posts.length; i++) {
		if (g_posts[i].id == req.body.post) {
			writer = g_posts[i].user_id;
		}
	}

	if (req.body.user.id != writer) {
		res.status(StatusCodes.FORBIDDEN); // Forbidden
		res.send("No access")
		return;
	}
	else {
		for (let i = 0; i < g_posts.length; i++) {
			if (g_posts[i].id == req.body.post) {
				g_posts[i].status = "deleted";
			}
		}
		res.send(JSON.stringify("You delete the post successfuly !"));
	}

}

module.exports = {publish_post, get_posts, delete_post};