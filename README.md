# simplechat

Requirements:
- chat
- secure
- any device (web, mobile)
- only a prototype to see its potential

So I had some well known apps in mind and some technology to use probably (WebRTC, HTML5, XMPP/Jabber, Phonegap, Angular.js, Firebase->Cordova).<br />
After some minutes of research I found *Meteor*.<br />
I was aware of Meteor since the last two years - but never used this framework before this little challenge.<br />

I think using "Meteor" will be one of my favorite solution to act with ...<br />
https://www.codementor.io/meteor/tutorial/getting-started-with-meteor-build-sample-app<br />
https://github.com/dasniko/meteor-chat<br />
Meteor based great chat: Rocket.Chat (github)<br />
Meteor may use Cordova for creating Apps<br />

#### install/run
- install meteor <https://www.meteor.com/install>
- clone this repo
- run meteor
- have fun :) <http://localhost:3000>

#### features
- simple login - simple username/password (in future it might use one or more of the multiple auth methods offered by meteor)
- 1:1 chats - simply give receipients name
- group chats - use "g:" as prefix for a dynamically generated group
- using few of the bells and whistles from meteor (eg. spacebars, events, database, ...)
- few lines of code (HTML, JS, CSS) - only to demonstrate its potential

#### keep in mind for future development:
- security (SSH-connection?)
- desktop and mobile notifications (popups, with phonegap?!)

#### some words about development, inventions, wheels and the rest
As a lazy developer (or especially as an senior application engineer) I would not like to reinvent the wheel.<br />
I'd like to invent new things and not "me too" ones...<br />
It might be some fun to do development for this challenge from scratch ... but why?<br />
Using node, socket.io, HTML5, phonegap and tons of tools (gulp, stylus, ...) ... puhh<br />
... btw: I'll prefer "Signal" for secure and fast chats (text and speech) on mobile devices ... in near future it will be available for web-browser also (beta stage)<br />
