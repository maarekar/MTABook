// External modules
const express = require('express')
const StatusCodes = require('http-status-codes').StatusCodes;
const package = require('./package.json');

const app = express()
let  port = 5001;


// General app settings
const set_content_type = function (req, res, next) 
{
	res.setHeader("Content-Type", "application/json; charset=utf-8");
	next()
}

app.use( set_content_type );
app.use(express.json());  // to support JSON-encoded bodies
app.use(express.urlencoded( // to support URL-encoded bodies
{  
  extended: true
}));

//-----------------------------Classes-----------------------------//
function User(name, id, email, password, date, status){
	this.name = name;
	this.id = id;
	this.email = email;
	this.password = password;
	this.date = date;
	this.status = status;
}

function Message(message, id, date){
	this.message = message;
	this.id = id;
	this.date = date;
}

function Post(message, id, date){
	this.message = message;
	this.id = id;
	this.date = date;
}

// Tables
const g_users = [ {id:1, name: 'Root'} ];
const g_messages = [];
const g_posts = [];
const g_status = ["created", "actived", "suspended", "deleted"];

// API functions

// Version 
// function get_version( req, res) 
// {
// 	const version_obj = { version: package.version, description: package.description };
// 	res.send(  JSON.stringify( version_obj) );   
// }

function list_users( req, res) 
{
	// console.log(g_users)
	res.send(  JSON.stringify( g_users) );   
}

function get_user( req, res )
{
	const id =  parseInt( req.params.id );

	if ( id <= 0)
	{
		res.status( StatusCodes.BAD_REQUEST );
		res.send( "Bad id given")
		return;
	}

	const user =  g_users.find( user =>  user.id == id )
	if ( !user)
	{
		res.status( StatusCodes.NOT_FOUND );
		res.send( "No such user")
		return;
	}

	res.send(  JSON.stringify( user) );   
}

function delete_user( req, res )
{
	const id =  parseInt( req.params.id );

	if ( id <= 0)
	{
		res.status( StatusCodes.BAD_REQUEST );
		res.send( "Bad id given")
		return;
	}

	if ( id == 1)
	{
		res.status( StatusCodes.FORBIDDEN ); // Forbidden
		res.send( "Can't delete root user")
		return;		
	}

	const idx =  g_users.findIndex( user =>  user.id == id )
	if ( idx < 0 )
	{
		res.status( StatusCodes.NOT_FOUND );
		res.send( "No such user")
		return;
	}

	g_users.splice( idx, 1 )
	res.send(  JSON.stringify( {}) );   
}



function create_user( req, res )
{
	const name = req.body.name;

	if ( !name)
	{
		res.status( StatusCodes.BAD_REQUEST );
		res.send( "Missing name in request")
		return;
	}


	// Find max id 
	let max_id = 0;
	g_users.forEach(
		item => { max_id = Math.max( max_id, item.id) }
	)

	const new_id = max_id + 1;
	const new_user = { id: new_id , name: name};
	g_users.push( new_user  );
	
	res.send(  JSON.stringify( new_user) );   
}

// function update_user( req, res )
// {
// 	const id =  parseInt( req.params.id );

// 	if ( id <= 0)
// 	{
// 		res.status( StatusCodes.BAD_REQUEST );
// 		res.send( "Bad id given")
// 		return;
// 	}

// 	const idx =  g_users.findIndex( user =>  user.id == id )
// 	if ( idx < 0 )
// 	{
// 		res.status( StatusCodes.NOT_FOUND );
// 		res.send( "No such user")
// 		return;
// 	}

// 	const name = req.body.name;

// 	if ( !name)
// 	{
// 		res.status( StatusCodes.BAD_REQUEST );
// 		res.send( "Missing name in request")
// 		return;
// 	}

// 	const user = g_users[idx];
// 	user.name = name;

// 	res.send(  JSON.stringify( {user}) );   
// }

