var todoDB = (function() {

	var tDB = {};
	var datastore = null;
	

	/**
	 * Open a connection to the datastore.
	 */
	tDB.open = function(callback) {
		
		var version = 1;                                   // Database version.
		var request = indexedDB.open('todos', version);    // Open a connection to the datastore.  /// database name todos
		request.onupgradeneeded = function(e) {            // Handle datastore upgrades.
			var db = e.target.result;

			e.target.transaction.onerror = tDB.onerror;

			// Delete the old datastore.
			if (db.objectStoreNames.contains('todo')) {
				db.deleteObjectStore('todo');
			}

			// Create a new datastore.
			var store = db.createObjectStore('todo', {                  /// 'table' name
				keyPath: 'url'                                          /// keyPath is: 'column' that will be looked up? (one of properties in object)
			});
		};

		request.onsuccess = function(e) {                  // Handle successful datastore access.
			// Get a reference to the DB.
			datastore = e.target.result;
			
			// Execute the callback.
			callback();
		};

		request.onerror = tDB.onerror;                     // Handle errors when opening the datastore.
	}
	
	tDB.getTodo = function(searchFor, callback){  
		
		var db = datastore;
		var transaction = db.transaction(["todo"]);
		var objectStore = transaction.objectStore("todo");
		var request = objectStore.get(searchFor);
		
		request.onerror = function(evt) { 
		  // Handle errors!
		   tDB.onerror;
		};
		
		request.onsuccess = function(evt) {

			if(request.result){
				todoToken = request.result.responseContent; 
				callback(todoToken.user);
				
			} else {
				todoToken = null;
				callback(todoToken);
			}
		};
	}




	/**
	 * Fetch all of the todo items in the datastore.
	 * @param {function} callback A function that will be executed once the items
	 *                            have been retrieved. Will be passed a param with
	 *                            an array of the todo items.
	 */
	tDB.fetchTodos = function(callback) {
		var db = datastore;
		//var transaction = db.transaction(['todo'], 'readwrite');        /// should not be readonly? we're just fetching..
		var transaction = db.transaction(['todo'], 'readonly');        /// should not be readonly? we're just fetching..
		var objStore = transaction.objectStore('todo');

		var keyRange = IDBKeyRange.lowerBound(0);
		var cursorRequest = objStore.openCursor(keyRange);

		var todos = [];

		transaction.oncomplete = function(e) {
			// Execute the callback function.
			callback(todos);
		};

		cursorRequest.onsuccess = function(e) {
			var result = e.target.result;
			
			if (!!result == false) {
				return;
			}
			
			todos.push(result.value);

			result.continue();
		};

		cursorRequest.onerror = tDB.onerror;
	};




	/**
	 * Create a new todo item.
	 * @param {string} text The todo item.
	 */
	tDB.createTodo = function(text, url, content, callback) {
		// Get a reference to the db.
		var db = datastore;

		// Initiate a new transaction.
		var transaction = db.transaction(['todo'], 'readwrite');

		// Get the datastore.
		var objStore = transaction.objectStore('todo');

		// Create a timestamp for the todo item.
		var timestamp = new Date().getTime();
		
		// Create an object for the todo item.
		var todo = {
			'text': text,
			'timestamp': timestamp,
			'url': url,
			'responseContent': content
		};

		// Create the datastore request.
		var request = objStore.put(todo);

		// Handle a successful datastore put.
		request.onsuccess = function(e) {
			// Execute the callback function.
			callback(todo);
		};

		// Handle errors.
		request.onerror = tDB.onerror;
	};




	/**
	 * Delete a todo item.
	 * @param {int} id The timestamp (id) of the todo item to be deleted.
	 * @param {function} callback A callback function that will be executed if the 
	 *                            delete is successful.
	 */
	tDB.deleteTodo = function(id, callback) {
		var db = datastore;
		var transaction = db.transaction(['todo'], 'readwrite');
		var objStore = transaction.objectStore('todo');
		
		var request = objStore.delete(id);
		
		request.onsuccess = function(e) {
			callback();
		}
		
		request.onerror = function(e) {
			console.log(e);
		}
	};



	// Export the tDB object.
	return tDB;
}());



