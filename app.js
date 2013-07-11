// //"/cgi-bin/projects/wordnet/query.pl?word="

var express = require("express");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var format = require('./static/date.format.js');

app.configure(function(){
  app.use('/static', express.static(__dirname + '/static'));
  app.use(express.static(__dirname + '/static'));
});
app.set('view options', { layout: false });

//specify ejs as our template engine.
app.set('view engine', 'ejs');

// special handling of the root folder
app.get("/", function(req, res){
    res.render('game', { locals: {
            hostName: "http://molyjam2013.john-holland.c9.io/"//req.protocol + "://" + req.get('host') + req.url
        }});
    console.log("rendered");
});

io.set('log level', 1);

// startup this server
server.listen(process.env.PORT || 3000);
console.log("ready");

//client name to object map.
var clients = { };
var clientUpdateList = [];

var lastAvailableClientName = 0;

var logWithDate = function(logString) {
    console.log("[" + format.dateFormat() + "] " + logString);
}

//once clients are registered, they setup a data replication loop
//other than that, they respond to new_client, player_dropped, chatted
io.sockets.on("connection", function(socket) {
    socket.on('register', function(data) {
        lastAvailableClientName = lastAvailableClientName + 1;
        var possibleClient = JSON.parse(data);
        var client = { };
        
        if (possibleClient != null) {
            client.data = possibleClient;
            client.data.name = "a" + lastAvailableClientName.toString();
        } else {
            client.data = { name: "a" + lastAvailableClientName.toString() };    
        }
        
        client.socket = socket;
        clients[client.data.name] = client;        
        clientUpdateList.push(client);
        
        socket.emit("registered", client.data.name);
        socket.emit("new_client", JSON.stringify({ newClients: clientUpdateList.filter(function(otherClient) { return otherClient.data.name != client.data.name; })
                                                                               .map(function(otherClient) { return otherClient.data; }) }));
        
        socket.broadcast.emit("new_client", JSON.stringify({ newClients: [client.data] }));
        
        logWithDate("Client Connected: " + client.data.name);
        
        socket.set("clientName", client.data.name, function() {
            socket.on("update", function(data) {
                data = JSON.parse(data);
                socket.get("clientName", function(err, clientName) {
                    
                    if (typeof data.name === 'undefined') {
                        socket.emit("server_error", { message: "Always send clientName!"});
                    }
                    
                    if (!(data.name in clients)) {
                        socket.emit("server_error", { message: "Could not find client with name, " + data.name + " in clients map!"});
                    }
                    
                    //update the data for this client
                    clients[clientName].data = data;
                    
                    socket.emit("updated", JSON.stringify({ entityUpdates: clientUpdateList.map(function(otherClient) { return otherClient.data; }) })); 
                });
            });
            
            socket.on("disconnect", function() {
                socket.get("clientName", function(err, clientName) {
                    if (!(clientName in clients)) {
                        logWithDate("Can't find name in clients list: " + clientName);
                        return;
                    }
                    clientUpdateList.splice(clientUpdateList.indexOf(clients[clientName]), 1);
                    socket.broadcast.emit("player_dropped", clientName);
                    delete clients[clientName];
                    logWithDate("Client Disconnected: " + clientName);
                });
            });
            
            socket.on("chat", function(data) {
               socket.broadcast.emit("chatted", data);
               socket.emit("chatted", data);
            });
        });
    });
});