function sign_in( req, res )
{
	const name = req.body.name;

	if ( !name)
	{
		res.status( StatusCodes.BAD_REQUEST );
		res.send( "Missing name in request")
		return;
	}


	// Find max id 
	let max_id = 0;
	g_users.forEach(
		item => { max_id = Math.max( max_id, item.id) }
	)
	
	if(check_email(req.body.email))
	{
		res.status( StatusCodes.BAD_REQUEST );
		res.send( "This email is already existing")
		return;
	}

	const new_id = max_id + 1;
	const new_user = new User(name, new_id, req.body.email, req.body.password, new Date(), "created");
	g_users.push( new_user  );
	
	res.send(  JSON.stringify( new_user) );   
}

function check_email(email)
{
	check = false;
	// try to make it with arrrow function
	for(let i =0; i < g_users.length; i++)
	{
		console.log(g_users[i])
		if (g_users[i].email == email)
		{
			return true;
		}
	}

	return false;
}

function log_in(req, res){

}

function log_out(req, res){

}

function approve_user(req, res)
{
	const id =  parseInt( req.params.id );

	if ( id <= 0)
	{
		res.status( StatusCodes.BAD_REQUEST );
		res.send( "Bad id given")
		return;
	}

	if ( id == 1)
	{
		res.status( StatusCodes.FORBIDDEN ); // Forbidden
		res.send( "Can't approve root user")
		return;		
	}
	
	const idx =  g_users.findIndex( user =>  user.id == id )
	if ( idx < 0 )
	{
		res.status( StatusCodes.NOT_FOUND );
		res.send( "No such user")
		return;
	}

	if(g_users[idx].status === "created"){
		g_users[idx].status = "actived";
	}
	else{
		res.status( StatusCodes.BAD_REQUEST );
		res.send( "Bad id given")
		return;
	}
	res.send(  JSON.stringify( {}) );
}

function suspend_user( req, res )
{
	const id =  parseInt( req.params.id );

	if ( id <= 0)
	{
		res.status( StatusCodes.BAD_REQUEST );
		res.send( "Bad id given")
		return;
	}

	if ( id == 1)
	{
		res.status( StatusCodes.FORBIDDEN ); // Forbidden
		res.send( "Can't suspend root user")
		return;		
	}

	const idx =  g_users.findIndex( user =>  user.id == id )
	if ( idx < 0 )
	{
		res.status( StatusCodes.NOT_FOUND );
		res.send( "No such user")
		return;
	}
	if(g_users[idx].status === "actived"){
		g_users[idx].status = "suspended";
	}
	else{
		res.status( StatusCodes.BAD_REQUEST );
		res.send( "Bad id given")
		return;
	}

	res.send(  JSON.stringify( {}) );   
}

function restore_user( req, res )
{
	const id =  parseInt( req.params.id );

	if ( id <= 0)
	{
		res.status( StatusCodes.BAD_REQUEST );
		res.send( "Bad id given")
		return;
	}

	if ( id == 1)
	{
		res.status( StatusCodes.FORBIDDEN ); // Forbidden
		res.send( "Can't delete root user")
		return;		
	}

	const idx =  g_users.findIndex( user =>  user.id == id )
	if ( idx < 0 )
	{
		res.status( StatusCodes.NOT_FOUND );
		res.send( "No such user")
		return;
	}

	g_users[idx].status = "restored";
	res.send(  JSON.stringify( {}) );   
}


// Routing
const router = express.Router();

router.get('/version', (req, res) => { get_version(req, res )  } )
router.get('/users', (req, res) => { list_users(req, res )  } )
router.post('/users', (req, res) => { create_user(req, res )  } )
router.put('/user/(:id)', (req, res) => { update_user(req, res )  } )
router.get('/user/(:id)', (req, res) => { get_user(req, res )  })
router.delete('/user/(:id)', (req, res) => { delete_user(req, res )  })

router.post('/sign', (req, res) => { sign_in(req, res )  } )
router.post('/approve', (req, res) => { approve_user(req, res )  } )
router.put('/suspend/(:id)', (req, res) => { suspend_user(req, res )  } )


app.use('/api',router)


// Init 

let msg = `${package.description} listening at port ${port}`
app.listen(port, () => { console.log( msg ) ; })



