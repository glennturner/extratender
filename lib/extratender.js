
/*
	ExtraTender functions
*/

var ExtraTender = function ( account ) {
	this.enabled = true;
	this.reverseTabs = false;
	this.discussionEleId = 'extratender-discussion';
	this.discussionEleClass = 'extratender';
	this.version = '0.2';
	
	this.tender = new Tender( account );
	
	if ( this.enabled && document.getElementById( 'discussions' ) ) {
		this.addEvents();
	}
};

ExtraTender.prototype.addEvents = function () {
	this.formatPage();
}

ExtraTender.prototype.closeEvents = function () {
	this.removePageFormatting();
}

ExtraTender.prototype.addDiscussionEvents = function () {	
	// add handlers
	var commentButtons = document.querySelectorAll('.actionbutton');
	
	for ( var i = 0, num = commentButtons.length; i < num; i++ ) {
		commentButtons[i].addEventListener('click', this.onButtonClick.bind( this ) );
	}
		
};

ExtraTender.prototype.jumpToNextDiscussion = function ( discussion_id ) {
	var discussionEle = document.querySelector( "li[discussion_id='" + discussion_id +"']" );

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
		
	var resolved = e.srcElement.name == 'resolve';
	var discussion_id = e.srcElement.getAttribute( 'discussion_id' );
	var comment = document.getElementById( 'comment_body' ).value;
	this.showProgressSpinner();
	
	if ( e.srcElement.name == 'comment' || e.srcElement.name == 'resolve' ) { 
		this.tender.postComment( discussion_id, comment, resolved, this.jumpToNextDiscussion.bind( this, discussion_id ), 
			(function ( req ) {
				this.hideProgressSpinner();			
			}).bind( this )
		);
	} else if ( e.srcElement.name == 'delete' ) {
		if ( confirm( 'Are you sure you want to delete this discussion?' ) ) {
			this.tender.deleteDiscussion( discussion_id, this.jumpToNextDiscussion.bind( this, discussion_id ), 
				(function ( req ) {
					this.hideProgressSpinner();
				}).bind( this )
			);
		}
	} else if ( e.srcElement.name == 'spam' ) {
		if ( confirm( 'Are you sure you want to mark this discussion as spam?' ) ) {
			this.tender.spamDiscussion( discussion_id, this.jumpToNextDiscussion.bind( this, discussion_id ), 
				(function ( req ) {
					this.hideProgressSpinner();
				}).bind( this )
			);
		}
	} else if ( e.srcElement.name == 'close' ) {
		this.tender.resolveDiscussion( discussion_id, this.jumpToNextDiscussion.bind( this, discussion_id ), 
			(function ( req ) {
				this.hideProgressSpinner();
			}).bind( this )
		);
	} else {
		alert( 'Invalid ExtraTender option: ' + e.srcElement.name );
		this.hideProgressSpinner();
	}
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
	
	loader.style.display = 'none';
};

ExtraTender.prototype.showProgressSpinner = function () {
	var loader = document.querySelector( '.ajaxloader' );
	
	loader.style.display = 'inline-block';
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
	
	var discussionId = ele.getAttribute( 'discussion_id' );
	this.discussion.innerHTML = '<div id="extratender-text" class="original-body"></div><hr /><form name="discussion" onsubmit="return false;">Reply<br /><textarea tabindex="' + tabindex + '" name="extratender-comment" id="comment_body" class="extratender-comment"></textarea> \
		<div class="extratender-actionbar"><div class="ajaxloader"></div><button class="actionbutton" discussion_id="' + discussionId + '" tabindex="' + tabindex + '" name="resolve" id="resolve_button" value="resolved">Comment &amp; Close<span></span></button> <button class="actionbutton" discussion_id="' + discussionId + '"  tabindex="' + tabindex + '" name="comment" id="comment_button">Comment<span></span></button><button class="actionbutton" discussion_id="' + discussionId + '"  tabindex="' + tabindex + '" name="close" id="close_button">Close<span></span></button> \
		<button class="actionbutton" discussion_id="' + discussionId + '"  tabindex="' + tabindex + '" name="delete" id="delete_button">Delete<span></span></button> \
		<button class="actionbutton" discussion_id="' + discussionId + '"  tabindex="' + tabindex + '" name="spam" id="spam_button">Spam<span></span></button> \
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
					body += '<hr />';
				}
			}
			
			var extratenderEle = document.getElementById( 'extratender-text' );
			
			if ( extratenderEle ) {
				extratenderEle.innerHTML = body;	
				document.querySelector( '#comment_body' ).focus();
			}
			
			this.hideProgressSpinner();
			
			// check the discussion for autofill
			if ( onSuccess ) {
				onSuccess();
			}
		}).bind(this),
		// an error occurred
		(function ( err ) {
			if ( confirm( 'The discussion could not be retrieved (' + err.responseText + '). Hide this discussion from being displayed?') ) {
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
	
	var discussionClassName = 'discussion-item';
	for ( var i = 0, num = classNames.length; i < num; i++ ) {
		if ( discussionClassName == classNames[i] ) {
			return true;
		}
	}
}

ExtraTender.prototype.formatPage = function () {
	this.setTabs();
}

ExtraTender.prototype.removeDiscussion = function ( ele ) {
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
	
	var discussions = document.querySelectorAll( '.messagelist .discussion-item' );

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
		this.removeDiscussion( srcEle );
	} else {
		this.drawDiscussion( srcEle );
	}
}