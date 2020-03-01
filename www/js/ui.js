const mainContentDiv = document.querySelector('#mainContent');
const background = document.querySelector('#background');
const toolbar = document.querySelector('#toolbar');
var pics = Array.from(document.querySelector('#background2').children);
var data;
var dd;
const boxesArray = [];
const PICSIZE = 60;
var todoToken = null;


/// Gallery functions for moving left/right, zoom in/out
const Gallery = (function(){
	
	const xyz = {};
	
	xyz.moveRight = function(){
		
		/// right arrow click, to move in a rightward direction (from left to right)
		/// direction of mevement is   ----->   ----------->
		
		/// move in to view from left
		pics[0].style.transform = 'translateX(0%)';
		
		/// move out of view (push it right)
		pics[1].style.transform = 'translateX(100%)';
		
		/// rightmost falls off end and re-created at begginning
		document.querySelector('#background2').removeChild(pics[2]);
		const p = document.createElement('div');
		p.className = 'pic';
		p.style.transform = 'translateX(-100%)';
		
		/// if close to beginning, set dd to end
		dd = ((dd - 2) < 0) ? (dd + data.length) : dd;
		
		//const url = '/_ah/img/encoded_gs_file:' + data[dd - 2];	
		const url = data[dd - 2];	
	
		//p.style.backgroundImage = `url(${url})`;
		
		populateBigPic(url, p)
		
		document.querySelector('#background2').insertBefore(p, pics[0]);
		
		dd--;
		
		pics = [p, pics[0], pics[1]];			
	}
	
	xyz.moveLeft = function(){
	
		/// left arrow click, to move in a leftward direction (from right to left)
		/// direction of mevement is   <-----   <-----------
	
		/// move into view from right
		pics[2].style.transform = 'translateX(0%)';
			
		/// move out of view (push it left)
		pics[1].style.transform = 'translateX(-100%)';
		
		
		/// leftmost falls off the left end and is recreated at rightmost end
		document.querySelector('#background2').removeChild(pics[0]);
		const p = document.createElement('div');
		p.className = 'pic';
		p.style.transform = 'translateX(100%)';
	
		/// if close to end, reset dd to beginning
		dd = ((dd + 2) > (data.length - 1) ) ? (dd - data.length) : dd;
		
		//const url = '/_ah/img/encoded_gs_file:' + data[dd + 2];
		const url = data[dd + 2];
	
		//p.style.backgroundImage = `url(${url})`;
		
		populateBigPic(url, p)
		
		document.querySelector('#background2').appendChild(p);	
		
		dd++;
		
		pics = [pics[1], pics[2], p];
	}
	
	xyz.zoom_in = function(el){  
		
		const matrix = window.getComputedStyle(el).transform; 
		const matrixArray = matrix.replace("matrix(", "").split(",");
		const scaleX = parseFloat(matrixArray[0]);
	
		el.style.transform =  `scale(${scaleX * 1.5})`
	}
	
	xyz.zoom_out = function(el){
	
		const matrix = window.getComputedStyle(el).transform; 
		const matrixArray = matrix.replace("matrix(", "").split(",");
		const scaleX = parseFloat(matrixArray[0]);
	
		el.style.transform =  `scale(${scaleX / 1.5})`
	}
	
	return xyz;
}());

/// Touch gestures - handle swipe actions on smartphones.
(function(){

	document.addEventListener('touchstart', handleTouchStart, false);
	document.addEventListener('touchmove', handleTouchMove, false);
	
	var xDown = null;
	var yDown = null;
	
	function getTouches(evt) {
	  return evt.touches ||             // browser API
	         evt.originalEvent.touches; // jQuery
	}
	
	function handleTouchStart(evt) {
	    const firstTouch = getTouches(evt)[0];
	    xDown = firstTouch.clientX;
	    yDown = firstTouch.clientY;
	};
	
	function handleTouchMove(evt) {
	    if ( ! xDown || ! yDown ) {
	        return;
	    }
	
	    const bk = document.getElementById("background2")
	
	    if(document.getElementById("background").style.opacity == '0' || document.getElementById("background").style.opacity == ''){
	        return;
	    }
	
	    var xUp = evt.touches[0].clientX;
	    var yUp = evt.touches[0].clientY;
	
	    var xDiff = xDown - xUp;
	    var yDiff = yDown - yUp;
	
	    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
	
	        //if ( xDiff > 0 ) {
	            ///// left swipe
				//moveLeft();			
	        //} else {
	            ///// right swipe
				//moveRight();
	        //}
	 
			(xDiff > 0) ? Gallery.moveLeft() : Gallery.moveRight();

	    } else {
	        //if ( yDiff > 0 ) {
	            ///// up swipe */
	        //} else {
	            ///// down swipe */
	        //}
	        (yDiff > 0) ? Gallery.moveLeft() : Gallery.moveRight();
	    }
	    /// reset values 
	    xDown = null;
	    yDown = null;
	};

})();





