const path = require('path')
const http = require('http')
const https = require('https');
const find = require('find')
const fs = require('fs');
const Queue = require('./dungqueue.js');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};


const myday = require('./mydaymodule');
const crypto = require('./encryptionmodule');

let validtime = new Date().getTime() - 50000;
let logouttime = new Date().getTime();

//let stilldownload = false;
//let stilldel = false;
//console.log(stilldownload);

let currentcommand = 0;

//for upload
let numberupload = 0;
let numbercheckupload = 0;
let filesupload = new Array(31);
let exec_find = new Array(31);
let existedfile = new Array(31);
let currentpathupload = '';
let currentuploadfile = '';

let web_username="username";
let web_password="1234";

const rootDir = __dirname;

// import express (after npm install express)
const express = require('express');

// create new express app and save it as "app"
const app = express();

// server configuration
const PORT = 19999; 

//parser
const bodyParser = require('body-parser');

const querystring = require('querystring');

const multer = require('multer');

//exec command
const sys = require('util')

const exec = require('child_process').exec;


//set express configuration
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

// make the server listen to requests
/*
app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}/`);
});
*/

const httpsServer = https.createServer(options, app);


httpsServer.listen(PORT, "0.0.0.0", () => {
	try{
		const allFileContents = fs.readFileSync('webinfo.txt', 'utf-8');
		var i=0;
		allFileContents.split(/\r?\n/).forEach(line =>  {
			//console.log(`Line from file: ${line}`);
			if(i==0) web_password = line;
			i++;
		});
	}	
	catch (e) {}
	console.log(`webuser:${web_username}`);
	console.log(`webpass:${web_password}`);
    console.log(`Server running at: http://localhost:${PORT}/`);
});


 

/********
 * GET IMAGE FILE *
 * **********/
 
app.get('/images/:fileName', function(req ,res) {
    var path = require('path');
    var file = path.join(rootDir + "/images/", req.params.fileName);
    res.sendFile(file);
});


/********
 * LOG IN *
 * **********/
 
// create a route for the app
app.get('/', (req, res) => {
  fs.readFile(__dirname + '/index.html', function (err,html) {
    if (err) {
        res.send("Error occurred!");
		return;
    }  
    res.writeHeader(200, {"Content-Type": "text/html"});  
    res.write(html);  
    res.end();  
  });
});


function reponseToLogIn(req, res){
	//write log time to file for bash copy process
	updatelogtime(true);

	currentcommand = 0;

	fs.readFile(__dirname + '/content.html', function (err,html) {
		 if (err) {
			throw err; 
		 }  
		 validtime = new Date().getTime();
		
		 res.setHeader('content-type', 'text/html');
		 res.write(html);  
		 var output = myday.generatetoken();
		 writefirst(res,output.encryptedData,true,'','');
	});//end readfile

}

app.post('/',function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    res.setHeader('content-type', 'text/html');
    
    if(username!==web_username||password!==web_password){
		res.send("Login invalid!");
    }
    else{
		reponseToLogIn(req,res);
	}
});

/********
 * LOG OUT *
 * **********/
 
app.get('/logout', (req, res) => {
	try{
	  let p = querystring.parse(req.url)['/logout?p'];
	  let token = p.substring(0,p.indexOf(":"));
	  //console.log("logout token:" + token);
	  let cleartoken = crypto.decryptfromtext(token);
	  let s1 = cleartoken.substring(cleartoken.indexOf(":")+1,cleartoken.length);
	  logouttime = s1;

	  //currentcommand = 0;
	  
	  fs.readFile(__dirname + '/index.html', function (err,html) {
		if (err) {
			throw err; 
		}  
		res.writeHeader(200, {"Content-Type": "text/html"});  
		res.write(html);  
		res.end();  
	  });
	}
	catch(e){
		res.send("Error occurred!");
		return;
	}
});

