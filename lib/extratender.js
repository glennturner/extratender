var ExtraTender = function ( account ) {
	this.reverseTabs = false;
	
	this.discussionEleId = 'extratender-discussion';
	this.discussionEleClass = 'extratender';
	this.discussionTextareaId = 'comment_body';
	this.discussionAttrName = 'discussion_id';
	this.discussionClassName = 'discussion-item';
	this.categoryContId = 'extratender-category-container';
	this.categorySelectId = 'extratender-category';
	this.userContId = 'extratender-user-container';
	this.userSelectId = 'extratender-user';
	this.successBlockId = 'extratender-success';
	this.errorBlockId = 'extratender-error';
	this.defaultHideIntv = 5000;
	
	this.version = '0.36';
	
	this.tender = new Tender( account );
	
	if ( document.getElementById( 'discussions' ) ) {
		this.formatPage();
		this.addEvents();
	}
};

ExtraTender.prototype.addEvents = function () {
	
	var discussionItems = document.querySelectorAll( '.' + this.discussionClassName );
	
	for ( var i = 0, num = discussionItems.length; i < num; i++ ) {
		discussionItems[i].addEventListener( 'click', this.onDiscussionClick.bind( this ), true );
	}
}

ExtraTender.prototype.removeEvents = function () {
	this.removePageFormatting();
	
	var discussionItems = document.querySelectorAll( '.' + this.discussionClassName );
	
	for ( var i = 0, num = discussionItems.length; i < num; i++ ) {
		discussionItems[i].removeEventListener( 'click', this.onDiscussionClick.bind( this ) );
	}
}

ExtraTender.prototype.addDiscussionEvents = function () {	
	// add handlers
	var commentButtons = document.querySelectorAll( '.actionbutton' );
	
	for ( var i = 0, num = commentButtons.length; i < num; i++ ) {
		commentButtons[i].addEventListener( 'click', this.onButtonClick.bind( this ) );
	}	
};

ExtraTender.prototype.insertCategoriesAndUsers = function ( discussionId, discussion ) {	
	var currentUserId = this.getActiveQueueFromDiscussion( discussion );
	
	// get and insert categories and users
	this.addCategoryHTML( discussion );
	this.addUserHTML( discussionId, currentUserId );
	this.addSupportUserDiscussionCount( discussion );
};

ExtraTender.prototype.addCategoryHTML = function ( discussion ) {	
	var did = this.getIdFromHref( discussion.href );
	var cid = this.getIdFromHref( discussion.category_href );
	var categoryCont = document.getElementById( this.categoryContId );
	categoryCont.style.display = 'block';
		
	var catSelectEle = document.getElementById( this.categorySelectId );
	catSelectEle.removeEventListener( 'change', this.addCategoryEvents.bind( this, did, cid ) );

	// use pre-cached category data
	if ( this.categoryHTML ) {	
			
		catSelectEle.innerHTML = this.categoryHTML;
		
		var catOption = catSelectEle.querySelector( "option[value='" + cid + "']" );
		var catSelected = catSelectEle.options[ catSelectEle.selectedIndex ];
		catSelected.selected = false;
		catOption.selected = true;
				
		// make sure to remove these event listeners 
		catSelectEle.addEventListener( 'change', this.addCategoryEvents.bind( this, did ) );
	// get categories from server
	} else {
		var catLoader = document.getElementById( 'cats-ajaxloader' );
		catLoader.style.display = 'inline-block';
		
		this.tender.getCategories( (function ( req ) {
			var cats = req.categories;
			catLoader.style.display = 'none';
			
			if ( cats.length > 0 && catSelectEle ) {
				var category_id;
				var selected = '';
				this.categoryHTML = catSelectEle.innerHTML;
				for ( var i = 0, len = cats.length; i < len; i++) {
					category_id = this.getIdFromHref( cats[ i ].href );
					
					selected = category_id == cid ? ' selected="selected" ' : '';
					this.categoryHTML += '<option value="' + category_id + '"' + selected + '>' + cats[ i ].name + '</option>';
				}
				
				catSelectEle.innerHTML = this.categoryHTML;
			}
			
			// make sure to remove these event listeners 
			catSelectEle.addEventListener( 'change', this.addCategoryEvents.bind( this, did ) );
		}).bind( this ));		
	}	
};

