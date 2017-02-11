var express = require('express');
var listApp = express();

var databaseClass = require("./database");
var database = new databaseClass();

database.connect("mongodb://localhost:27017/listdb").then(() =>
{
	console.log("Received a database object!");

	listApp.disable("x-powered-by");

	listApp.get("/lists", (req, res) =>
	{
		database.getLists().then( (results) =>
		{
			console.log("Returned list results");

			var resultObj = {
				lists: results
			};

			res.json(resultObj);
		}).catch( (err) =>
		{
			console.log("Failed to connect to DB");
			res.status(503).json({ err: "Lost connection to the database." });
		});
	});

	listApp.put("/add/:listname", (req, res) =>
	{
		var listname = req.params.listname;
		
		database.addList(listname).then( (result) =>
		{
			var response = { message: result };
			res.json(response);
		}).catch( (err) =>
		{
			var response = { error: err.message };
			res.status(400).json(response);
		});
	});

	listApp.put("/remove/:listname", (req, res) =>
	{
		var listname = req.params.listname;

		database.removeList(listname).then( (result) =>
		{
			var response = { message: result };
			res.json(response);
		}).catch( (err) =>
		{
			var response = { error: err.message };
			res.status(400).json(response);
		});
	})

	listApp.listen(3000);
})
.catch((err) =>
{
	console.log("Rejected with error");
});
