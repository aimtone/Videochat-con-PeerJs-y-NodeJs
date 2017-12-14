
var username = prompt("Introduce tu nombre de usuario", "");
var connectedPeers = {};

var peer = new Peer(username, {
    host: "192.168.0.178",
    port: 9000,
    path: '/peerjs',
    debug: 3,
    config: {
        'iceServers':
            [
                { url: 'stun:stun1.l.google.com:19302' },
                {
                    url: 'turn:numb.viagenie.ca',
                    credential: 'muazkh',
                    username: 'webrtc@live.com'
                }
            ]
    }
});


// Este evento se ejecuta al conectar al usuario al servidor de PeerJS
peer.on('open', function (id) {
    $('#pid').html(id);
});

// Este evento se ejecuta cuando ocurra un error al conectarse al servidor de PeerJS
peer.on('error', function (err) {
    switch (err.type) {
        case 'browser-incompatible':
            alert("browser-incompatible: The client's browser does not support some or all WebRTC features that you are trying to use.");
            break;
        case 'disconnected':
            alert("disconnected: You've already disconnected this peer from the server and can no longer make any new connections on it.");
            break;
        case 'invalid-id':
            alert("invalid-id: The ID passed into the Peer constructor contains illegal characters.");
            break;
        case 'invalid-key':
            alert("invalid-key: The API key passed into the Peer constructor contains illegal characters or is not in the system (cloud server only).");
            break;
        case 'network':
            alert("network: Lost or cannot establish a connection to the signalling server.");
            break;
        case 'peer-unavailable':
            alert("peer-unavailable: The peer you're trying to connect to does not exist.");
            break;
        case 'ssl-unavailable':
            alert("ssl-unavailable: PeerJS is being used securely, but the cloud server does not support SSL. Use a custom PeerServer.");
            break;
        case 'server-error':
            alert("server-error: Unable to reach the server.");
            break;
        case 'socket-error':
            alert("socket-error: An error from the underlying socket.");
            break;
        case 'socket-closed':
            alert("socket-closed: The underlying socket closed unexpectedly.");
            break;
        case 'unavailable-id':
            alert("unavailable-id: The ID passed into the Peer constructor is already taken.");
            break;
        case 'webrtc':
            alert("webrtc: Native WebRTC errors.");
            break;
        default:
            alert("An unexpected error has ocurred");
            break;
    }
});

// Este evento se ejecuta al detectar la llamada de un usuario
peer.on('call', function (call) {
    var acceptsCall = confirm("Videollamada entrante, desea responder?");
    if (acceptsCall) {
        call.answer(window.localStream);
        // Recibir data
        call.on('stream', function (stream) {
            // Guardar un referencia global de la informacion transmitida
            window.peer_stream = stream;
            // Muestra la trasmision del usuario conectado en mi camara
            onReceiveStream(stream, 'peer-camera');
        });
        // Se ejecuta cuando la llamada finaliza
        call.on('close', function () {
            alert("The videocall has finished");
        });
    } else {
        console.log("Call denied !");
    }
});


// Este evento se ejecuta cuando se detecta una nueva conexion con un usuario
peer.on('connection', connect);

// Esta funcion se ejecuta cuando un usuario conecta con otro, y se dispara en el evento 'connection'
function connect(c) {

    if (c.label === 'chat') {
        var chatbox = $('<div></div>').addClass('connection').addClass('active').attr('id', c.peer);
        var header = $('<h1></h1>').html(c.peer);
        var messages = $('<div><em>Conectados</em></div>').addClass('messages');

        chatbox.append(header);
        chatbox.append(messages);


        chatbox.on('click', function () {
            if ($(this).attr('class').indexOf('active') === -1) {
                $(this).addClass('active');
            } else {
                $(this).removeClass('active');
            }
        });
        $('.filler').hide();
        $('#connections').append(chatbox);
        c.on('data', function (data) {
            messages.append('<div><span class="peer">' + c.peer + '</span>: ' + data +
                '</div>');
        });
        c.on('close', function () {
            $('#' + c.peer).find('.messages').append("<div>" + c.peer + " ha abandonado el chat</div>");
            //chatbox.remove();
            if ($('.connection').length === 0) {
                $('.filler').show();
            }
            delete connectedPeers[c.peer];
        });
    } else if (c.label === 'file') {
        c.on('data', function (data) {

            if (data.constructor === ArrayBuffer) {
                var dataView = new Uint8Array(data);
                var dataBlob = new Blob([dataView]);
                var url = window.URL.createObjectURL(dataBlob);
                $('#' + c.peer).find('.messages').append('<div><span class="file">' +
                    c.peer + ' te ha enviado un <a target="_blank" href="' + url + '">archivo</a>.</span></div>');
            }
        });
    }
    connectedPeers[c.peer] = 1;
}