ExtraTender.prototype.addCategoryEvents = function ( did, ele ) {
	var cid = ele.srcElement.value;
	this.onRequestStart();
	
	this.tender.changeCategoryOfDiscussion( cid, did, 
		(function ( json ) { 
			// redirect, due to changed discussion id
			window.location.href = window.location.href;
		}).bind( this ), 
		this.onRequestComplete.bind( this )
	);		
};

ExtraTender.prototype.addUserHTML = function ( did, uid ) {	
	
	var userCont = document.getElementById( this.userContId );
	userCont.style.display = 'block';

	var userSelectEle = document.getElementById( this.userSelectId );
	
	// use pre-cached user HTML
	if ( this.userHTML ) { 
		
		userSelectEle.innerHTML = this.userHTML;		
		var userSelected = userSelectEle.options[ userSelectEle.selectedIndex ];
		userSelected.selected = false;
		
		if ( uid ) {
			var userOption = userSelectEle.querySelector( "option[value='" + uid + "']" );
			userOption.selected = true;	
		}
		
	// get user data from the server
	} else {
		var userLoader = document.getElementById( 'users-ajaxloader');
		userLoader.style.display = 'inline-block';
		
		// user assignment is actually handled via queues, so we use that instead.
		this.tender.getQueues( (function ( req ) {
			var users = req.named_queues;			
			var userId;
			userLoader.style.display = 'none';
		
			// add event handlers 
			if ( users.length > 0 && userSelectEle ) {
			
				var selected = '';
				this.userHTML = userSelectEle.innerHTML;
				var user_id;
				for ( var i = 0, len = users.length; i < len; i++) {
					// if user matches, select the option
					user_id = this.getIdFromHref( users[ i ].href );
					selected = uid == user_id ? ' selected="selected" ' : '';
					this.userHTML += '<option value="' + user_id + '"' + selected +'>' + users[ i ].name + '</option>';
				}
			
				userSelectEle.innerHTML = this.userHTML;
			
				// make sure to remove these event listeners 
				userSelectEle.addEventListener( 'change', 
					(function ( ele ) {
						this.onRequestStart();
						var user_id = ele.srcElement.value;
						if ( user_id ) {
							this.tender.changeQueueOfDiscussion( user_id, did, 
								(function () { 
									this.onRequestComplete();
									this.displaySuccessMessage( 'User Changed' );
								}).bind( this ), 
								this.onRequestComplete.bind( this )
							);
						}
					}).bind( this )
				);
			}
		}).bind( this ), this.onRequestError.bind( this ) );
	}
};

ExtraTender.prototype.addSupportUserDiscussionCount = function ( discussion ) {
	var params = {};
	
	// unsupported feature
	return false;
	
	if ( discussion.author_email ) {
		params.email = discussion.author_email;
	}
	
	this.tender.getUsers( 
		(function ( json ) { 
			this.onRequestSuccess();
		}).bind( this ),
		this.onRequestError.bind( this ),
		params
	);
};


ExtraTender.prototype.onDiscussionClick = function ( e ) {	
	// ignore discussion clicks that are part of a form, or are checkable/linkable
	if ( e.srcElement.form || e.srcElement.getAttribute( 'href' ) || e.srcElement.className == 'checkbox' ) {
		return false;
	}
	
	var ele = this.getDiscussionIdFromElement( e.srcElement ) ? e.srcElement : e.srcElement.offsetParent;

	if ( ele ) {
		this.toggleDiscussion( ele );
		ele.focus();
	}
};

ExtraTender.prototype.jumpToNextDiscussion = function ( discussion_id ) {
	var discussionEle = document.querySelector( "li[" + this.discussionAttrName + "='" + discussion_id +"']" );

	this.hideProgressSpinner();

	discussionEle.parentNode.removeChild( discussionEle );
	this.removeDiscussionEvents();			
				
	var nextTabIndex = Number ( discussionEle.getAttribute( 'tabindex' ) ) + 1;
	var nextTab = document.querySelector( ".discussion-item[tabindex='" + nextTabIndex + "']" );

	if ( nextTab ) { 
		this.drawDiscussion( nextTab );
		nextTab.focus();
	}
};