function populateBigPic(imgURL, pic){
	
	/// first try to get (image) from indexdb
	/// if not there, go to network
	/// if no network, serve default
	
	
	
	imgURL = 'https:' + imgURL;
	
	const callbackfn = function(responseObject){					
		
		if(responseObject){
			/// retrieved from indexedDB
			const objectURL = window.URL.createObjectURL(responseObject);
			pic.style.backgroundImage = `url(${objectURL})`; 
			
			
		} else {
			/// fetch from network
			//fetch('/getpic.php?file=' + imgURL)	    // GET method	
			fetch('/getpic.php', {method:'POST', body:JSON.stringify({api:true,	file:imgURL})} )
			.then(res => {	 
				if(res.url.indexOf('icon-512x512.png') > -1){
					res.blob().then(res => {
						/// set background image as default image
						const objectURL = window.URL.createObjectURL(res);
						pic.style.backgroundImage = `url(${objectURL})`;						
					});
				} else {
					res.blob().then(res => {  
						/// set background image
						const objectURL = window.URL.createObjectURL(res);
						pic.style.backgroundImage = `url(${objectURL})`;
		
						/// put into indexedDB filesDB the "request url" and its "response"						
						const text = 'randomText';
						const url = imgURL; 
						const content = res; 
						filesDB.createEntry(text, url, content, () => {})
					})
				}
			})
			.catch((err) => {                                                   console.log('got from neither:', imgURL);	
				
				/** it has to be that you have refreshed once in order for sw to kick in ... ??!
				 *  even though the stuff IS in static cache..??
				 *  
				 *  TODO: FIXME - this is a bugg! fuck whatever feature they think they are implementing - its a bug.
				 *                should not have to do a refresh for sw to serve something that *is already in its cache*
				 *                plan is to bollocks the pwa sw and use indexeddb which works as expected - pwa can stick to making a splash screen and other ui trivia - its no good for proper offline management.
				 */
				
				/// failed from indexedDB AND network, so send out default img
				console.log(err);
				pic.style.backgroundImage = "url('/images/icons/icon-512x512.png')";
			})
		}						
	}	

	/// either get it from indexedDB or if that fails, get it from network
	filesDB.getFile(imgURL, callbackfn)	
	
}




function populateBigPicX(imgURL, pic){
	
	/// first try to get (image) from indexdb
	/// if not there, go to network
	/// if no network, serve default
	
	const callbackfn = function(responseObject){
		if(responseObject){
			/// retrieved from indexedDB
			const objectURL = window.URL.createObjectURL(responseObject);
			pic.style.backgroundImage = `url(${objectURL})`; 			
		} else {
			/// fetch from network
			async function  doGet(){				
				const getpic = await fetch('/getpic.php', {method:'POST', body:JSON.stringify({api:true, file:'https:' + imgURL})});
				const blob = await getpic.blob();			
				const objectURL = window.URL.createObjectURL(blob);
				pic.style.backgroundImage = `url(${objectURL})`;            /// set background image
				if(getpic.url.indexOf('icon-512x512.png') === -1){			/// put into indexedDB filesDB the "request url" and its "response"							
					const text = 'randomText';
					const url = imgURL; 
					const content = getpic; 
					filesDB.createEntry(text, url, content, null)				
				}			
			}
			doGet().catch(e => pic.style.backgroundImage = '/images/icons/icon-512x512.png')		
		}
	};	
	/// either get it from indexedDB or if that fails, get it from network
	filesDB.getFile(imgURL, callbackfn)		                               
}

/// IndexedDB db.js callback function
function refreshTodos() {  

	const callback = function(user){
		document.querySelector("#side-menu > li:nth-child(1) > a").innerHTML = (user) ? user : 'PicsApp';
		document.getElementById("loginForm").style.display = (user) ? 'none' : 'block';
		document.getElementById("loggedInStuffs").style.display = (user) ? 'block' : 'none';
	}

	todoDB.getTodo('login.php', callback);
	
	return
	
	todoDB.fetchTodos(function(todos) {
		
		//var todoList = document.getElementById('todo-items');
		//todoList.innerHTML = '';
		
		for(var i = 0; i < todos.length; i++) {
			
			// Read the todo items backwards (most recent first).
			var todo = todos[(todos.length - 1 - i)];	
			
			console.log(todo);	
			
			if(todo.url === 'login.php'){
				todoToken = todo.responseContent
			}	
			
			
			//// Read the todo items backwards (most recent first).
			//var todo = todos[(todos.length - 1 - i)];

			//var li = document.createElement('li');
			//var checkbox = document.createElement('input');
			//checkbox.type = "checkbox";
			//checkbox.className = "todo-checkbox";
			//checkbox.setAttribute("data-id", todo.timestamp);
			
			//li.appendChild(checkbox);
			
			//var span = document.createElement('span');
			//span.innerHTML = todo.text;
			
			//li.appendChild(span);
			
			//todoList.appendChild(li);
			
			//// Setup an event listener for the checkbox.
			//checkbox.addEventListener('click', function(e) {
				//var id = parseInt(e.target.getAttribute('data-id'));

				//todoDB.deleteTodo(id, refreshTodos);
			//});
		}
		
		if(todos.length === 0){
			console.log('todo db as yet empty');
		}

	});
}