app.get('/path', (req, res) => {
	try{
		let p = querystring.parse(req.url)['/path?p'];
		let abPath = '';
		let parentPath = '';
		let token = p.substring(0,p.indexOf(":"));
		p = p.substring(p.indexOf(":")+1,p.length);
		p = p.trim().hexDecode();

		console.log("path:" + p);
		console.log("token:" + token);
		
		//check valid token
		if(checkvalidtoken(token,res)===false)
			return;
		
		//check valid time
		if(checkvalidtime(res)===false)
			return;
		
		fs.readFile(__dirname + '/content.html', function (err,html) {
				 if (err) {
					throw err; 
				 }  
				 res.setHeader('content-type', 'text/html');
				 res.write(html); 
				 //console.log("day");
				 writefirst(res,token,true,'','');
			});//end readfile
	}
	catch(e){
		res.send("Error occurred!");
		return;
	}
});


/***************
 * Change Web Info
 * *************/
app.post('/trycwap',function(req,res){
	try{
	 console.log("trycwap "+req.body.oldpasswd);
	 console.dir(req.body);	 
	 var op = req.body.oldpasswd;
	 var np1 = req.body.newpasswd1;
	 var np2 = req.body.newpasswd2;
	 if(op == web_password){
		 if (np1==np2){
			 web_password = np2;
			 fs.writeFile('./webinfo.txt', web_password, { flag: 'w+' }, err => {});
			 res.setHeader('Content-Type', 'application/json');
			 res.end(JSON.stringify({ ok: 2 }));
		 } else {
			 res.setHeader('Content-Type', 'application/json');
			 res.end(JSON.stringify({ ok: 1 }));
		 }
	 }
	 else{
		 res.setHeader('Content-Type', 'application/json');
		 res.end(JSON.stringify({ ok: 0 }));
	 }
	}
	catch(e){
		res.send("Error occurred!");
		return;
	} 
});

app.get('/cwap', function(req ,res) {
	try{
		console.log('Select cwap');
		let token = req.query.token;
		let p = req.query.currentdir;
		
		p = p.trim().hexDecode();
		console.log("token:" + token);
		console.log("currentdir:" + p);

		//check valid token
		if(checkvalidtoken(token,res)===false)
			return;
		
		//check valid time
		if(checkvalidtime(res)===false)
			return;
			
		
		 fs.readFile(__dirname + '/cwap.html', function (err,html) {
			if (err) {
				throw err; 
			}  
			 res.setHeader('content-type', 'text/html');
			 res.write(html); 
			 res.write('<h2>Fill Below Information To Change Website Account</h2>');
			 res.write('<br>');
			 
			 res.write('<h2>Change Password</h2>');
			 
			 res.write('<h3>Your Current Password <input type=password id="oldpasswd" name="oldpasswd"> </h3>');
			 res.write('<h3>New Password (first__) <input type=password id="newpasswd1" name="newpasswd1"> </h3>');
			 res.write('<h3>New Password (repeat) <input type=password id="newpasswd2" name="newpasswd2"> </h3>');
			 res.write('<h3><button type="button" class="button" id="change_newpasswd">Change</button> </h3>');

			 res.write('<input type="hidden" id="token" name="token" value="'+token+'">');
			 res.write('<input type="hidden" id="path" name="path" value="'+p.hexEncode()+'">');	 
			 res.write('</div>');
			 res.write('</body>');
			 res.write('</html>');
			 res.end();
		 });
	}
	catch(e){
		res.send("Error occurred!");
		return;
	}

});

/***************
 * Change Store Acc Info
 * *************/

