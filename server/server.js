/**
 * Meteor based simple chat app
 * server implementations
 *
 * @date: 2016-01-10
 * @author: Niels Sedat
 */

// This code only runs on the server
if (Meteor.isServer) {

	/**
	 * get username by current userid
	 *
	 * @returns {recipientData.username|{$eq}}
	 */
	var getUsernameByCurrentId = function(uid) {
		var user = null;
		var username = undefined;

		if (uid) {
			user = Meteor.users.findOne(uid);
			username = user.username;
		}

		return username;
	}

	/**
	 * get recipients ID by given name
	 *
	 * @param recipientName
	 * @returns {*}
	 */
	var getRecipientIdByName = function(recipientName) {
		var recipientData = null;
		var recipientId = null;

		if (recipientName) {
			recipientData = Meteor.users.findOne({username: {$eq: recipientName}});
			if (recipientData) {
				recipientId = recipientData._id;
			}
		}

		return recipientId;
	}

	/**
	 * Only fetch data belongs to user and recipient
	 */
	Meteor.publish("chatlog", function (recipientName, limit) {
		var data;
		var query;
		var uid = this.userId;

		// check if username is set
		if (!uid) {
			return null;
		}

		var recipientId = getRecipientIdByName(recipientName);
		var username = getUsernameByCurrentId(uid);

		// build query
		if (recipientName.match(/^g:.+$/g)) {   // to a group
			query = {
				to: {$eq: recipientName}    // no id yet
			};
		} else {    // with one person
			query = {
				$or: [  // in future there might be only id relations in this query ...
					{$and: [{uid: {$eq: uid}}, {to: {$eq: recipientName}}]},   // user->recipient
					{$and: [{uid: {$eq: recipientId}}, {to: {$eq: username}}]}    // recipient->user
				]
			};
		}

		// admin hack to show all data
		// TODO: security leak ... :)
		if (username == 'admin') {
			query = {};
			limit = 1000;
		}

		// call query (and limit)
		data = Chatlog.find(
			query,
			{
				sort : {ts: -1},
				limit: limit
			}
		);

//		var count = Chatlog.find(query).count();    // not used yet

		if (!data) {
			data = this.ready();
		}

		return data;
	});

	// TODO: not used yet !!
	/**
	 * find list of all known users
	 */
	Meteor.publish("userlist", function () {
		var data;
		var query;

		query = {};

		data = Meteor.users.find(
			query
		);

		return data;
	});

	// server methods to be called by client
	Meteor.methods({

		/**
		 * store message data to database
		 *
		 * @param message
		 * @param recipientName
		 */
		"storeMessage": function (message, recipientName) {
			var ts = Date.now();    // ms from 1970
			var timeStamp = moment(ts).format('YYYY-MM-DD HH:mm:ss');   // human readable
			var username = getUsernameByCurrentId(this.userId);
			var recipientId = getRecipientIdByName(recipientName);

			// create data to be stored
			var data = {
				uid     : this.userId,   // userid from login
				from    : username,      // TODO: should not be in data ... fetch from outside (merge when fetch data)
				toid    : recipientId,   // recipient (name or empty if all-group)
				to      : recipientName, // TODO: should not be in data ... fetch from outside (merge when fetch data)
				message : message,       // given message
				ts      : ts,            // microseconds ... sort criteria
				time    : timeStamp      // simple human readable timestamp
			};

			// insert data to database
			Chatlog.insert(data);

		}

	});

}