document.addEventListener('DOMContentLoaded', () => { 
	
	/** DOMContentLoaded vs window.onload
	
	The DOMContentLoaded event fires when parsing of the current page is complete; 
	the load event fires when all files have finished loading from all resources, including ads and images. 
	DOMContentLoaded is a great event to use to hookup UI functionality to complex web pages.
	
	*/


	/// get login status
	const callback = function(user){
		
		document.querySelector("#side-menu > li:nth-child(1) > a").innerHTML = (user) ? user : 'PicsApp';
		document.getElementById("loginForm").style.display = (user) ? 'none' : 'block';
		document.getElementById("loggedInStuffs").style.display = (user) ? 'block' : 'none';

		//if(user){
			//document.querySelector("#side-menu > li:nth-child(1) > a").innerHTML = user;
			//document.getElementById("loginTrigger").style.display = 'none';
			//document.getElementById("loggedInStuffs").style.display = 'block';
		//} else {
			//document.querySelector("#side-menu > li:nth-child(1) > a").innerHTML = 'PicsApp'
			//document.getElementById("loginTrigger").style.display = 'block';
			//document.getElementById("loggedInStuffs").style.display = 'none';
		//}
	}
	todoDB.open(() => todoDB.getTodo('login.php', callback) );


	/// init indexedDB filesDB
	const onFilesDBopen = async function(files){


		const getAPI = async () => {
			/// return the contents of api.php
			try{
				// FIRST: try to fetch from network...
				const fetchResponse =  await fetch('/api.php', {	method:'POST', body:JSON.stringify({api: true})	}).then((res) => {return res;}).catch((err) => {throw Error(err)})
				
				if(fetchResponse.statusText === ""){
					/// network fetch was ok - cache the response
					const content = await fetchResponse.json();
					const text = 'randomText';
					const url = '/api.php';
					filesDB.createEntry(text, url, content, () => {});
					
					return content;				
				} else {
					/// no network - move on to next
					throw Error('mycaught: network fetch unavailable - will try from indexeddb')
				}
			} catch (e){			
				console.log(e);
				try {				
					// ... SECOND: if that fails, get from indexedDB ...
					const getFromIDB = async () => {				
						return new Promise((resolve, reject) => {
							filesDB.getFile('/api.php', res => {
								if(res){
									/// found in indexdb, proceed with getting individual image files...	
									resolve (res)		
								} else {
									reject (null)
								}
							});	
						})
					}		
					
					return await getFromIDB().then((res) => {return res}).catch((err) => {throw Error('ixdb unavailable too - returning null')})
				
				} catch(e2){
					console.log(e2);
					// ... THIRD: if that fails too, return null
					return null
				}
			}	
		}
	
		const processApiFile = function(res){
			
			data = res.pictures;
			data.forEach((item, i) => {
				let box = document.createElement('div');
				box.className = 'box';
				box.style.width = PICSIZE + 'px'
				box.style.height = PICSIZE + 'px'
				
				/** the original way of doing this was a GET request to the url, but due to the response being non-cors each file was taking up 7MB of cache space (opaque) causing cache overflow
				 *     and this was preventing other files from from being stored for when retrieval needed - a no-no.
				 * 
				 *  so, did POST request to the pictuload.appspot.com/getpic.php for IT to serve the file with access-control-allow-origin header set to * (enabled cors)
				 *     but because that is a POST request the sw.js does not cache those - bye-bye pwa.
				 * 
				 *  so, now doing a GET request to getpic.php en sending along the required fileurl, so that is is served with cors header, and sw.js might deign to cache the response.
				 *     but that is having to be createObjectURL'ed, and that is taking up time, and it is noticeably visibly slower (but not unworkably so)
				 * 
				 *  maybe the original thought would be better:
				 *     do the request - then index db the request url as key, and the createObjectURL'ed response as value, for immediate retrieval on demand (no time spent createObjectURL'ing)
				 *     ...
				 *     do know how to indexdb store post responses as per login.php => jwt.
				 *     ...
				 *     it IS visibly faster => result, but logically the blob thing is still going through the createObjectURL process... it works => result!
				 * 
				 *     bugger the fucker if it cant even load on first load, even though subsequent reloads are all ok !!!??
				 *     reverted back to the somewhat slower version..
				 *     satisfactorily resolved this issue by moving get function into oncomplete of open function (asynchronous-ity)
				 */
				
				let imgURL = `https:${item}=s${PICSIZE}`;
	
				/// before fetching from network, check to see if url (and therefore its createObjectURL'ed blob) is in indexeddb and if so, use ITS response
				const callbackfn = function(responseObject){					
					
					if(responseObject){
						/// retrieved from indexedDB
						const objectURL = window.URL.createObjectURL(responseObject);
						box.style.backgroundImage = `url(${objectURL})`; 
					} else {
						/// fetch from network
						/** dont do GET requests so as not to save in pwa sw cache as we are 
						 *  saving the POST in indexedDB - dont need duplicate save.
						 *  Reason we are doing POST instead of GET is that GET reloads are slower - "...noticeably visibly slower...".
						 */
						//fetch('/getpic.php?file=' + imgURL)   // GET method
						fetch('/getpic.php', {method:'POST', body:JSON.stringify({api:true,	file:imgURL})} )
						.then(res => {							
							return res.blob()
						})
						.then(res => {  
							/// set background image
							const objectURL = window.URL.createObjectURL(res);
							box.style.backgroundImage = `url(${objectURL})`;
	
							/// put into indexedDB filesDB the "request url" and its "response"
							const text = 'randomText';
							const url = imgURL; 
							const content = res; 
							filesDB.createEntry(text, url, content, () => {})
						})
						.catch((err) => console.log(err))
					}						
				}	
				
				/// either get it from indexedDB or if that fails, get it from network
				filesDB.getFile(imgURL, callbackfn) 
	
	
				mainContentDiv.appendChild(box);
				boxesArray.push(box);
			});				
			
		}
	
	
		/// ASYNC / AWAIT ised version of: get api.php, then process each file
		/// it IS neater, clearer, easier to read, but was a bitch to implement.
		const jsonFileList = await getAPI(); 
				
		if(!jsonFileList){
			console.log('no data was received - aborting');
			return
		} else {
			processApiFile(jsonFileList); 
		}
		












		/// retrieve pic urls
		const URL = '/api.php';
	    const payload = {
	        api: true,
		};
		
		
		/** gettage of api.php
		 *  get api.php filelist as POST since it is dynamic/subject to have been updated, and therefore not suitable to be put in cache to serve possibly stale data.
		 *  so get it as POST, everytime, from network first if available, then cache what you get back
		 *  on next request if network not available serve fom cache
		 *  => network first, fallback to cache strategy.
		 *  an offline ie. cached version of api.php's response is necessary for when if offline refreshes may be tried.
		 */

		/// try to get api.php from network first - if network not available try to get it from indexedDB
		//fetch('/api.php', {
			//method:'POST', 
			//body:JSON.stringify(payload)
		//})
		//.then(res => res.json())
		//.then(res => {
			//processApiFile(res);
			
			///// cache the response
			//const text = 'randomText';
			//const url = '/api.php';
			//const content = res;
			//filesDB.createEntry(text, url, content, () => {});
		//})
		//.catch((err) => {
			//console.log(err, 'network not available - retrieving filelist from indexedDB')
			///// netork not available - retrieving filelist from indexedDB			
			//filesDB.getFile('/api.php', res => {
				//if(res){
					///// found in indexdb, proceed with getting individual image files...
					//processApiFile(res);				
				//} else {
					//console.log(err, 'Error: api.php filelist was not available in indexedDB')
				//}
			//})	
		//});
		
		


	};
	filesDB.open(() =>	filesDB.fetchFiles(onFilesDBopen));	


	/// M init login and register forms
	const elems = document.querySelectorAll('.modal');
	const instances = M.Modal.init(elems, {"onCloseEnd": ()=> {		
		document.querySelector('#loginusername').value = ''
		document.querySelector('#loginpassword').value = ''
		document.querySelector('#loginResult').innerHTML = '';		
	}}); 

	
	/// M init side menu
	const menus = document.querySelectorAll('.side-menu');
	M.Sidenav.init(menus, {edge: 'right'});
	
});