ExtraTender.prototype.onButtonClick = function ( e ) {
		
	var discussion_id = e.srcElement.getAttribute( this.discussionAttrName );
	
	if ( e.srcElement.name == 'comment' || e.srcElement.name == 'resolve' ) { 
		
		var resolved = e.srcElement.name == 'resolve';
		var comment = document.getElementById( this.discussionTextareaId ).value;
		
		this.onRequestStart();		
		this.tender.postComment( discussion_id, comment, resolved, this.jumpToNextDiscussion.bind( this, discussion_id ), this.onRequestError.bind( this ) );
		
	} else {		
		
		if ( !this.doDiscussionAction( e.srcElement.name, discussion_id ) ) {
			alert( 'Invalid ExtraTender option: ' + e.srcElement.name );
		}
		
		this.onRequestComplete();		
	}
};

ExtraTender.prototype.onRequestStart = function () {
	this.showProgressSpinner();
	
	return true;
};

ExtraTender.prototype.onRequestError = function ( error ) { 
	this.displayErrorMessage( error );
	this.onRequestComplete();
};

ExtraTender.prototype.onRequestComplete = function() {
	this.hideProgressSpinner();
};

ExtraTender.prototype.doDiscussionAction = function( action, discussion_id ) {	
	discussion_id = discussion_id || this.getActiveDiscussionId();
	
	// no discussion available
	if ( !discussion_id ) {
		return false;
	}
	
	var actions = {
		'delete': this.deleteDiscussion.bind( this ),
		'spam': this.spamDiscussion.bind( this ),
		'close': this.closeDiscussion.bind( this ),
		'close-confirm': (function ( discussion_id ) {
			if ( confirm( 'Are you sure you want to close this discussion?' ) ) {
				this.closeDiscussion( discussion_id );
			}
		}).bind( this )
	};
	
	// if a discussion and action is available, execute the fn
	if ( discussion_id && actions[ action ] ) { 
		actions[ action ]( discussion_id );
		
		return true;
	}
}

ExtraTender.prototype.deleteDiscussion = function ( discussion_id ) {	
	if ( confirm( 'Are you sure you want to delete this discussion?' ) ) {
		this.tender.deleteDiscussion( discussion_id, this.jumpToNextDiscussion.bind( this, discussion_id ), this.onRequestComplete.bind( this ) );
	} else {
		this.onRequestComplete();
	}
};

ExtraTender.prototype.spamDiscussion = function ( discussion_id ) {	
	if ( confirm( 'Are you sure you want to mark this discussion as spam?' ) ) {
		this.tender.spamDiscussion( discussion_id, this.jumpToNextDiscussion.bind( this, discussion_id ), this.onRequestComplete.bind( this ) );
	} else {
		this.onRequestComplete();
	}
};

ExtraTender.prototype.closeDiscussion = function ( discussion_id ) {	
	this.tender.resolveDiscussion( discussion_id, this.jumpToNextDiscussion.bind( this, discussion_id ), this.onRequestComplete.bind( this ) );
};

ExtraTender.prototype.focusOnCommentTextarea = function () {
	var textarea = document.getElementById( this.discussionTextareaId );
	
	if ( textarea ) {
		textarea.focus();
	}
	
	return textarea;
};

ExtraTender.prototype.focusOnFirstComment = function () {
	var firstDiscussion = document.querySelector( '.' + this.discussionClassName  );
	
	if ( firstDiscussion ) {
		firstDiscussion.focus();
	}
	
	return firstDiscussion;
};

// to look up discussion items by a[href], we need to properly construct them
ExtraTender.prototype.createPermalinkFromDiscussion = function ( discussion, no_domain ) {
	var permalink = discussion.html_href + '-' + discussion.permalink;
	
	if ( no_domain ) {
		var split_char = '/';
		var parts = permalink.split( split_char );
		permalink = split_char + parts.splice( 3 ).join( split_char );
	}
	
	return permalink;
};

ExtraTender.prototype.getDiscussionIdFromElement = function ( ele ) {
	return ele.getAttribute( this.discussionAttrName );
};

ExtraTender.prototype.getActiveDiscussionElement = function () {
	var active = document.activeElement;
	
	if ( !this.isDiscussion( active ) ) {
		active = this.drillUpForDiscussionEle();
	}
	
	return active;
};

ExtraTender.prototype.getActiveDiscussionElementId = function () {
	return this.getDiscussionIdFromElement( document.activeElement );
};

ExtraTender.prototype.getActiveDiscussionId = function () {
	return this.getDiscussionId();
};

