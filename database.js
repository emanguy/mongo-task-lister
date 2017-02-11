'use strict';

var mongoConnection = require('mongodb').MongoClient;

module.exports = class DatabaseCommunicator
{
	constructor()
	{
		this._dbConnection = null;
	}

	connect(databaseURL)
	{
		return new Promise(( resolve, reject ) => 
		{
			mongoConnection.connect(databaseURL, (err, db) =>
			{
				if (err)
				{
					reject(err);
				}
				else
				{
					this._dbConnection = db;
					resolve(db);
				}
			});

		});
	}

	// Get the to-do lists on the server
	getLists()
	{
		return new Promise( (resolve, reject) =>
		{
			console.log("Querying the database");

			this._dbConnection.collection( "lists" ).find({}, { _id: 0 }).toArray(function(err, results)
			{
				if (err)
				{
					reject(err);
				}
				else
				{
					resolve(results);
				}
			});
		});
	}

	// Add a list
	addList(listname)
	{
		var doQuery = new Promise( (resolve, reject) => 
		{
			this._dbConnection.collection("lists").find( { name: listname } ).count( (err, count) =>
			{
				if (err)
				{
					console.log("Couldn't query the database");
					reject(err);
				}
				else if (count > 0)
				{
					console.log("List name exists");
					reject(new RangeError("A list with this name already exists"));
				}
				else
				{
					resolve(count);
				}
			});
		});

		return doQuery.then( (count) =>
		{
			return this._dbConnection.collection("lists").insertOne( { name: listname, items: [] }).then( (result) =>
			{
				return new Promise( (resolve, reject) => 
				{
					if (result.insertedCount == 1)
					{
						console.log("Added new list: " + listname);
						resolve("Successfully added a new list");
					}
					else
					{
						console.log("Inserted count was wrong: " + result.insertedCount);
						reject(new Error("The database did not accept the change. This should not happpen."));
					}
				});
			});
		});
	}

	// Remove a list
	removeList(listname)
	{
		return this._dbConnection.collection("lists").deleteOne( {name: listname} ).then( (result) =>
		{
			return new Promise( (resolve, reject) =>
			{
				if (result.deletedCount == 1)
				{
					console.log("Successfully deleted list " + listname);
					resolve("Successfully removed the list.");
				}
				else
				{
					console.log("Deleted count was wrong: " + result.deletedCount);
					reject(new Error( "There was not a list with the specified name." ));
				}
			});	
		});
	}
}
