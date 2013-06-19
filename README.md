ExtraTender
================================

A Chrome extension for [Tender](http://tenderapp.com) to enable quick replies within discussion lists via the Tender API.

Why?
----

I love Tender, but clicking through each and every thread, replying, then manually closing the thread, really drags down our support ticket efficiency, especially when many of our tickets only require a boilerplate response. 

As I'm a developer that replies directly to our company's users, I found this cumbersome and created *ExtraTender*, which allows us to drill through discussion lists quickly. The quick-reply options cover ~90% of our tickets, and has reduced the amount of time we spend on support tickets drastically. Hopefully it'll help you, too!


Installation
------------

As this extension is still a work-in-progress, it has yet to be submitted to the Chrome Store so you'll have to enable Developer mode to use it (check off 'Developer Mode' after opening Windows > Extensions).

Upon installation, you'll need to configure your Tender account settings via the *ExtraTender* Extension options. You'll need to enter in your Tender subdomain and API key, both of which can be found via the 'Edit your Tender profile' option.

As *ExtraTender* utilizes fancy-settings, all settings are stored locally via your browser (specifically, via localStorage). 

Usage
-----

After installation, *ExtraTender* is meant to be navigated via keyboard:

- Navigate between threads via 'Tab'
- Open/Close quick-reply via 'Return/Enter'
- If quick reply is open, you can tab through the reply options

You can also use the following keyboard shortcuts for the active (or first) comment:

- CMD + Control + C: Close the discussion
- CMD + Control + D: Delete the discussion
- CMD + Control + S: Flag the discussion as spam

To-Do
-----

- Improve styling with:
	- reply headers in multi-comment threads
	- from headers in multi-comment threads
	- add zebra-styling to multi-comment threads
- Improve timestamp formatting
- Suppress hrs in multi-comment threads if there's no comment text
- Add onclick support to show/hide quick reply
- Add attachment handling
- Add support for multiple Tenderapps
- Add icon

Author
------
G. Turner
development@peccaui.com

License
-------

*ExtraTender* is supplied under the Apache 2.0 license. Please see LICENSE.txt for more information.