mainContentDiv.addEventListener('click', evt => {
			
	if(evt.target.className === 'box'){ 
		
		dd = boxesArray.indexOf(evt.target);
		
		/// open background
		background.style.display = 'block';
		background.style.opacity = '1';


		/// left pic
		if(dd == 0){
			//imgURLLeft = '/_ah/img/encoded_gs_file:' + data[data.length - 1];
			imgURLLeft = data[data.length - 1];
		} else {
			//imgURLLeft = '/_ah/img/encoded_gs_file:' + data[dd - 1];	
			imgURLLeft = data[dd - 1];	
		}
		//pics[0].style.backgroundImage = `url(${imgURLLeft})`;	
		//pics[0].style.transform = 'translateX(-100%)';	
		
		populateBigPic(imgURLLeft, pics[0]);
		pics[0].style.transform = 'translateX(-100%)';


		/// center pic
		//const imgURL = '/_ah/img/encoded_gs_file:' + data[dd];
		const imgURL = data[dd];
		//pics[1].style.backgroundImage = `url(${imgURL})`;
		//pics[1].style.transform = 'translateX(0%)';
		
		populateBigPic(imgURL, pics[1]);
		pics[1].style.transform = 'translateX(0%)';
		
				
		/// right pic
		if(dd == data.length - 1){
			//imgURLRight = '/_ah/img/encoded_gs_file:' + data[0];
			imgURLRight = data[0];
		} else {
			//imgURLRight = '/_ah/img/encoded_gs_file:' + data[dd + 1];
			imgURLRight = data[dd + 1];
		}		
		//pics[2].style.backgroundImage = `url(${imgURLRight})`;
		//pics[2].style.transform = 'translateX(100%)';
		
		populateBigPic(imgURLRight, pics[2]);
		pics[2].style.transform = 'translateX(100%)';
	}
});

background.addEventListener('click', evt => {
	
	/// zoom to * 1.5 upon click pic
	Gallery.zoom_in(evt.target);
});