app.post('/trycsap',function(req,res){
	try{
		 console.log("trycsap "+req.body.oldpasswd);
		 console.dir(req.body);	 
		 var op = req.body.oldpasswd;
		 var np1 = req.body.newpasswd1;
		 var np2 = req.body.newpasswd2;
		 
		 //pass ko co space \ ' "
		 if (np1 != np2){
			 res.setHeader('Content-Type', 'application/json');
			 res.end(JSON.stringify({ ok: 1 }));
			 return;
		 }
		 
		 var s = "./changepw.sh " + op + " " + np1;
		 console.log("trycsap cmd:"+s);
		 exec(s, function(err, stdout, stderr) {
			if (err) {
				console.log("err:"+stderr);
				if(stderr.includes('Authentication token manipulation error')){
					if(stderr.includes('You must choose a longer password')){
						console.log("Need longer password");
						res.setHeader('Content-Type', 'application/json');
						res.end(JSON.stringify({ ok: 4 }));
					}
					else{
						console.log("Current password not match");
						res.setHeader('Content-Type', 'application/json');
						res.end(JSON.stringify({ ok: 0 }));
					}
				}				
				else {
					console.log("Unknown error");
					res.setHeader('Content-Type', 'application/json');
					res.end(JSON.stringify({ ok: 3 }));
				}
			} else { //ok
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify({ ok: 2 }));
			}
		 });
	}
	catch(e){
		res.send("Error occurred!");
		return;
	}
});

app.get('/csap', function(req ,res) {
	try{
		console.log('Select csap');
		let token = req.query.token;
		let p = req.query.currentdir;
		
		p = p.trim().hexDecode();
		console.log("token:" + token);
		console.log("currentdir:" + p);

		//check valid token
		if(checkvalidtoken(token,res)===false)
			return;
		
		//check valid time
		if(checkvalidtime(res)===false)
			return;
			
		
		 fs.readFile(__dirname + '/csap.html', function (err,html) {
			if (err) {
				throw err; 
			}  
			 res.setHeader('content-type', 'text/html');
			 res.write(html); 
			 res.write('<h2>Fill Below Information To Change Store Account</h2>');
			 res.write('<br>');
			 
			 res.write('<h2>Change Password</h2>');
			 
			 res.write('<h3>Your Current Password <input type=password id="oldpasswd" name="oldpasswd"> </h3>');
			 res.write('<h3>New Password (first__) <input type=password id="newpasswd1" name="newpasswd1"> </h3>');
			 res.write('<h3>New Password (repeat) <input type=password id="newpasswd2" name="newpasswd2"> </h3>');
			 res.write('<h3><button type="button" class="button" id="change_newpasswd">Change</button> </h3>');

			 res.write('<input type="hidden" id="token" name="token" value="'+token+'">');
			 res.write('<input type="hidden" id="path" name="path" value="'+p.hexEncode()+'">');	 
			 res.write('</div>');
			 res.write('</body>');
			 res.write('</html>');
			 res.end();
		 });
	}
	catch(e){
		res.send("Error occurred!");
		return;
	}

});


/*********
 * Other Functions
 * *************/
 

function PromiseTimeout(ms) { 
        return new Promise(function(resolve, reject) { 
            // Setting 2000 ms time 
            setTimeout(resolve, ms); 
        }).then(function() { 
            //console.log("Wrapped setTimeout after 2000ms"); 
        }); 
} 

function getFileAndDirectories(path) {
	return fs.readdirSync(path,{withFileTypes:true})
}


function writefirst(res,token,firstcall, pPath, aPath){
		let k = -1;
		
		 if(firstcall==false){			 
					res.write('<th style="width: 100px; height: 25px;"><button type="button" id = "selectbutton" class="btun"> </button></th>');
		 }
		 else
			res.write('<th style="width: 100px; height: 25px;"><button type="button" id = "selectbutton" class="btun"> </button></th>');
			
		 res.write('</tr>');
		 res.write('</thead>');
		 res.write('<tbody>');
		 
		 if(firstcall==false){
			 res.write('<tr class="dir" style="border-bottom: 1px solid #000;">');
			 res.write('<td><a href="./path?p=' + token + ":" + pPath.trim().hexEncode() + '">'+ '..' + '</a></td>');
			 res.write('<td><a href="./path?p=' + token + ":" + pPath.trim().hexEncode() + '">'+ '' + '</a></td>');
			 res.write('</tr>');
		 }
		 
		 let tempPath='';
		 
		 
		 res.write('</tbody>');
		 res.write('</table>');
		 //console.log("firstcall=" + firstcall);
		 if(firstcall==true){
			 res.write('<input type="hidden" id="path" name="path" value="">');
		 }
		 else {
			 res.write('<input type="hidden" id="path" name="path" value="'+aPath.hexEncode()+'">');
		 }
		 
		 res.write('<input type="hidden" id="token" name="token" value="'+token+'">');
		 res.write('</div>');
		 res.write('</body>');
		 res.write('</html>');
		 res.end();
}

