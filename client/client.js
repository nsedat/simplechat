/**
 * Meteor based simple chat app
 * client implementations
 *
 * @date: 2016-01-07
 * @author: Niels Sedat
 */

if (Meteor.isClient) {
	/**
	 * setup/defines/defaults
	 */
	var defaultAllGroup = 'g:all';      // default group if none (empty receipient) given
	var enterKey = 13;                  // ENTER key event
	var tabKey = 9;                     // TAB key event
	var maxMessagesToShow = 20;         // maximum messages to be shown

	/**
	 * bind events
	 */
	Meteor.subscribe('chatlog');

	/**
	 * handle display of chat-log (or message for usage)
	 */
	Template.chatlog.helpers({

		// generate chat log data (depending on username and recipient)
		chatlogentry: function () {
			var data = null;
			var query = {};
			var username = getUsername();
			var recipient = getRecipient();
			var limit = maxMessagesToShow;

			// check if username is set
			if (!username) {
				return null;
			}

			// build query
			if (recipient.match(/^g:.+$/g)) {   // to a group
				query = {
					to: {$not: {$ne: recipient}}
				};
			} else {
				query = {
					$or: [  // ANNOT: miniMongo has actual problem with simple "$eq" ... !!! (therefor using dumb $not$ne construct
						{$and: [{from: {$not: {$ne: username}}}, {to: {$not: {$ne: recipient}}}]},   // user->to
						{$and: [{from: {$not: {$ne: recipient}}}, {to: {$not: {$ne: username}}}]}    // to->user
					]
				};
			}

			// admin hack to show all data
			if (username == 'admin') {
				query = {};
				limit = 1000;
			}

			// call query (and sort)
			data = Chatlog.find(
				query,
				{
					sort : {time: -1},   // sort decending (newest on top)
					limit: limit
				}
			);

			return data;
		},

		// generate info about chat status (username needed, 1:1-chat or group-chat)
		communicationInfo: function () {
			var messageString = '';
			var username = getUsername();
			var recipient = getRecipient();

			if (username) {
				var rex = /^g:(.+)$/g;  // starts with "g:"
				if (rex.exec(recipient)) {   // to a group
					messageString = `messages in group '${RegExp.$1}' :`;
				} else {
					messageString = `private messages between me (${username}) and user '${recipient}' :`;
				}
			} else {
				messageString = '<span class="orange">please type in your username ...</span>';
			}

			return messageString;
		}
	});

	/**
	 * check if username is set
	 * @returns {boolean}
	 */
	usernameIsSet = function() {

		var isSet = false;

		if (getUsername()) {
			isSet = true;
		}

		return isSet;
	};

	/**
	 * template 'recipient' helper
	 */
	Template.recipient.helpers({

		// check if username is set (to display input or not)
		usernameIsSet: function () {
			return usernameIsSet();
		}
	});

	/**
	 * template 'message' helper
	 */
	Template.message.helpers({

		// check if username is set (to display input or not)
		usernameIsSet: function () {
			return usernameIsSet();
		}
	});

	/**
	 * set "user"-name (needed to do actions)
	 *
	 * @type {{keydown input#recipient: Template.recipient.events.'keydown input#recipient'}}
	 */
	Template.username.events = {

		// fetch username on ENTER
		'keydown, focusout input#username': function (event) {

			// leaves input field with TAB or ENTER or focusout
			if ((event.which == enterKey) || (event.which == tabKey) || (event.type=='focusout')) {

				// get username from input field
				var username = document.getElementById('username').value.trim();

				// username changed ?
				if (username != getUsername()) {

					setUsername(username);

					// reset "recipient"
					if (document.getElementById('recipient')) {
						document.getElementById('recipient').value = '';
					}
					setRecipient(defaultAllGroup);
				}
			}
		}
	};

	/**
	 * set/unset "to"-name (user which you want to talk to or empty if open group "ALL")
	 *
	 * @type {{keydown input#recipient: Template.recipient.events.'keydown input#recipient'}}
	 */
	Template.recipient.events = {

		// fetch recipient on ENTER
		'keydown, focusout input#recipient': function (event) {

			// leaves input field with TAB or ENTER or focusout
			if ((event.which == enterKey) || (event.which == tabKey) || (event.type=='focusout')) {

				// get recipient from input field
				var recipient = document.getElementById('recipient').value.trim();

				// default to group 'all' (g:all) if empty
				if (!recipient) {
					recipient = defaultAllGroup;
				}

				setRecipient(recipient);
			}
		}
	};

	/**
	 * template input event handler
	 * @type {{keydown input#message: Template.input.events.'keydown input#message'}}
	 */
	Template.message.events = {

		// fetch ENTER keystroke and insert message into database
		'keydown input#message': function (event) {
			if (getUsername()) {  // only if username is set

				// only if hit ENTER
				if (event.which == enterKey) {

					// get message text from field
					var message = document.getElementById('message').value.trim();

					if (message != '') {

						// create timestamp
						var date = new Date();
						var timeStamp = date.toLocaleDateString() + " " + date.toLocaleTimeString();

						// create data to be stored
						var data = {
							from   : getUsername(),  // username who send message
							to     : getRecipient(), // receipient (name or empty if all-group)
							message: message,        // given message
							time   : Date.now(),     // microseconds ... sort criteria
							ts     : timeStamp       // simple human readable timestamp
						};

						// insert data to database
						Chatlog.insert(data);

						// clear input field
						document.getElementById('message').value = '';
					}
				}
			}
		}
	};


	/**
	 * get actual username
	 * @returns {V}
	 */
	var getUsername = function () {
		return Session.get('username').toLowerCase();
	};

	/**
	 * set current username
	 * @returns {V}
	 */
	var setUsername = function (username) {
		Session.set('username', username.toLowerCase());
	};

	/**
	 * get actual recipient
	 * @returns {V}
	 */
	var getRecipient = function () {
		return Session.get('recipient').toLowerCase();
	};

	/**
	 * set actual recipient
	 * @returns {V}
	 */
	var setRecipient = function (recipient) {
		Session.set('recipient', recipient.toLowerCase());
	};


	/**
	 * init
	 */
	setUsername('');
	setRecipient(defaultAllGroup);
}