$(document).ready(function () {
   

    var box = $('#box');
    box.on('dragenter', doNothing);
    box.on('dragover', doNothing);
    box.on('drop', function (e) {
        e.originalEvent.preventDefault();
        var file = e.originalEvent.dataTransfer.files[0];
        eachActiveConnection(function (c, $c) {
            if (c.label === 'file') {
                c.send(file);
                $c.find('.messages').append('<div><span class="file">Has enviado un archivo.</span></div>');
            }
        });
    });

    // Funcion nula
    function doNothing(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Esta funcion se ejecuta al hacer clic sobre el boton 'conectar'
    $('#connect').click(function () {
        var requestedPeer = $('#rid').val();
        if (!connectedPeers[requestedPeer]) {
            var c = peer.connect(requestedPeer, {
                label: 'chat',
                serialization: 'none',
                metadata: { message: '' }
            });
            c.on('open', function () {
                connect(c);
            });
            c.on('error', function (err) { alert(err); });
            var f = peer.connect(requestedPeer, { label: 'file', reliable: true });
            f.on('open', function () {
                connect(f);
            });
            f.on('error', function (err) { alert(err); });
        }
        connectedPeers[requestedPeer] = 1;
    });

    // Esta funcion se ejecuta al hacer click sobre el boton 'cerrar'
    $('#close').click(function () {
        eachActiveConnection(function (c) {
            c.close();
        });
    });

    // Esta funcion se ejecuta al hacer click sobre el boton enviar
    $('#send').submit(function (e) {
        e.preventDefault();

        var msg = $('#text').val();
        eachActiveConnection(function (c, $c) {
            if (c.label === 'chat') {
                c.send(msg);
                $c.find('.messages').append('<div><span class="you">Tu: </span>' + msg
                    + '</div>');
            }
        });
        $('#text').val('');
        $('#text').focus();
    });


    $("#call").click(function () {
        eachActiveConnection(function (c, $c) {
            var call = peer.call(c.peer, window.localStream);
            call.on('stream', function (stream) {
                window.peer_stream = stream;
                onReceiveStream(stream, 'peer-camera');
            });

            $("hangup").click(function () {
                call.close();
            }, false);
        });
    });

    // Esta funcion controla el envio de datos a todas las conexiones activas
    function eachActiveConnection(fn) {
        var actives = $('.active');
        var checkedIds = {};
        actives.each(function () {
            var peerId = $(this).attr('id');
            if (!checkedIds[peerId]) {
                var conns = peer.connections[peerId];
                for (var i = 0, ii = conns.length; i < ii; i += 1) {
                    var conn = conns[i];
                    fn(conn, $(this));
                }
            }
            checkedIds[peerId] = 1;
        });
    }

    // Solicitar mostrar mi camara
    requestLocalVideo({
        success: function (stream) {
            window.localStream = stream;
            onReceiveStream(stream, 'my-camera');
        },
        error: function (err) {
            alert("Cannot get access to your camera and video !");
            console.error(err);
        }
    });

});

// Esta funcion se ejecuta antes de cerrar el navegador destruyendo la conexion del usuario en el servidor de PeerJS
window.onunload = window.onbeforeunload = function (e) {
    if (!!peer && !peer.destroyed) {
        peer.destroy();
    }
};

function requestLocalVideo(callbacks) {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    navigator.getUserMedia({ audio: true, video: true }, callbacks.success, callbacks.error);
}

function onReceiveStream(stream, element_id) {
    var video = document.getElementById(element_id);
    video.src = window.URL.createObjectURL(stream);
    window.peer_stream = stream;
}
