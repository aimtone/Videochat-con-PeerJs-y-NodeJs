var fs = require('fs');
var PeerServer = require('peer').PeerServer;

var server = PeerServer({
    port: 9000,
    path: '/peerjs',
    ssl: {
        key: fs.readFileSync('./../certificates/key.pem', 'utf8'),
        cert: fs.readFileSync('./../certificates/cert.pem', 'utf8')
    }
});

server.on('connection', function(id) { 
    console.log("Se ha conectado una nueva persona: " + id);
 });

 server.on('disconnect', function(id) { 
    console.log("Se ha desconectado una nueva persona: " + id);
 });