toolbar.addEventListener('click', evt => {
	
	/// close image gallery
	if(evt.target === document.querySelector("#toolbar > i:nth-child(1)")){
		background.style.display = 'none';
		background.style.opacity = '0';		
	}
	
	/// make fullscreen
	if(evt.target === document.querySelector("#toolbar > i:nth-child(2)")){
		background.requestFullscreen();
	}
	
	/// left arrow click
	if(evt.target === document.querySelector("#toolbar > i:nth-child(4)")){
		Gallery.moveLeft();
	}
	
	/// right arrow click
	if(evt.target === document.querySelector("#toolbar > i:nth-child(3)")){
		Gallery.moveRight();
	}

	/// zoom in
	if(evt.target === document.querySelector("#toolbar > i:nth-child(5)")){
		Gallery.zoom_in(pics[1]);
	}
	
	/// zoom out
	if(evt.target === document.querySelector("#toolbar > i:nth-child(6)")){
		Gallery.zoom_out(pics[1]);
	}
	
	/// zoom default size
	if(evt.target === document.querySelector("#toolbar > i:nth-child(7)")){
		pics[1].style.transform =  'scale(1)';	
	}

	evt.preventDefault();
	evt.stopPropagation();
	return false;
});

document.querySelector('.nav-wrapper').addEventListener('click', () => { 
	
	if(event.target.parentNode.id === 'sideMenuBtn'){
		M.Sidenav.getInstance(document.getElementById('side-menu')).open();
		return
	}
	
	if(event.target.parentNode.id === 'addPictureBtn'){
		if(todoToken){
			document.getElementById("chooser").click();
		} else {
			M.Modal.getInstance(document.getElementById('login')).open();
		}
		return
	}
	
	//if(event.target.parentNode.id === 'reloadBtn'){
		
		///// reload, en removing any cruft
		//caches.keys()
			//.then(keysArray => {
				//Promise.all(keysArray.map(key => {
					//console.log(key);
					//caches.delete(key);
				//}))
				//.then(() => {
					//console.log('location');
					//location.href = '/';
				//})
			//});

		//return
	//}

	return
})

document.querySelector('#side-menu').addEventListener('click', () => { 
	
	if(event.target.id === 'loginForm'){
		M.Modal.getInstance(document.getElementById('login')).open();
		M.Sidenav.getInstance(document.getElementById('side-menu')).close();
	
		//if(navigator.onLine){
			//M.Modal.getInstance(document.getElementById('login')).open();
		//} else {
			//M.Modal.getInstance(document.getElementById('loginoff')).open();
		//}		
	}
	
	if(event.target.id === 'sideMenu-addPicture'){
		document.getElementById("chooser").click();
		M.Sidenav.getInstance(document.getElementById('side-menu')).close();			
	}
	
	if(event.target.id === 'logoutBtn'){
		const callback = function(user){
			document.querySelector("#side-menu > li:nth-child(1) > a").innerHTML = (user) ? user : 'PicsApp';
			document.getElementById("loginForm").style.display = (user) ? 'none' : 'block';
			document.getElementById("loggedInStuffs").style.display = (user) ? 'block' : 'none';
			
			todoToken = null;
			M.Sidenav.getInstance(document.getElementById('side-menu')).close();		
		}
		
		todoDB.deleteTodo('login.php', callback);
	
		//todoDB.deleteTodo('login.php',  () => {
			//todoToken = null;
			//M.Sidenav.getInstance(document.getElementById('side-menu')).close();
		//});		
	}
	
	if(event.target.id === 'sideMenu-reloadBtn'){

		/// do not attempt a reload whilst offline
		if(!navigator.onLine){
			return;
		}
		
		/// reload, en removing any cruft (actually you only need to clear out static assets, and not all..)
		/** there is an issue here: static assets gets blitzed, ok;
		 *    BUT, on next reload or refresh, it does NOT get re-populated, as was supposed to be by setting location.href to reload page...
		 *    you have to close everything down, and then restart app for sw install event to kick (something about ALL open pages need to be closed etc.etc)
		 *    
		 *    long story short, this is NOT working as intended (to do a complete re-install/refresh - in case app may have been updated and the pwa might still be serving months old content), 
		 *    but works ok on dev developing
		 * 
		 */
		caches.keys().then(keysArray => {
			Promise.all(keysArray.map(key => {
				if(key.indexOf('static-resources') > -1){
					caches.delete(key);
				}				
			}))
			.then(() => {
				location.href = '/';
			})
		});		
	}

	return
});