function checkvalidtime(res){
	let newvalidtime = new Date().getTime();
	if((newvalidtime - validtime)/1000 > 300)
	{
		try {
				res.send('Error: Timeout, please relogin!');
		 }
		 catch(e){
			console.log("Loi timeout " + e);
		 }
		
		return false;
	}
	//save new time
	validtime = newvalidtime;
	//write time to log for bash copy process
	updatelogtime(false);
	return true;
}

function checkvalidtoken(token,res){
	if(token==='')
	{
		res.send('Error: token');
		return false;
	}
	
	try {
		let cleartoken = crypto.decryptfromtext(token);
		//console.log("clear token:" + cleartoken);
		let compareday = myday.checkexprire(cleartoken);
		//console.log("compareday:" + compareday);
		
		if(compareday === true)
		{
			res.send('Error token');
			return false;
		}
		
		compareday = myday.checklogout(cleartoken,logouttime);
		if(compareday === true)
		{
			res.send('Error token');
			return false;
		}
	 }
	 catch(e){
			res.send('Error token');
			return false;
	 }

	return true;
}

function checkvalidtoken_downfromlink(token,res){
	if(token==='')
	{
		res.send('Error: token');
		return false;
	}
	
	try {
		let cleartoken = crypto.decryptfromtext(token);
		//console.log("clear token:" + cleartoken);
		let compareday = myday.checkexprire(cleartoken);
		//console.log("compareday:" + compareday);
		
		if(compareday === true)
		{
			res.send('Error token');
			return false;
		}
		
	 }
	 catch(e){
			res.send('Error token');
			return false;
	 }

	return true;
}

function updatelogtime(bl){

	let data = Date.now()+"\n";
	
	if(bl===true){
		// Write first data in 'read_file.txt
		fs.writeFile('./logtime/logtimefile.txt', data, (err) => {
			  
			// In case of a error throw err.
			if (err) throw err;
		})
	}
	else{
		// Append data in 'read_file.txt
		fs.appendFile('./logtime/logtimefile.txt', data, (err) => {
			  
			// In case of a error throw err.
			if (err) throw err;
		})
	}
}

/**
 * https://medium.com/@ali.dev/how-to-use-promise-with-exec-in-node-js-a39c4d7bbf77
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
 
function execShellCommand(cmd) {
	 return new Promise((resolve, reject) => {
		  exec(cmd, (error, stdout, stderr) => {
			   let out = '';
			   if (error) {
					console.warn("ErrorExecShellCommand:" + error);
					out = 'err';
			   }
			   else{
				   if(stdout!='')
						out = stdout;
					console.warn(stderr);
			   }   
			   //resolve(stdout? stdout : stderr);
			   resolve(out);
		  });
	 });
}

String.prototype.hexDecode = function(){
    var j;
    var hexes = this.match(/.{1,4}/g) || [];
    var back = "";
    for(j = 0; j<hexes.length; j++) {
        back += String.fromCharCode(parseInt(hexes[j], 16));
    }

    return back;
}

String.prototype.hexEncode = function(){
    var hex, i;

    var result = "";
    for (i=0; i<this.length; i++) {
        hex = this.charCodeAt(i).toString(16);
        result += ("000"+hex).slice(-4);
    }

    return result
}
