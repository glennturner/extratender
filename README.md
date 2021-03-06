ExtraTender
================================

A Chrome extension for [Tender](http://tenderapp.com) to enable quick replies within discussion lists via the Tender API.

Why?
----

I love Tender, but clicking through each and every thread, replying and then manually closing the thread really drags down our support ticket efficiency, especially when many of our tickets only require a boilerplate response. 

As I'm a developer that replies directly to our company's users, I found this cumbersome and created *ExtraTender*, which allows us to drill through discussion lists quickly. The quick-reply options cover ~90% of our tickets, and has reduced the amount of time we spend on support tickets drastically. Hopefully it'll help you, too!


Installation
------------

This extension is available via the Chrome Web Store [here](https://chrome.google.com/webstore/detail/extratender/ighlhdmklejilhojoedngmjpfchabfep?hl=en&gl=US).

Upon installation, you'll need to configure your Tender account settings via the *ExtraTender* Extension options. To store your Tender settings, enter your Tender subdomain and API key, both of which can be found via the 'Edit your Tender profile' option.

As *ExtraTender* utilizes the fantastic [fancy-settings](https://github.com/zealotrunner/fancy-settings) framework, all settings are locally stored via your browser (specifically, via localStorage).

Usage
-----

*ExtraTender* is optimized for keyboard use:

- Navigate between threads via 'Tab'
- Open/Close quick-reply via 'Return/Enter' (or by clicking on a discussion item)
- If quick reply is open, you can tab through the reply options

You can also use the following keyboard shortcuts for the active (or first) comment:

- CMD + Control + C: Close the discussion
- CMD + Control + R: Delete the discussion
- CMD + Control + A: Acknowledge the discussion
- CMD + Control + S: Flag the discussion as spam
- CMD + Control + .: Jump to the discussion's permalink for additional options
- CMD + Control + Right Arrow: Jump to the next discussion
- CMD + Control + Left Arrow: Jump to the Prior discussion

Additional Notes
----------------

My normal *Tender* workflow rarely requires re-assigning categories or users, so they aren't part of the tabindex. However, I would like to accommodate those who do so in the future, either via prefs or keyboard shortcuts.

Author
------
G. Turner

Email: development@peccaui.com

Twitter: [@gturner](https://www.twitter.com/gturner)

License
-------

*ExtraTender* is supplied under the Apache 2.0 license. Please see LICENSE.txt for more information.
