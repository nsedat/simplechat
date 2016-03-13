/**
 * Meteor based simple chat app
 * client implementations
 *
 * @date: 2016-01-10
 * @author: Niels Sedat
 */

// This code only runs on the client
if (Meteor.isClient) {

	/**
	 * setup/defines/defaults
	 */
	var enterKey = 13;                  // ENTER key event
	var tabKey = 9;                     // TAB key event
	var defaultAllGroup = 'g:all';      // default group if none (empty receipient) given
	var maxMessagesToShow = 20;         // maximum messages to be shown

	/**
	 * handle display of chat-log (or usage message)
	 */
	Template.chatlog.helpers({

		/**
		 * generate chat log data (depending on username and recipient aware to server)
		 *
		 * @returns {*}
		 */
		chatlogentry: function () {
			var data = null;

			if (Meteor.userId()) {

				// list filtered by server
				data = Chatlog.find(
					{},
					{
						sort : {ts: -1}
					}
				);
			}

			return data;
		},

		/**
		 * generate info about chat status (username needed, 1:1-chat or group-chat)
		 *
		 * @returns {string}
		 */
		communicationInfo: function () {
			var messageString = '';
			var username;
			var recipient = getRecipient();

			if (Meteor.userId()) {
				var rex = /^g:(.+)$/g;  // starts with "g:"

				username = Meteor.userId().username;
				if (rex.exec(recipient)) {   // to a group
					messageString = `messages in group '${RegExp.$1}' :`;
				} else {
					messageString = `private messages between me (${username}) and user '${recipient}' :`;
				}
			} else {
				messageString = '<span class="orange">...</span>';
			}

			return messageString;
		}
	});

	/**
	 * set/unset "to"-name (user which you want to talk to or empty if open group "ALL")
	 *
	 * @type {{keydown input#recipient: Template.recipient.events.'keydown input#recipient'}}
	 */
	Template.recipient.events = {

		// fetch recipient on ENTER
		'keydown, focusout input#recipient' : function (event) {
			if (Meteor.userId()) {

				// leaves input field with TAB or ENTER or focusout
				if ((event.which == enterKey) || (event.which == tabKey) || (event.type == 'focusout')) {

					// get recipient from input field
					var recipient = document.getElementById('recipient').value.trim();

					// default to group 'all' (g:all) if empty
					if (!recipient) {
						recipient = defaultAllGroup;
					}

					setRecipient(recipient);
				}
			}
		}
	};

	/**
	 * template input event handler
	 * @type {{keydown input#message: Template.input.events.'keydown input#message'}}
	 */
	Template.message.events = {

		// fetch ENTER keystroke and insert message into database
		'keydown input#message' : function (event) {
			if (Meteor.userId()) {

				// only if hit ENTER
				if (event.which == enterKey) {

					// get message text from field
					var message = document.getElementById('message').value.trim();

					if (message != '') {

						var recipientName = getRecipient();
						Meteor.call('storeMessage', message, recipientName);

						// clear input field
						document.getElementById('message').value = '';
					}
				}
			}
		}
	};

	/**
	 * get actual recipient
	 * @returns {V}
	 */
	var getRecipient = function () {
		return Session.get('recipient');
	};

	/**
	 * set actual recipient
	 * @returns {V}
	 */
	var setRecipient = function (recipient) {
		Session.set('recipient', recipient);
	};


	/**
	 * init
	 */
	setRecipient(defaultAllGroup);

	/**
	 * subscribe on autorun (when session vars change)
	 */
	Meteor.autorun(function() {
		Meteor.subscribe('chatlog', getRecipient(), maxMessagesToShow, function() {
			// no handler here yet
		});
	});

	/**
	 * config userauth/login
	 */
	Accounts.ui.config({
		passwordSignupFields: "USERNAME_ONLY"
	});

}
