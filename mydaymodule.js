var crypto = require('./encryptionmodule');
var myday = require('./mydaymodule');


exports.getmyday = function (ndate){
	let s = ndate.getFullYear() + '-' + (ndate.getMonth()+1) + '-' + ndate.getDate();
	s = s + ':' + ndate.getTime();
	return s;
}

exports.generatetoken = function (){
	var ndate = new Date();
	return crypto.encrypt(myday.getmyday(ndate)); 
}

exports.generatedownlink = function (str){
	return crypto.encrypt(str); 
}

exports.checklogout = function(str1,logouttime) {
	let s1 = str1.substring(str1.indexOf(":")+1,str1.length);
	//console.log(s1);
	//console.log(logouttime);
	if(s1 <= logouttime)
		return true;
	else return false;
}

exports.checkexprire = function(str1) {
	let s1 = str1.substring(str1.indexOf(":")+1,str1.length);
	let ndate = new Date();
	ndate = ndate.getTime();
	//console.log(s1);
	//console.log(ndate);
	if((ndate - s1)/1000 > 86400)
		return true;
	else return false;
}

exports.comparecurrentday = function(str1) {
	let s1 = str1.substring(0,str1.indexOf(":"));
	var ndate = new Date();
	
	let y1 = s1.substring(0,s1.indexOf("-"));
	let y2 = ndate.getFullYear();
	
	//console.log("y1" + y1);
	//console.log("y2" + y2);
	if(y1 > y2) return 100;
	else if(y1 < y2) return 2;
	else{//y1==y2
		//console.log("equal");
		let m1 = s1.substring(s1.indexOf("-")+1,s1.length);
		let m2 = ndate.getMonth()+1;
		m1 = m1.substring(0,m1.indexOf("-"));
		//console.log(m1);
		//console.log(m2);
		if(m1 > m2) return 10;
		else if(m1 < m2) return 2;
		else{//m1=m2
			let d1 = s1.substring(s1.lastIndexOf("-")+1,s1.length);
			let d2 = ndate.getDate();
			//console.log(d1);
			//console.log(d2);
			if(d1 > d2) return 1;
			else if(d1 < d2) 
			{
				if(d1<=d2-2)
					return 2;
				else
					return -1;
			}
			else{//d1=d2
				//console.log("equal");
				return 0;
			}
		}
	}
}