document.querySelector('#btn_login').addEventListener('click', async () => {

	const username = document.querySelector('#loginusername').value
	const password = document.querySelector('#loginpassword').value

	if(username.length < 6 || password.length < 6){
		document.querySelector('#loginResult').innerHTML = 'Invalid login';
		console.log('login params insufficient length');
		return
	}




	
	/** we would like to cache the return content of login.php - the jwt.
	
	because its a POST request this poses 2 obvious logic problems:
	 - 1. POST requests generally modify data, so you cant multiply modify
	 - 2. POST responses are dynamic based on body content so what do you cache?
	
	a solution to this dilemma is using indexedDB to cache the post request and its response
	but this seems a very detailed and long winded approach, and a bit beyond the current scope. <<<< also done, and took a long breath to cover the long wind.
	
	so for the time being use the obvious and simple solution: localStorage.getItem('jwtTon')   <<<< done, and works
	
	
	workflow:
	- on first time login (if jwt not available) get back jwt and store it.
	- on subsequent requests that require loggedin-ness, check for existence of jwt, if there use it, if not direct to login page.
	
	 */

    let payload = {
	        user: username,
	        pswd: password,
	        doLogin: true
        };   

	const doFetch = async function(){		
		const fetchResponse = await fetch('./login.php', {
								        method: 'POST',
								        credentials:'same-origin',
								        headers: { 'Accept':'application/json', 'Content-Type':'application/json'   },
								        body: JSON.stringify(payload)
								    });
		const text = await fetchResponse.text();
		const res = JSON.parse(text);
		if(res.res === 'bingo'){		
			const text = 'randomText';
			const url = 'login.php';
			const content = res;
			todoDB.createTodo(text, url, content, (todo) => refreshTodos());
			
			setTimeout(()=> {
				M.Modal.getInstance(document.getElementById('login')).close();	
				M.Sidenav.getInstance(document.getElementById('side-menu')).close();							
	
				document.querySelector('#loginusername').value = ''
				document.querySelector('#loginpassword').value = ''
				document.querySelector('#loginResult').innerHTML = '';
			}, 200);
		
		} else {
			document.querySelector('#loginResult').innerHTML = res.res;
		}
	}
	doFetch().catch(err => console.log(err))



	//fetch('./login.php', {
	        //method: 'POST',
	        //credentials:'same-origin',
	        //headers: { 'Accept':'application/json', 'Content-Type':'application/json'   },
	        //body: JSON.stringify(payload)
	    //})
	    //.then(fetchResponse => {
			
			//const fetchResponse2 = fetchResponse.clone();
			
			//fetchResponse.text().then(res => {
				
				////console.log('Response is: ', res);
				
				//res = JSON.parse(res);
				
				//if(res.res === 'bingo'){
					
					////document.querySelector('#loginResult').innerHTML = 'Login success';
					////document.querySelector('#loginResult').innerHTML += '<br>' + res.user
					////document.querySelector('#loginResult').innerHTML += '<br>' + res.jwt


					/////// localStorage
					//////const resp = fetchResponse2.headers.get('Authorization')
					//////localStorage.setItem('token', resp);

									
					//const text = 'randomText';
					//const url = 'login.php';
					//const content = res;
					
					//todoDB.createTodo(text, url, content, (todo) => refreshTodos());
					
					//setTimeout(()=> {
						//M.Modal.getInstance(document.getElementById('login')).close();	
						//M.Sidenav.getInstance(document.getElementById('side-menu')).close();							

						//document.querySelector('#loginusername').value = ''
						//document.querySelector('#loginpassword').value = ''
						//document.querySelector('#loginResult').innerHTML = '';
					//}, 200);
				
				//} else {
					//document.querySelector('#loginResult').innerHTML = res.res;
				//}
			//}).catch(err => console.log(err))

		//})
		//.catch(err => console.log(err))



	return;
	

    

	/// Unsuccessful login.
	if(response['res'] !== 'bingo'){
		document.querySelector('#login .loginerror').innerHTML = 'Invalid login';
		tkn = response['newalgo']
		return		
	}
	
	/// Successful login.
	if(response[1]){
		location.href = response[1];
		return
	}
	
	_user = response['user'];
	document.getElementById("menubtn").removeEventListener('click', loginpage);
	document.getElementById("menubtn").innerHTML = 'menu';
	document.getElementById("menubtn").addEventListener('click', showLogout, false);
	document.getElementById("menubtn").title = 'Logout ' + response['user'];
	cancelLogin()
	
	document.getElementById("addpictureBtn").style.color = 'white';
	
    tkn = response['newalgo'];	
	
});

document.querySelector('#btn_register').addEventListener('click', () => {
	
	/// post send input fields data to backend
	const username = document.querySelector('#regusername').value
	const email = document.querySelector('#regemail').value	
	const password = document.querySelector('#regpassword').value	
	const password2 = document.querySelector('#regpassword2').value	

	console.log('reg button clicked', username, email, password, password2);

    let payload = {
	        user: username,
	        pass: password,
	        pass2: password2,
	        mail: email,
	        doReg: true
        }; 


	fetch('./login.php', {
	        method: 'POST',
	        credentials:'same-origin',
	        headers: { 'Accept':'application/json', 'Content-Type':'application/json'   },
	        body: JSON.stringify(payload)
	    })
	    .then(fetchResponse => {
			
			const fetchResponse2 = fetchResponse.clone();
			
			fetchResponse.text().then(res => {
				
				console.log('Response is: ', res);
				
				res = JSON.parse(res);
				
				if(res.res === 'bingo'){
					
					/// localStorage
					//const resp = fetchResponse2.headers.get('Authorization')
					//localStorage.setItem('token', resp);
					
					const text = 'randomText';
					const url = 'login.php';
					const content = res;
					
					todoDB.createTodo(text, url, content, (todo) => refreshTodos());
					
					M.Modal.getInstance(document.getElementById('register')).close();	
					M.Sidenav.getInstance(document.getElementById('side-menu')).close();
					M.Modal.getInstance(document.getElementById('regsuccess')).open();							
				}
			})
		})
	    .catch(err => console.log(err))


	/// close register form
	M.Modal.getInstance(document.getElementById('register')).close();
});



/// file uploading
document.getElementById("chooser").addEventListener("change", evt => {
	onFileSelection(evt)
})

function onFileSelection(event){

    const files = event.target.files;

    if(!files[0]){ return }

    doUpload(files)
}

