Tender = function ( params ) {
	this.token = params.token;
	this.domain = params.domain;
	
	this.version = '1.01';	
};

Tender.prototype.getDiscussion = function ( id, success, error ) {	
	this.request({		
		controller: 'discussions',
		id: id,
		onSuccess: success,
		onError: error
	});
};


Tender.prototype.resolveDiscussion = function ( id, success, error ) {	
	this.request({		
		controller: 'discussions',
		id: id + '/resolve',
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
		id: id + '?type=spam',
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
		id: discussion_id + '/change_category?to=' + category_id,
		method: 'POST',
		onSuccess: success,
		onError: error
	})
};

Tender.prototype.postComment = function ( id, comment, resolved, success, error ) {
	var commentData = { body: comment,	resolution: resolved };
	var commentJSON = JSON.stringify( commentData );
	
	this.request({
		controller: 'discussions',
		id: id + '/comments',
		method: 'POST',
		data: commentJSON,
		onSuccess: success,
		onError: error
	});
};

Tender.prototype.getCategories = function ( success, error, params ) {
	params = params || {};
	
	this.request({
		controller: 'categories',
		page: params.page,
		onSuccess: success,
		onError: error
	});
};

Tender.prototype.getCompany = function ( success, error, params ) {	
	params = params || {};
	
	this.request({
		controller: 'companies',
		page: params.page,
		onSuccess: success,
		onError: error
	});
};

Tender.prototype.getUsers = function ( success, error, params ) {
	params = params || {};
	
	this.request({
		controller: 'users',
		page: params.page,
		onSuccess: success,
		onError: error
	});
};

Tender.prototype.constructPath = function ( params ) {
	var eles = [ 'controller', 'id' ];
	var path = [];
	
	for ( var i = 0, num = eles.length; i < num; i++ ) {
		if ( params[eles[i]] ) {
			path.push( params[eles[i]] );
		}
	}
	
	var rawPath = path.join( '/' );	
	if ( params.page ) {
		rawPath += '?page=' + params.page;
	}
	
	return rawPath;
};

Tender.prototype.request = function ( params ) {
	var req = new XMLHttpRequest;
	var method = params.method || 'GET';
	var postData = params.data;
	
	// always send empty data
	if ( method == 'POST' && !postData ) { 
		postData = '';
	}
	
	var url = 'https://api.tenderapp.com/' + this.domain + '/' + this.constructPath( params );
	
	req.open( method, url, true ); 
	req.setRequestHeader( 'X-Tender-Auth', this.token );
	req.setRequestHeader( 'Accept', 'application/vnd.tender-v1+json' );
	req.setRequestHeader( 'Content-Type', 'application/json' );

	req.onreadystatechange = function () {
		if ( req.readyState != 4 ) {
			return;
		}
		
		if ( req.status != 200 && req.status != 201 && req.status != 304 ) {
			
			if ( params.onError ) {
				params.onError( req );
			}
			
			return;
		}

		if ( params.onSuccess ) {
			// ignore JSON parsing errors
			var jsonObj = {};
			try {
				jsonObj = JSON.parse( req.responseText );
			} catch( err ) {}
			
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