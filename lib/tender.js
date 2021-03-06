/*
	A simple library to interface with the Tender support API.
	
	This library does not cover the entire API. I'm adding convenience methods as I find them useful,
	however, you can always make a raw request via Tender.request. See that method for parameters.
	
	G. Turner
	development@peccaui.com	
*/

Tender = function ( params ) {
	this.token = params.token;
	this.domain = params.domain;
	
	// default to a timeout of two seconds
	this.timeout = 2000;
	
	this.version = '1.06';
};

Tender.prototype.getDiscussion = function ( id, success, error, params ) {	
	params = params || {};
	
	this.request({		
		controller: 'discussions',
		id: id,
		qs: params.qs,
		page: params.page,
		filter: params.filter,
		timeout: 6000,
		onSuccess: success,
		onError: error
	});
};

Tender.prototype.acknowledgeDiscussion = function ( id, success, error ) {	
	this.request({		
		controller: 'discussions',
		action: 'acknowledge',
		id: id,
		method: 'POST',
		onSuccess: success,
		onError: error
	});
};

Tender.prototype.resolveDiscussion = function ( id, success, error ) {	
	this.request({		
		controller: 'discussions',
		action: 'resolve',
		id: id,
		method: 'POST',
		onSuccess: success,
		onError: error
	});
};

Tender.prototype.deleteDiscussion = function ( id, success, error ) {	
	this.request({		
		controller: 'discussions',
		id: id,
		method: 'DELETE',
		onSuccess: success,
		onError: error
	});
};

Tender.prototype.spamDiscussion = function ( id, success, error ) {	
	this.request({		
		controller: 'discussions',
		id: id,
		qs: { type: 'spam' },
		method: 'DELETE',
		onSuccess: success,
		onError: error
	});
};

Tender.prototype.getDiscussionIdFromHref = function ( href ) {
	return href.match( /.*\/(\d+)$/ )[1];
};

Tender.prototype.changeCategoryOfDiscussion = function ( category_id, discussion_id, success, error ) {	
	this.request({
		controller: 'discussions',
		action: 'change_category',
		id: discussion_id,
		qs: { to: category_id },
		method: 'POST',
		onSuccess: success,
		onError: error
	});
};

Tender.prototype.changeQueueOfDiscussion = function ( queue_id, discussion_id, success, error ) {
	this.request({
		controller: 'discussions',
		action: 'queue',
		id: discussion_id,
		qs: { queue: queue_id },
		method: 'POST',
		onSuccess: success,
		onError: error
	});
};

Tender.prototype.postComment = function ( id, comment, resolved, success, error ) {
	var commentData = { body: comment,	resolution: resolved };
	var commentJSON = JSON.stringify( commentData );
	
	if ( !comment ) {
		error = error || this.errorHandler;
		error({
			statusText: "Invalid Reply",
			response: "Your reply cannot be empty."
		});
		
		return;
	}
	
	this.request({
		controller: 'discussions',
		action: 'comments',
		id: id,
		method: 'POST',
		data: commentJSON,
		timeout: 6000,
		onSuccess: success,
		onError: error
	});
};

Tender.prototype.getCategories = function ( success, error, params ) {
	params = params || {};
	params.page = params.page || 1;
	
	this.request({
		controller: 'categories',
		page: params.page,
		onSuccess: success,
		onError: error
	});
};

Tender.prototype.getCompanies = function ( success, error, params ) {	
	params = params || {};
	params.page = params.page || 1;
	
	this.request({
		controller: 'companies',
		page: params.page,
		onSuccess: success,
		onError: error
	});
};

Tender.prototype.getQueues = function ( success, error, params ) {
	params = params || {};
	
	this.request({
		controller: 'queues',
		onSuccess: success,
		onError: error
	});
};

Tender.prototype.getUsers = function ( success, error, params ) {
	params = params || {};
	params.qs = {};
		
	if ( params.email ) {
		params.qs.email = params.email;
	}
	
	this.request({
		controller: 'users',
		qs: params.qs,
		page: params.page,
		filter: params.filter,
		onSuccess: success,
		onError: error
	});
};

Tender.prototype.constructPath = function ( params ) {
	// pre-defined path and query string elements
	var eles = [ 'controller', 'id', 'action' ];
	var query_string_eles = [ 'page', 'filter' ];
	var path = [];
	
	for ( var i = 0, num = eles.length; i < num; i++ ) {
		if ( params[eles[i]] ) {
			path.push( params[eles[i]] );
		}
	}
	
	// allow query string overloading
	if ( params.qs ) {
		for ( var key in params.qs ) {
			params[ key ] = params.qs[ key ];
			query_string_eles.push( key );
		}
	}
	
	var query_string = [];
	for ( var i = 0, num = query_string_eles.length; i < num; i++ ) {
		if ( params[ query_string_eles[i] ] ) {
			query_string.push( query_string_eles[ i ] + '=' + params[ query_string_eles[i] ] );
		}
	}

	var rawPath = path.join( '/' );	
	if ( query_string.length > 0 ) {
		rawPath += '?' + query_string.join( '&' );
	}

	return rawPath;
};

/*
	Tender.request parameters:
	
	method: String containing the HTTP method (defaults to GET)
	controller: The API method (required)
	action: String containing the API method action (optional)
	page: Number of the page to retrieve (defaults to 0)
	filter: String to filter the results by (optional)
	qs: Object containing any additional query string data you'd like to pass
	id: A specific id
	data: Object containing HTTP POST data (optional)
		- currently, for flexibility, we require JSON stringifying prior to sending to request(), if Tender requires it.
*/
Tender.prototype.request = function ( params ) {
	var req = new XMLHttpRequest;
	var method = params.method || 'GET';
	var timeout = params.timeout || this.timeout;
	var postData = params.data;
	
	// always send empty data
	if ( method == 'POST' && !postData ) { 
		postData = '';
	}
	
	var url = 'https://api.tenderapp.com/' + ( params.apiDomain ? '' : this.domain + '/' ) + this.constructPath( params );
	
	req.open( method, url, true ); 
	req.setRequestHeader( 'X-Tender-Auth', this.token );
	req.setRequestHeader( 'Accept', 'application/vnd.tender-v1+json' );
	req.setRequestHeader( 'Content-Type', 'application/json' );
	//req.timeout = timeout;

	req.onreadystatechange = function () {
		if ( req.readyState != 4 ) {
			return;
		}
		
		// ignore JSON parsing errors
		var jsonObj = {};
		try {
			jsonObj = JSON.parse( req.responseText );
		} catch( err ) {}
		
		if ( req.status != 200 && req.status != 201 && req.status != 304 ) {
			
			if ( params.onError ) {	
				
				var errorMessage = typeof jsonObj == 'array' ? jsonObj.pop().join( ' ' ) : req;
				params.onError( errorMessage );
				
			}
			
			return;
		}

		if ( params.onSuccess ) {			
			params.onSuccess( jsonObj );
		}
	}
	
	if ( req.readyState == 4 ) {
		return;
	}
	
	req.send( postData );
	
};

Tender.prototype.successHandler = function ( req ) {};

Tender.prototype.errorHandler = function ( req ) {};

Tender.prototype.nullHandler = function () {};