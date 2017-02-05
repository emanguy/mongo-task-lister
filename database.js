var mongoConnection = require('mongodb').MongoClient;

var dbConnection = null;

module.exports = {};
module.exports.connect = function(databaseURL)
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
					dbConnection = db;
					resolve(db);
				}
			});

		});
};

// Get the names of lists stored in the database
module.exports.getLists = function()
{

	return new Promise( (resolve, reject) =>
			{

				console.log("Querying the database");

				dbConnection.collection( "lists" ).distinct( "name", function(err, results)
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
};

// Add a new list to the database
module.exports.addList = function(listname)
{
	var doQuery = new Promise( (resolve, reject) => 
			{
				dbConnection.collection("lists").find( { name: listname } ).count( (err, count) =>
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
				return new Promise( (resolve, reject) =>
						{
							dbConnection.collection("lists").insert( { name: listname, items: [] }, (err, result) =>
									{
										if (err)
										{
											console.log("Couldn't count properly");
											reject(err);
										}
										else if (result.insertedCount == 1)
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