ExtraTender.prototype.getIdFromHref = function ( href ) {
	return href.split( '/' ).pop();
};

ExtraTender.prototype.getDiscussionId = function ( ele ) {
	var discussion_id = this.getActiveDiscussionElementId();
	
	// drill up through parent elements looking for the active discussion id
	if ( !discussion_id ) {	
		var discussion_ele = this.drillUpForDiscussionEle( ele );
		discussion_id = this.getDiscussionIdFromElement( discussion_ele );
	}

	return discussion_id;
};

ExtraTender.prototype.getDiscussionEleByHref = function ( href ) {
	var hrefEle = document.querySelector( '.' + this.discussionClassName + " a[href='" + href + "']" );
	
	console.log('HREF ELE: ' + href );
	console.log( hrefEle );
};

ExtraTender.prototype.drillUpForDiscussionEle = function ( ele ) {
	ele =  ele || document.activeElement.parentNode;

	var discussion_id;
	while ( !discussion_id && ele ) {			
		discussion_id = this.getDiscussionIdFromElement( ele );
		
		if ( !discussion_id ) {
			ele = ele.parentNode;
		}
		
		// no more parents, so we'll re-focus on the active element, if it's there.
		if ( !ele.parentNode ) {
			// if it's not, we'll focus on the first comment, if it's there.
			ele = this.focusOnCommentTextarea() || this.focusOnFirstComment();
		}			
	}
	return ele;
};

ExtraTender.prototype.openActiveDiscussion = function () {
	var activeEle = this.getActiveDiscussionElement();	
	var url = activeEle.querySelector( "h4 > a.title");
	
	if ( url ) {
		window.location.href = url;
	}
};

ExtraTender.prototype.removeDiscussionEvents = function () {
	
	// remove handlers
	var commentButtons = document.querySelectorAll( '.actionbutton' );
	
	for ( var i = 0, num = commentButtons.length; i < num; i++ ) {
		commentButtons[i].removeEventListener( 'click', this.onButtonClick.bind( this ) );
	}
	
	this.removeDiscussion();
};


ExtraTender.prototype.hideProgressSpinner = function () {
	var loader = document.querySelector( '.ajaxloader' );
	
	if ( loader ) {
		loader.style.display = 'none';
	}
};

ExtraTender.prototype.showProgressSpinner = function () {
	var loader = document.querySelector( '.ajaxloader' );
	
	if ( loader ) {
		loader.style.display = 'inline-block';
	}
};

ExtraTender.prototype.drawBlankRow = function () {
	this.drawRow();
	
	this.discussion.innerHTML = '<p>Congratulations, there are no pending discussions!</p>';
};

ExtraTender.prototype.drawRow = function () {	
	this.discussion = document.createElement( 'div' );
	this.discussion.setAttribute( 'id', this.discussionEleId );
	this.discussion.setAttribute( 'class', this.discussionEleClass );
};

