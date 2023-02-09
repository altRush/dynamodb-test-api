const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const app = express();
app.listen(3000, () =>
	console.log('Test dynamoDB API listening on port 3000!')
);
AWS.config.update({
	region: 'eu-west-2',
	endpoint: 'http://localhost:8000'
});
const docClient = new AWS.DynamoDB.DocumentClient();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.set('view engine', 'jade');
app.get('/', function (req, res) {
	res.send({ title: 'Test dynamoDB API Entry Point' });
});
app.get('/cars', function (req, res) {
	const params = {
		TableName: 'Cars',
		ProjectionExpression:
			'#id, #name, #type, #manufacturer, #fuel_type, #description',
		ExpressionAttributeNames: {
			'#id': 'id',
			'#name': 'name',
			'#type': 'type',
			'#manufacturer': 'manufacturer',
			'#fuel_type': 'fuel_type',
			'#description': 'description'
		}
	};
	console.log('Scanning Cars table.');
	docClient.scan(params, onScan);
	function onScan(err, data) {
		if (err) {
			console.error(
				'Unable to scan the table. Error JSON:',
				JSON.stringify(err, null, 2)
			);
		} else {
			res.send(data);
			// print all the Cars
			console.log('Scan succeeded.');
			data.Items.forEach(function (car) {
				console.log(car.id, car.type, car.name);
			});
			if (typeof data.LastEvaluatedKey != 'undefined') {
				console.log('Scanning for more...');
				params.ExclusiveStartKey = data.LastEvaluatedKey;
				docClient.scan(params, onScan);
			}
		}
	}
});
