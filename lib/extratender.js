var ExtraTender = function ( account ) {
	this.enabled = true;
	this.reverseTabs = false;
	this.discussionEleId = 'extratender-discussion';
	this.discussionEleClass = 'extratender';
	this.discussionTextareaId = 'comment_body';
	this.discussionAttrName = 'discussion_id';
	this.discussionClassName = 'discussion-item';
	
	this.version = '0.31';
	
	this.tender = new Tender( account );
	
	if ( this.enabled && document.getElementById( 'discussions' ) ) {
		this.addEvents();
	}
};

ExtraTender.prototype.addEvents = function () {
	this.formatPage();
	
	var discussionItems = document.querySelectorAll( '.' + this.discussionClassName );
	
	for ( var i = 0, num = discussionItems.length; i < num; i++ ) {
	//	discussionItems[i].addEventListener( 'click', this.onDiscussionClick.bind( this ) );
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

ExtraTender.prototype.onDiscussionClick = function ( e ) {
	console.log('DISCUSSION ITEM: ');
	console.log( e );
	
	this.removeDiscussion();
	
	var discussionId = this.getDiscussionId( e.srcElement );
	console.log('DISCUSSION ' + discussionId + ' CLICKED ');
	//this.drawDiscussion( ele );
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
		this.tender.postComment( discussion_id, comment, resolved, this.jumpToNextDiscussion.bind( this, discussion_id ), this.onRequestComplete.bind( this ) );
		
	} else {		
		
		if ( !this.doDiscussionAction( e.srcElement.name, discussion_id ) ) {
			alert( 'Invalid ExtraTender option: ' + e.srcElement.name );
		}
		
		this.onRequestComplete();		
	}
};

ExtraTender.prototype.onRequestStart = function() {
	this.showProgressSpinner();
	
	return true;
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

ExtraTender.prototype.getDiscussionIdFromElement = function ( ele ) {
	return ele.getAttribute( this.discussionAttrName );
};

ExtraTender.prototype.getActiveDiscussionElement = function () {
	return this.getDiscussionIdFromElement( document.activeElement );
};

ExtraTender.prototype.getActiveDiscussionId = function () {
	return this.getDiscussionId();
};

ExtraTender.prototype.getDiscussionId = function ( ele ) {
	var discussion_id = this.getActiveDiscussionElement();
	
	// drill up through parent elements looking for the active discussion id
	if ( !discussion_id ) {	
		var discussion_ele = this.drillUpForDiscussionEle( ele );
		discussion_id = this.getDiscussionIdFromElement( discussion_ele );
	}

	return discussion_id;
};

ExtraTender.prototype.drillUpForDiscussionEle = function ( ele ) {
	ele =  ele || document.activeElement.parentNode;

	var discussion_id;
	while ( !discussion_id && ele) {			
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
	
	console.log('DISCUSSION ELEMENT ELEMENT?');
	console.log( ele );
	return ele;
};

ExtraTender.prototype.removeDiscussionEvents = function () {
	
	// remove handlers
	var commentButtons = document.querySelectorAll('.actionbutton');
	
	for ( var i = 0, num = commentButtons.length; i < num; i++ ) {
		commentButtons[i].removeEventListener('click', this.onButtonClick.bind( this ) );
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

	// get link
	var tabindex = ele.getAttribute( 'tabindex' );
	var link = ele.querySelector( '.discussion h4 a.title' ).href;
	
	// suppress form
	var form = document.querySelector( '#discussions > form');
	form.setAttribute( 'onsubmit', 'return false;' );
	
	this.drawRow();
	
	var discussionId = ele.getAttribute( this.discussionAttrName );
	this.discussion.innerHTML = '<div id="extratender-text" class="original-body"></div><hr /><form name="discussion" onsubmit="return false;">Reply<br /><textarea tabindex="' + tabindex + '" name="extratender-comment" id="' + this.discussionTextareaId + '" class="extratender-comment"></textarea> \
		<div class="extratender-actionbar"><div class="ajaxloader"></div><button class="actionbutton" ' + this.discussionAttrName + '="' + discussionId + '" tabindex="' + tabindex + '" name="resolve" id="resolve_button" value="resolved">Comment &amp; Close<span></span></button> <button class="actionbutton" ' + this.discussionAttrName + '="' + discussionId + '"  tabindex="' + tabindex + '" name="comment" id="comment_button">Comment<span></span></button><button class="actionbutton" ' + this.discussionAttrName + '="' + discussionId + '"  tabindex="' + tabindex + '" name="close" id="close_button">Close<span></span></button> \
		<button class="actionbutton" ' + this.discussionAttrName + '="' + discussionId + '"  tabindex="' + tabindex + '" name="delete" id="delete_button">Delete<span></span></button> \
		<button class="actionbutton" ' + this.discussionAttrName + '="' + discussionId + '"  tabindex="' + tabindex + '" name="spam" id="spam_button">Spam<span></span></button> \
		</div> </form>';
	
	ele.querySelector( '.discussion' ).appendChild( this.discussion );
	this.addDiscussionEvents();
	
	// get discussion data
	this.tender.getDiscussion( discussionId, 
		(function ( json ) {
			var commentsNum = json.comments.length - 1;
			var body = json.comments[ commentsNum ].formatted_body;
			
			// handle full threads
			if ( commentsNum > 0 ) {				
				var comment;
				json.comments.reverse().shift();
				for ( var i = 0, len = json.comments.length; i < len; i++ ) {
					comment = json.comments[i];
					body += '<p class="info">from ' + comment.author_name + ' - ' + comment.created_at + '</p>';
					body += '<div class="original-body">' + comment.formatted_body + '</div>';
					
					if ( i < json.comments.length - 1 ) {
						body += '<hr />';
					}
				}
			}
			
			var extratenderEle = document.getElementById( 'extratender-text' );
			
			if ( extratenderEle ) {
				extratenderEle.innerHTML = body;	
				document.querySelector( '#' + this.discussionTextareaId ).focus();
			}
			
			this.hideProgressSpinner();
			
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
}

ExtraTender.prototype.ifDiscussion = function () {
	return document.getElementById( this.discussionEleId );
};

ExtraTender.prototype.isDiscussion = function ( srcEle ) {
	var classNames = getClassNamesFromEle( srcEle );
	
	for ( var i = 0, num = classNames.length; i < num; i++ ) {
		if ( this.discussionClassName == classNames[i] ) {
			return true;
		}
	}
}

ExtraTender.prototype.formatPage = function () {
	this.setTabs();
}

ExtraTender.prototype.removeDiscussion = function () {
	var discussionEle = this.ifDiscussion();
	
	// re-enable form (for whatever good that'll do)
	var form = document.querySelector( '#discussions > form');
	form.setAttribute( 'onsubmit', 'return true;' );
	
	if ( discussionEle ) {
		discussionEle.parentNode.removeChild( this.ifDiscussion() );
		delete this.discussion;
	}
}

ExtraTender.prototype.removePageFormatting = function () {
	
}

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