function doUpload(files){
    
    const formData = new FormData()
    const progress = document.querySelector('.progress');

	/// file(s)
    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!file.type.match('image.*')) {
            /// Make sure its an image file.
            alert('File "'+file.name+'" is not an image - skipping')
            continue;
        }

        if (file.size > (8*1024*1024)-100000) {
            /// Check file is not too big.
            alert('File "'+file.name+'" is too big. Maximum filesize is 8MB. Skipping.')
            continue;
        }

        formData.append('userfile[]', file);
        formData.append('tkn', todoToken.jwt);
        formData.append('user', todoToken.user);
    }
	
	
	/// construct xhr request object
	var request = (function() {
	    const xhr = new XMLHttpRequest();
	
		xhr.upload.addEventListener("progress", updateProgress);
		xhr.addEventListener("load", transferComplete);
		xhr.addEventListener("error", transferFailed);
		xhr.addEventListener("abort", transferCancelled);	
	
	    xhr.open("POST", '/upload.php', true);
	    xhr.setRequestHeader('Authorization', 'Bearer ' + todoToken.jwt);
	    xhr.setRequestHeader('Accept','application/json'); 
	   // xhr.setRequestHeader('Content-Type','application/json'); 
	    
	    xhr.send(formData); 		
	}());
	
	
	/// (do the) upload functions	
	progress.style.display = 'block';
	
    function updateProgress(evt){
		/// progress indicator
        const percent = (evt.loaded / evt.total) * 100;
		progress.style.width = Math.round(percent) + '%';	
    }
    
    function transferComplete(){

        const res = JSON.parse(this.responseText);

        if(res.res == 'success'){ 
			
			res.picurls.forEach(item => {
				let box = document.createElement('div');
				box.className = 'box';
				box.style.width = PICSIZE + 'px'
				box.style.height = PICSIZE + 'px'

				//let imgURL = `/_ah/img/encoded_gs_file:${item}=s${PICSIZE}`;	
				let imgURL = `${item}=s${PICSIZE}`;	
				box.style.backgroundImage = `url(${imgURL})`			
				
				//mainContentDiv.appendChild(box);
				mainContentDiv.insertBefore(box, mainContentDiv.children[0]);
				boxesArray.push(box);	
				data.push(item);				
			});
			

			progress.style.display = 'none';

			
			/// put the retrieved new pic addresses array into cache
			const picsapi = {}; 
			picsapi.pictures = res.pictures;
			const response = new Response(JSON.stringify(picsapi), {
				ok: true,
				status: 200,
				statusText: 'OK',
				type: 'cors',
				url: '/api.php'
			});

			caches.open( 'dynamic-fetcheds-v1').then(dCache => {					
				dCache.put('/api.php', response);
			});

			//findImages()
			/////// might be useful in place of hardcoding cache name
			//async function findImages() {
				
				///// Get a list of all of the caches for this origin
				//const cacheNames = await caches.keys();
				//const result = [];
				
				//for (const name of cacheNames) {
					///// Open the cache
					//const cache = await caches.open(name);
					
					///// Get a list of entries. Each item is a Request object
					//for (const request of await cache.keys()) {
						
						///// If the request URL matches, add the response to the result
						////if (request.url.endsWith('.png')) {
						//if (request.url === '/api.php') {
							////result.push(await cache.match(request));
							//result.push(await cache.match(request));
							//name.put('/api.php', JSON.stringify(picsapi));
						//}
					//}
				//}
				
				//return result;
			//}

			//To get the names of existing caches, use caches.keys:
			
			//caches.keys().then(function(cacheKeys) { 
			  //console.log(cacheKeys); // ex: ["test-cache"]   ... ["site-static-resources-x5", "site-dynamic-fetcheds-x5"]
			//});
			



	
        } else {
			console.log(this.responseText);
		}
    }
    
    function transferFailed(evt){
        console.log("Upload Failed")
    }
    
    function transferCancelled(evt){
        console.log("yyy Upload Aborted");
    }
    
    function abortUpload(event){
        xhr.abort();              
    }
	
}









