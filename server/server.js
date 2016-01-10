/**
 * Created by niels on 10.01.2016.
 */

// This code only runs on the server
if (Meteor.isServer) {

	// Only fetch data belongs to user
	Meteor.publish("chatlog", function (username,  recipient,  limit) {
		var data;
		var query;

		// check if username is set
		if (!username || !username.length) {
			return null;
		}

		// build query
		if (recipient.match(/^g:.+$/g)) {   // to a group
			query = {
				to: {$not: {$ne: recipient}}
			};
		} else {    // with one person
			query = {
				$or: [  // ANNOT: miniMongo actually has problems with simple "$eq" ... !!! (therefor using dumb $not$ne construct
					{$and: [{from: {$not: {$ne: username}}}, {to: {$not: {$ne: recipient}}}]},   // user->to
					{$and: [{from: {$not: {$ne: recipient}}}, {to: {$not: {$ne: username}}}]}    // to->user
				]
			};
		}

		// admin hack to show all data
		// TODO: security leak ... :)
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

		if (!data) {
			data = this.ready();
		}

		return data;
	});
}
