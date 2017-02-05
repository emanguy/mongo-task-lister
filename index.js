var express = require('express');
var listApp = express();

var mongoConnection = require('mongodb').MongoClient;

var connectToMongo = new Promise(( resolve, reject ) => 
{
	mongoConnection.connect("mongodb://localhost:27017/listdb", (err, db) =>
			{
				if (err)
				{
					reject(err);
				}
				else
				{
					resolve(db);
				}
			});

});

connectToMongo
	.then((db) =>
		{
			console.log("Received a database object!");

			listApp.get("/lists", (req, res) =>
					{
						var doQuery = new Promise( (resolve, reject) =>
								{

									console.log("Querying the database");

									db.collection( "lists" ).distinct( "name", function(err, results)
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

						doQuery.then( (results) =>
								{
									console.log("Returned list results");

									var resultObj = {
										listNames : results
									};

									res.send(JSON.stringify(resultObj));
								}).catch( (err) =>
								{
									console.log("Failed to connect to DB");
									res.status(503).send('{ "err": "Lost connection to the database." }');
								});
					});

			listApp.put("/add/:listname", (req, res) =>
					{
						var listname = req.params.listname;

						var doQuery = new Promise( (resolve, reject) =>
								{
									db.collection("lists").find( { name: listname } ).count( (err, count) =>
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

						doQuery.then( (count) =>
								{
									return new Promise( (resolve, reject) =>
											{
												db.collection("lists").insert( { name: listname, items: [] }, (err, result) =>
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
								})
								.then( (result) =>
										{
											var response = { message: result };
											res.send(JSON.stringify(response));
										})
								.catch( (err) =>
										{
											var response = { error: err.message };
											res.status(500).send(JSON.stringify(response));
										});
					})

			listApp.listen(3000);
		})
	.catch((err) =>
		{
			console.log("Rejected with error");
		});
