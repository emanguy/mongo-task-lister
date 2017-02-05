var express = require('express');
var listApp = express();

var database = require("./database");

console.log(database);

database.connect("mongodb://localhost:27017/listdb")
	.then(() =>
		{
			console.log("Received a database object!");

			listApp.get("/lists", (req, res) =>
					{
						database.getLists().then( (results) =>
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
						
						database.addList(listname).then( (result) =>
								{
									var response = { message: result };
									res.send(JSON.stringify(response));
								}).catch( (err) =>
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
