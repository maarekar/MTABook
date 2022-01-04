const fs = require("fs").promises;


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

async function write_file(array, file) {
	await fs.writeFile(file, JSON.stringify(array), function (err) {
		if (err) throw err;
		console.log('complete');
	});
}

module.exports = { read_data, write_file };