ExtraTender.prototype.drawDiscussion = function ( ele, onSuccess, onError ) {
	// if no ele is passed, look for an open discussion
	ele = ele || this.drillUpForDiscussionEle();
	
	// get link
	var tabindex = ele.getAttribute( 'tabindex' );
	var link = ele.querySelector( '.discussion h4 a.title' ).href;
	
	// suppress form
	var form = document.querySelector( '#discussions > form');
	form.setAttribute( 'onsubmit', 'return false;' );
	
	this.drawRow();
	
	var discussionId = ele.getAttribute( this.discussionAttrName );
	this.discussion.innerHTML = '<form name="discussion" onsubmit="return false;"><div id="extratender-text" class="original-body"></div><hr /><div id="extratender-form"><div><label for="' + this.discussionTextareaId + '">Reply</label> \
		<div id="cats-ajaxloader" class="loader"></div> \
		<span id="' + this.userContId + '" class="hide"> \
			<select name="' + this.userSelectId + '" id="' + this.userSelectId + '"> \
				<option value="">Assign to a User</option> \
			</select> \
		</span> \
		<div id="users-ajaxloader" class="loader"></div> \
		<span id="' + this.categoryContId + '" class="hide"> \
			<select name="' + this.categorySelectId + '" id="' + this.categorySelectId + '"> \
				<option value="">Select a Category</option> \
			</select> \
		</span> \
		</div><textarea tabindex="' + tabindex + '" name="extratender-comment" id="' + this.discussionTextareaId + '" class="extratender-comment"></textarea> \
		<div class="extratender-actionbar"><div class="ajaxloader"></div><button class="actionbutton" ' + this.discussionAttrName + '="' + discussionId + '" tabindex="' + tabindex + '" name="resolve" id="resolve_button" value="resolved">Comment &amp; Close<span></span></button> <button class="actionbutton" ' + this.discussionAttrName + '="' + discussionId + '"  tabindex="' + tabindex + '" name="comment" id="comment_button">Comment<span></span></button><button class="actionbutton" ' + this.discussionAttrName + '="' + discussionId + '"  tabindex="' + tabindex + '" name="close" id="close_button">Close<span></span></button> \
		<button class="actionbutton" ' + this.discussionAttrName + '="' + discussionId + '"  tabindex="' + tabindex + '" name="delete" id="delete_button">Delete<span></span></button> \
		<button class="actionbutton" ' + this.discussionAttrName + '="' + discussionId + '"  tabindex="' + tabindex + '" name="spam" id="spam_button">Spam<span></span></button> \
		</div> \
		</div> </form>';
	
	ele.querySelector( '.discussion' ).appendChild( this.discussion );
	this.addDiscussionEvents();
	
	
	// get discussion data
	this.onRequestStart();
	this.tender.getDiscussion( discussionId, 
		(function ( json ) {
			
			var commentsNum = json.comments.length - 1;
			var body = '';
			
			this.insertCategoriesAndUsers( discussionId, json );
			
			var extratenderEle = document.getElementById( 'extratender-text' );
			
			// handle full threads
			if ( commentsNum >= 1 ) {				
				var comment;
				
				body += '<ul class="extratender-comments">';
				var num = commentsNum + 1;
				for ( var i = commentsNum; i >= 0; i-- ) {
					// get nums
					if ( json.comments[ i ].system_message ) { num -= 1; } 
				}
				
				for ( var i = commentsNum; i >= 0; i-- ) {
					// don't display system messages
					if ( json.comments[ i ].system_message ) { continue; }
					
					comment = json.comments[ i ];
					body += '<li class="extratender-comment"><p class="meta"><span class="number">' + num + '</span> Posted by ' + comment.author_name + ' on ' + this.displayDate( comment.created_at ) + '</p>';
					body += '<div class="original-body">' + comment.formatted_body + '</div></li>';
					
					num -= 1;
				}
				
				body += '</ul>';
			} else {
				body = json.comments[ commentsNum ].formatted_body;
			}
			
			
			if ( extratenderEle ) {
				extratenderEle.innerHTML = body;	
				document.getElementById( this.discussionTextareaId ).focus();
			}
			
			this.onRequestComplete();
			
			// check the discussion for autofill
			if ( onSuccess ) {
				onSuccess();
			}
		}).bind(this),
		// an error occurred
		(function ( err ) {
			if ( confirm( 'The discussion could not be retrieved (' + err.status + '). Hide this discussion from being displayed?') ) {
				this.jumpToNextDiscussion( discussionId );
			} else {
				this.hideProgressSpinner();
			}
		}).bind(this)
	);
};

ExtraTender.prototype.ifDiscussion = function ( ele ) {
	ele = ele || document;
	return ele.querySelector( '#' + this.discussionEleId );
};

ExtraTender.prototype.isDiscussion = function ( srcEle ) {
	var classNames = getClassNamesFromEle( srcEle );
	
	for ( var i = 0, num = classNames.length; i < num; i++ ) {
		if ( this.discussionClassName == classNames[i] ) {
			return true;
		}
	}
};

ExtraTender.prototype.getActiveQueueFromDiscussion = function ( discussion ) {	
	// get current queue 
	if ( discussion.cached_queue_list.length > 0 ) {
		return discussion.cached_queue_list.pop();
	}	
};

ExtraTender.prototype.formatPage = function () {
	this.drawNotifyBlock();
	this.checkIfShowDiscussion();
	this.setTabs();
};

ExtraTender.prototype.checkIfShowDiscussion = function () {
	this.argvs = this.getQueryStringArguments();
	
	if ( this.argvs.show ) {
		var ele = this.getDiscussionEleByHref( this.argvs.show ) ;
	}
};

