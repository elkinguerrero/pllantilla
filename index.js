const request = require('request');
const express = require('express');
const cors = require('cors');
var path = require('path');

let server = express();
server.use(express.static(path.join(__dirname, '/')));
server.use(cors());
server.options('*', cors());

server.get('/service', async (req, res) => {
    console.log('/service')
    const url = req.query.url;

    var clientServerOptions = {
        uri: url,
        body: JSON.stringify(""),
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }

    request(clientServerOptions, function (error, response) {
        res.json(JSON.parse(response.body));
    });

})

server.listen(3002, function(){
    console.log('ingreso puerto 3002')
})