var filesDB = (function() { 
	
	var fDB = {};
	var datastore = null;
	
	/// open a connection
	fDB.open = function(callback) {
		
		var version = 1;                                   // Database version.
		var dbName = 'picFiles' ;                         
		var collectionName = 'picTable' ;                         

		var request = indexedDB.open(dbName, version);     // Open a connection to the datastore.  /// database name todos
		request.onupgradeneeded = function(e) {            // Handle datastore upgrades.
			var db = e.target.result;

			e.target.transaction.onerror = fDB.onerror;

			// Delete the old datastore.
			if (db.objectStoreNames.contains(collectionName)) {
				db.deleteObjectStore(collectionName);
			}

			// Create a new datastore.
			var store = db.createObjectStore(collectionName, {          /// 'table' name
				keyPath: 'url'                                          /// keyPath is: 'column' that will be looked up? (one of properties in object)
			});
		};

		request.onsuccess = function(e) {                  // Handle successful datastore access.
			// Get a reference to the DB.
			datastore = e.target.result;
			
			// Execute the callback.
			callback();
		};

		request.onerror = fDB.onerror;                     // Handle errors when opening the datastore.
	}	
	

	/// get a single item
	fDB.getFile = function(searchFor, callback){  
		
		var db = datastore;
		var collectionName = 'picTable' ;
		var transaction = db.transaction([collectionName]);
		var objectStore = transaction.objectStore(collectionName);
		var request = objectStore.get(searchFor);
		
		request.onerror = function(evt) { 
		  // Handle errors!
		   fDB.onerror;
		};
		
		request.onsuccess = function(evt) {

			if(request.result){             
				//const responseObject = 
				//todoToken = request.result.responseContent; 
				callback(request.result.responseContent);
				//console.log('dbresponse',request.result.responseContent);
				
			} else {
				//todoToken = null;
				//callback(todoToken);
				responseObject = null
				//console.log('filesdb is empty');
				callback(null);
				//callback('9876');
			}

       // objectRequest.onsuccess = function(event) {
          //if (request.result) resolve(request.result);
          //else reject(Error('object not found'));
        //};



		};
	}


	/// get all items
	fDB.fetchFiles = function(callback) {
		var db = datastore;
		var collectionName = 'picTable' ;
		var transaction = db.transaction([collectionName], 'readonly'); 
		var objStore = transaction.objectStore(collectionName);

		var keyRange = IDBKeyRange.lowerBound(0);
		var cursorRequest = objStore.openCursor(keyRange);

		var files = [];

		transaction.oncomplete = function(e) {
			// Execute the callback function.
			callback(files);
		};

		cursorRequest.onsuccess = function(e) {
			var result = e.target.result;
			
			if (!!result == false) {
				return;
			}
			
			files.push(result.value);

			result.continue();
		};

		cursorRequest.onerror = fDB.onerror;
	};


	/// new entry
	fDB.createEntry = function(text, url, content, callback) {
		// Get a reference to the db.
		var db = datastore;
		var collectionName = 'picTable';

		// Initiate a new transaction.
		var transaction = db.transaction([collectionName], 'readwrite');

		// Get the datastore.
		var objStore = transaction.objectStore(collectionName);

		// Create a timestamp for the todo item.
		var timestamp = new Date().getTime();
		
		// Create an object for the todo item.
		var entry = {
			'text': text,
			'timestamp': timestamp,
			'url': url,
			'responseContent': content
		};

		// Create the datastore request.
		var request = objStore.put(entry);

		// Handle a successful datastore put.
		request.onsuccess = function(e) {
			// Execute the callback function.
			callback(entry);
		};

		// Handle errors.
		request.onerror = fDB.onerror;
	};


	/// delete entry
	fDB.deleteEntry = function(id, callback) {
		var db = datastore;
		var collectionName = 'picTable';
		var transaction = db.transaction([collectionName], 'readwrite');
		var objStore = transaction.objectStore(collectionName);
		
		var request = objStore.delete(id);
		
		request.onsuccess = function(e) {
			callback();
		}
		
		request.onerror = function(e) {
			console.log(e);
		}
	};


	return fDB;
}());