ExtraTender.prototype.getQueryStringArguments = function () {	
	var qs = window.location.search.substr( 1 );
	var pairs = {};
	
	if ( qs ) {
		var eles = qs.split( '&' );
		var k, kp, p;
		
		var keyMatch = new RegExp( '^et\\[(.*?)\\]' );
		for ( var i = 0, len = eles.length; i < len; i++ ) {
			kp = eles[i].split( '=' );
			
			if ( k = keyMatch.exec( kp[0] ) ) {
				pairs[ k[1] ] = kp[ 1 ];
			}
		}
		
	}
	
	return pairs;
};

ExtraTender.prototype.removeDiscussion = function () {
	var discussionEle = this.ifDiscussion();
	
	// re-enable form (for whatever good that'll do)
	var form = document.querySelector( '#discussions > form');
	form.setAttribute( 'onsubmit', 'return true;' );
	
	if ( discussionEle ) {
		discussionEle.parentNode.removeChild( this.ifDiscussion() );
		delete this.discussion;
	}
};

ExtraTender.prototype.removePageFormatting = function () {
	
}

ExtraTender.prototype.drawNotifyBlock = function () {
	var wrapEle = document.querySelector( '#wrap #toolbar' );
	
	var notifyBlockEle = document.createElement( 'div' );
	notifyBlockEle.setAttribute( 'id', 'extratender-notify' );
	notifyBlockEle.innerHTML = '<h4 id="' + this.successBlockId + '" class="">Status</h4><h4 id="extratender-error" class="">Error</h4>';
	wrapEle.appendChild( notifyBlockEle );
	
};

ExtraTender.prototype.displayDate = function ( d ) {
	var date = new Date( d );	
	
	var months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec' ];
	
	var meridian = ( date.getHours() > 11 ) ? 'PM' : 'AM';

	var day = date.getDate();
	day = ( day < 10 ) ? ( '0' + day ) : day;

	var hour = date.getHours();
	hour = ( hour > 11 ) ? ( hour - 12 ) : hour;

	var minutes = date.getMinutes();
	minutes = ( minutes < 10 ) ? ( '0' + minutes ) : minutes;
	
	// July 08, 2013 @ 07:00 PM
	return months[ date.getMonth() ] + ' ' + day + ', ' + ( date.getYear() + 1900 ) + ' @ ' + hour + ':' + minutes + ' ' + meridian;
};

ExtraTender.prototype.displaySuccessMessage = function ( msg ) {
	var notifyEle = document.getElementById( this.successBlockId );
	
	notifyEle.innerHTML = msg;
	this.hideBlock( notifyEle );
};

ExtraTender.prototype.displayErrorMessage = function ( msg ) {
	var notifyEle = document.getElementById( this.errorBlockId );
	
	notifyEle.innerHTML = msg;
	this.hideBlock( notifyEle );
};

/* lazy animation */
ExtraTender.prototype.hideBlock = function ( ele, intv ) {
	intv = intv || this.defaultHideIntv;
	
	ele.className = 'alert';	
	var timeout = setTimeout( function () {
		ele.className = '';
		clearTimeout( timeout );
	}, intv);
};

ExtraTender.prototype.setTabs = function () {
	
	var discussions = document.querySelectorAll( '.messagelist .' + this.discussionClassName );

	if ( !discussions || !discussions.length ) { return false; }
	
	var tabindexValue = 0;
	var firstEle;
	for ( var i = 0, num = discussions.length; i < num; i++ ) {
		tabindexValue = this.reverseTabs ? ( num - i ) : ( tabindexValue + 1 );
		discussions[i].setAttribute( 'tabindex', tabindexValue );
		
		//discussions[i].setAttribute( 'onblur', 
		//	"var e=document.getElementById( '" + this.discussionEleId + "' );if(e){e.parentNode.removeChild( document.getElementById( '" + this.discussionEleId + "' ));}"
		//);
		
		if ( tabindexValue == 1 ) {
			firstEle = discussions[i];
		}
	}
	
	if ( firstEle ) {
		firstEle.focus();
	} else {
	}
}

ExtraTender.prototype.toggle = function () {
	// create tab-able discussions
	
	if ( isSpeedyMode() ) {
		this.addEvents();
	} else {
		this.removeEvents();
	}
	
}

ExtraTender.prototype.toggleDiscussion = function ( srcEle ) {
	if ( this.ifDiscussion() ) {
		this.removeDiscussion();
	} else {
		this.drawDiscussion( srcEle );
	}
}