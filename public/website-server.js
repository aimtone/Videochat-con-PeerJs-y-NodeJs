var fs      = require('fs');
var http    = require('http');
var https   = require('https');
var path    = require("path");
var os      = require('os');
var ifaces  = os.networkInterfaces();
var express = require('express');
var app     = express();

var privateKey  = fs.readFileSync('./../certificates/key.pem', 'utf8');
var certificate = fs.readFileSync('./../certificates/cert.pem', 'utf8');
var credentials = {key: privateKey, cert: certificate};

var httpServer  = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0;

    ifaces[ifname].forEach(function (iface) {

        if ('IPv4' !== iface.family || iface.internal !== false) {
            return;
        }

        if (alias >= 1) {
            console.log("Multiple ipv4 addreses were found ... ");
            // this single interface has multiple ipv4 addresses
            console.log(ifname + ':' + alias, "https://"+ iface.address + ":8443");
        } else {
            // this interface has only one ipv4 adress
            console.log(ifname, "https://"+ iface.address + ":8443");
        }

        ++alias;
    });
});

var LANAccess = "0.0.0.0";
httpServer.listen(8080, LANAccess);
httpsServer.listen(443, LANAccess);

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname+'/index.html'));
});

app.use('/resources', express.static('./source'));
app.use('/sounds', express.static('./sounds'));