/*









window.addEventListener('load', () => {

	console.log('fresh load');
	
})

window.addEventListener('offline', () => {
	/// when you go offline change the status' of things that are connection dependent eg. login action.
});

window.addEventListener('online', () => {
	/// when you go online: action anything that might be pending in indexedDB, change to 'online' connection dependent things	
});












function populateBigPicX(imgURL, pic){
	
	/// first try to get (image) from indexdb
	/// if not there, go to network
	/// if no network, serve default
	
	
	
	imgURL = 'https:' + imgURL;
	
	const callbackfn = function(responseObject){					
		
		if(responseObject){
			/// retrieved from indexedDB
			const objectURL = window.URL.createObjectURL(responseObject);
			pic.style.backgroundImage = `url(${objectURL})`; 
			
			
		} else {
			/// fetch from network
			//fetch('/getpic.php?file=' + imgURL)	    // GET method	
			fetch('/getpic.php', {method:'POST', body:JSON.stringify({api:true,	file:imgURL})} )
			.then(res => {	 
				if(res.url.indexOf('icon-512x512.png') > -1){
					res.blob().then(res => {
						/// set background image as default image
						const objectURL = window.URL.createObjectURL(res);
						pic.style.backgroundImage = `url(${objectURL})`;						
					});
				} else {
					res.blob().then(res => {  
						/// set background image
						const objectURL = window.URL.createObjectURL(res);
						pic.style.backgroundImage = `url(${objectURL})`;
		
						/// put into indexedDB filesDB the "request url" and its "response"						
						const text = 'randomText';
						const url = imgURL; 
						const content = res; 
						filesDB.createEntry(text, url, content, () => {})
					})
				}
			})
			.catch((err) => {                                                   console.log('got from neither:', imgURL);	
				/// failed from indexedDB AND network, so send out default img
				console.log(err);
				pic.style.backgroundImage = '/images/icons/icon-512x512.png';
			})
		}						
	}	

	/// either get it from indexedDB or if that fails, get it from network
	filesDB.getFile(imgURL, callbackfn)	
	
}










		/// try to get api.php from network first - if network not available try to get it from indexedDB
		const getApiPhp = async () => {			
			try{
				console.log('from network');
				return await fetch('/api.php', {method:'POST', 	body:JSON.stringify(payload)}).then(res => res.json())
			} catch (e){
				console.log('from indexeddb');
				return await filesDB.getFile('/api.php',  xxx)   //<<<<<<<<<<<<<<<<<<,,
			}			
		}
		const apiPhpRes = await getApiPhp()
		
		



		//fetch('/api.php', {
			//method:'POST', 
			//body:JSON.stringify(payload)
		//})
		//.then(res => res.json())
		.then(res => {                           console.log('apiPhp:', res);
			processApiFile(res);
			





*/







//function numberMobile(e){
    //e.target.value = e.target.value.replace(/[^\d]/g,'');


		//document.querySelector('#loginResult').innerHTML = '';
		//document.querySelector('#loginpassword').value = '';
		//document.querySelector('#loginusername').value = String.fromCharCode(evt.keyCode);


    //return false;
//}

//document.querySelector('#loginusername').addEventListener('onkeyup', (evt) => {
	
	
	//// keydown/up/press/beforeinput not works on mobile....
	
	////numberMobile(evt)
	
	//if(evt.key.length === 1 && document.querySelector('#loginResult').innerHTML != ''){
		//document.querySelector('#loginResult').innerHTML = '';
		//document.querySelector('#loginpassword').value = '';
		//document.querySelector('#loginusername').value = String.fromCharCode(evt.keyCode);
		//evt.preventDefault();
	//}
//});

//document.querySelector('#loginpassword').addEventListener('onkeyup', (evt) => {
	
	//if(evt.key.length === 1 && document.querySelector('#loginResult').innerHTML != ''){
		//document.querySelector('#loginResult').innerHTML = '';
		//document.querySelector('#loginpassword').value = String.fromCharCode(evt.keyCode);
		//evt.preventDefault();
	//}
//});




//document.querySelector('#logoutTrigger').addEventListener('click', () => {

	//const callback = function(user){
		//document.querySelector("#side-menu > li:nth-child(1) > a").innerHTML = (user) ? user : 'PicsApp';
		//document.getElementById("loginTrigger").style.display = (user) ? 'none' : 'block';
		//document.getElementById("loggedInStuffs").style.display = (user) ? 'block' : 'none';
		
		//todoToken = null;
		//M.Sidenav.getInstance(document.getElementById('side-menu')).close();		
	//}
	
	//todoDB.deleteTodo('login.php', callback);

	////todoDB.deleteTodo('login.php',  () => {
		////todoToken = null;
		////M.Sidenav.getInstance(document.getElementById('side-menu')).close();
	////});
	
//});

//document.querySelector('#sideMenu-addPicture').addEventListener('click', () => {
	//document.getElementById("chooser").click();
	//M.Sidenav.getInstance(document.getElementById('side-menu')).close();	
//});



//document.querySelector('#sideMenu').addEventListener('click', () => {
	//M.Sidenav.getInstance(document.getElementById('side-menu')).open();
//});


//document.querySelector('#addPicture').addEventListener('click', () => {

	///*** on click of this add button we are going to do:
	 //*   - 1. try to retrieve the 'token' from indexeddb
	 //*          - a). if it exists, then user has already been certified and is good to go
	 //*          - b). if not, then direct to login page, following which is successful, we store the response into 'token'
	 //*                so that subsequent clicks on add button will 'check out', and a). above can be executed	 
	//*/

	///// ('add picture is restricted to logged in users only - are you logged in? ....');


	///// using indexedDB variation
	//if(todoToken){
		//document.getElementById("chooser").click();
	//} else {
		//M.Modal.getInstance(document.getElementById('login')).open();
	//}

	///// using localStorage variation
	////if(localStorage.getItem('token')){
		////document.getElementById("chooser").click();
	////} else {
		////M.Modal.getInstance(document.getElementById('login')).open();
	////}
//});


//document.querySelector('#loginTrigger').addEventListener('click', () => {
	
	//M.Modal.getInstance(document.getElementById('login')).open();

	////if(navigator.onLine){
		////M.Modal.getInstance(document.getElementById('login')).open();
	////} else {
		////M.Modal.getInstance(document.getElementById('loginoff')).open();
	////}
//});



