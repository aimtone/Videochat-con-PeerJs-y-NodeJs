var db = {
    users: [{
            id: 1,
            username: "anthony",
            nombre: "Anthony",
            apellido: "Medina",
            imagen: "http://www.tuestima.com/wp-content/uploads/2015/11/Entrevista-Dr-Nicholas-Perricone.jpg"
        },
        {
            id: 2,
            username: "juan",
            nombre: "Juan",
            apellido: "Sanchez",
            imagen: "https://labs.openviewpartners.com/wp-content/uploads/2016/02/Mike-King-300x300.png"
        },
        {
            id: 3,
            username: "pedro",
            nombre: "Pedro",
            apellido: "Perez",
            imagen: "http://www.hemorroidestratamientoycura.com/wp-content/uploads/2012/10/doctor.png"
        }
    ],
    connections: [{
            id: 1,
            peers: ["anthony", "juan"]
        },
        {
            id: 2,
            peers: ["anthony", "pedro"]
        },
        {
            id: 3,
            peers: ["pedro", "juan"]
        }
    ],
    conversations: [{
            id: 1,
            connections_id: 1,
            messages: []
        },
        {
            id: 2,
            connections_id: 2,
            messages: []
        },
        {
            id: 3,
            connections_id: 3,
            messages: []
        }
    ]

};

var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
};

function escapeHtml(string) {
    return String(string).replace(/[&<>"'`=\/]/g, function (s) {
        return entityMap[s];
    });
}


ion.sound({
    sounds: [{
            name: "iPhoneRingtone",
            loop: true
        },
        {
            name: "marimba",
            loop: true
        },
        {
            name: "ping"
        },
        {
            name: "repique",
            loop: true
        }
    ],
    volume: 0.5,
    path: "sounds/",
    preload: true
})


new PerfectScrollbar('#message-box');
new PerfectScrollbar('#user-section');
var toggle = false;
var timer;
var llamadaContestada;

$(function () {



    $('#toggleInfo').click(function () {
        if (toggle) {
            $("#camera-section").animate({
                left: "-=350",
                width: "toggle"
            }, 100, function () {
                toggle = false;
                $('#chatbox-section').removeClass('col-lg-9');
                $('#chatbox-section').addClass('col-lg-6');
            });
        } else {
            $("#camera-section").animate({
                left: "+=350",
                width: "toggle"
            }, 100, function () {
                toggle = true;
                $('#chatbox-section').removeClass('col-lg-6');
                $('#chatbox-section').addClass('col-lg-9');
            });
        }

    });


    var username = prompt("Introduce tu nombre de usuario", "");
    var me;
    $.each(db.users, function (key, value) {

        if (value.username == username) {
            me = value;
        }
    });

    console.log(me);

    // Cargar las conversaciones
    $.each(db.connections, function (key, value) {
        $.each(value.peers, function (key1, value1) {
            if (value1 == username) {
                $.each(value.peers, function (key2, value2) {
                    if (value2 != username) {
                        var id_conversation = value.id;
                        $.each(db.users, function (key3, value3) {

                            if (value3.username == value2) {
                                $("#user-section").append("<div id='" +
                                    value3.username +
                                    "' class='media user " +
                                    id_conversation +
                                    "'> <img class='mr-3 rounded-circle' width='64' height='64' src='" +
                                    value3.imagen +
                                    "' alt='Generic placeholder image'> <div class='media-body'> <h5 class='mt-0'>" +
                                    value3.nombre + " " + value3.apellido +
                                    " <small>(" + value3.username +
                                    ")</small> </h5> <span id='last_message'></span> </div><button type='button' class='close' aria-label='Close'> <span aria-hidden='true'>&times;</span> </button> </div>"
                                );
                            }
                        });


                    }
                });
            }
        });

    });


    var connectedPeers = {};

    var peer = new Peer(username, {
        host: "192.168.1.36",
        port: 9000,
        path: '/peerjs',
        debug: 3,
        config: {
            'iceServers': [{
                    url: 'stun:stun1.l.google.com:19302'
                },
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
                console.log(
                    "browser-incompatible: The client's browser does not support some or all WebRTC features that you are trying to use."
                );
                break;
            case 'disconnected':
                console.log(
                    "disconnected: You've already disconnected this peer from the server and can no longer make any new connections on it."
                );
                break;
            case 'invalid-id':
                console.log(
                    "invalid-id: The ID passed into the Peer constructor contains illegal characters."
                );
                break;
            case 'invalid-key':
                console.log(
                    "invalid-key: The API key passed into the Peer constructor contains illegal characters or is not in the system (cloud server only)."
                );
                break;
            case 'network':
                console.log(
                    "network: Lost or cannot establish a connection to the signalling server."
                );
                break;
            case 'peer-unavailable':
                console.log(
                    "peer-unavailable: The peer you're trying to connect to does not exist."
                );
                $('.text-header small').html("Desconectado");
                break;
            case 'ssl-unavailable':
                console.log(
                    "ssl-unavailable: PeerJS is being used securely, but the cloud server does not support SSL. Use a custom PeerServer."
                );
                break;
            case 'server-error':
                console.log("server-error: Unable to reach the server.");
                break;
            case 'socket-error':
                console.log("socket-error: An error from the underlying socket.");
                break;
            case 'socket-closed':
                console.log("socket-closed: The underlying socket closed unexpectedly.");
                break;
            case 'unavailable-id':
                console.log(
                    "unavailable-id: The ID passed into the Peer constructor is already taken."
                );
                break;
            case 'webrtc':
                console.log("webrtc: Native WebRTC errors.");
                break;
            default:
                console.log("An unexpected error has ocurred");
                break;
        }
    });

    // Este evento se ejecuta al detectar la llamada de un usuario
    peer.on('call', function (call) {
        llamadaContestada = false;
        ion.sound.play("marimba");

        timer = setTimeout(function () {
            if (llamadaContestada == false) {
                ion.sound.stop("marimba");
                swal("Llamada perdida de " + call.metadata.me.nombre + " " + call.metadata
                    .me.apellido);
            }

        }, 30000);

        swal(call.metadata.me.nombre + " " + call.metadata.me.apellido +
                " te esta llamando, ¿deseas responder?", {
                    buttons: {
                        cancelar: "Cancelar",
                        contestar: "Contestar",
                    },
                })
            .then((value) => {
                switch (value) {

                    case "cancelar":
                        call.close();
                        swal("Has cancelado esta llamada");
                        ion.sound.stop("marimba");
                        llamadaContestada = true;
                        break;

                    case "contestar":
                        ion.sound.stop("marimba");
                        call.answer(window.localStream);
                        // Recibir data
                        call.on('stream', function (stream) {
                            llamadaContestada = true;
                            // Guardar un referencia global de la informacion transmitida
                            window.peer_stream = stream;
                            // Muestra la trasmision del usuario conectado en mi camara
                            onReceiveStream(stream, 'peer-camera');
                            $('#camera').removeClass('d-none');
                            $('#info').addClass('d-none');
                            $("#hangup").prop("disabled", false);
                            $("#call").prop("disabled", true);
                            $('#chatbox-section').removeClass('d-none');
                            $('#camera-section').removeClass('d-none');
                            $('.user').removeClass('active');
                            $('#' + call.peer).addClass('active');

                            $.each(db.users, function (key, value) {
                                if (value.username == call.peer) {
                                    $('.text-header').html("<p>" + value.nombre +
                                        " " + value.apellido +
                                        "<br><small></small></p>");
                                    $('#user-camera').html(value.nombre +
                                        " " + value.apellido);
                                    $('#info-name').html(value.nombre + " " +
                                        value.apellido);
                                    $('#info-username').html(value.username);
                                    $('#info-image').prop("src", value.imagen);
                                }
                            });


                        });
                        // Se ejecuta cuando la llamada finaliza
                        call.on('close', function () {
                            $('#camera').addClass('d-none');
                            $('#info').removeClass('d-none');
                        });

                        $("#hangup").click(function () {
                            call.close();
                            $("#hangup").prop("disabled", true);
                            $("#call").prop("disabled", false);
                            $('#camera').addClass('d-none');
                            $('#info').removeClass('d-none');
                        });
                        break;
                }
            });


    });


    // Este evento se ejecuta cuando se detecta una nueva conexion con un usuario
    peer.on('connection', connect);


    function blobToFile(theBlob, fileName) {
        //A Blob() is almost a File() - it's just missing the two properties below which we will add
        theBlob.lastModifiedDate = new Date();
        theBlob.name = fileName;
        return theBlob;
    }


    // Esta funcion se ejecuta cuando un usuario conecta con otro, y se dispara en el evento 'connection'
    function connect(c) {


        if (c.label === 'chat') {


            c.on('data', function (data) {
                $.each(db.conversations, function (key, value) {
                    if (value.connections_id == c.metadata.conversation_id) {
                        var obj = {
                            from: c.peer,
                            message: data
                        };
                        db.conversations[key].messages.push(obj);
                    }
                });
                ion.sound.play("ping");
                $('#' + c.peer + " span#last_message").html(data);

                if (typeof $('.active')["0"].id !== "undefined") {
                    if ($('.active')["0"].id == c.peer) {
                        $('#messages-section').append(
                            "<div class='border border-secondary rounded'>" +
                            data + "</div>");
                        $('#message-box').animate({
                            scrollTop: document.querySelector("#message-box").scrollHeight
                        }, 1000);
                    }
                }



            });

            c.on('close', function () {
                $('#' + c.peer + " span#last_message").html("Desconectado");
                delete connectedPeers[c.peer];
            });
        } else if (c.label === 'file') {
            c.on('data', function (data) {


                if (data.constructor === ArrayBuffer) {
                    var dataView = new Uint8Array(data);



                    var dataBlob = new Blob([dataView]);
                    var arc = blobToFile(dataBlob, "archivo");

                    console.log(arc);

                    var url = window.URL.createObjectURL(dataBlob);
                    ion.sound.play("ping");
                    $('#' + c.peer + " span#last_message").html(c.peer +
                        " te ha enviado un <a href='" + url + "'>archivo</a>");


                    var message_temp = "<a href='" + url + "'>Descargar</a>";
                    $.each(db.conversations, function (key, value) {
                        if (value.connections_id == c.metadata.conversation_id) {
                            var obj = {
                                from: username,
                                message: message_temp
                            };
                            db.conversations[key].messages.push(obj);
                        }
                    });

                    $('#message-box').animate({
                        scrollTop: document.querySelector("#message-box").scrollHeight
                    }, 1000);

                }
            });
        }
        connectedPeers[c.peer] = 1;
    }



    var box = $('#message-box');
    box.on('dragenter', doNothing);
    box.on('dragover', doNothing);
    box.on('drop', function (e) {
        e.originalEvent.preventDefault();
        var file = e.originalEvent.dataTransfer.files[0];
        eachActiveConnection(function (c, $c) {
            if (c.label === 'file') {
                c.send(file);
                console.log(file);
                $('#messages-section').append(
                    "<div class='border border-secondary rounded me'>" + file.name +
                    " (" + file.size + " bytes)</div>");
                $('#message-box').animate({
                    scrollTop: document.querySelector("#message-box").scrollHeight
                }, 1000);


            }
        });
    });

    // Funcion nula
    function doNothing(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Esta funcion se ejecuta al hacer clic sobre el boton 'conectar'

    $('.user').click(function (e) {
        var conversation_id = e.currentTarget.classList[2];
        var requestedPeer = e.currentTarget.id;
        $('.user').removeClass('active');
        $('#' + requestedPeer).addClass('active');
        if (!connectedPeers[requestedPeer]) {
            var c = peer.connect(requestedPeer, {
                label: 'chat',
                serialization: 'none',
                metadata: {
                    conversation_id: conversation_id,
                    requestedPeer: requestedPeer,
                    peer: me
                }
            });
            c.on('open', function () {
                connect(c);
            });
            c.on('error', function (err) {
                alert(err);
            });
            var f = peer.connect(requestedPeer, {
                label: 'file',
                reliable: true,
                metadata: {
                    conversation_id: conversation_id,
                    requestedPeer: requestedPeer,
                    peer: me
                }
            });
            f.on('open', function () {
                connect(f);
            });
            f.on('error', function (err) {
                alert(err);
            });
        }
        connectedPeers[requestedPeer] = 1;


        $('#chatbox-section').removeClass('d-none');
        $('#camera-section').removeClass('d-none');

        $.each(db.users, function (key, value) {
            if (value.username == requestedPeer) {
                $('.text-header').html("<p>" + value.nombre + " " + value.apellido +
                    "<br><small></small></p>");
                $('#user-camera').html(value.nombre + " " + value.apellido);
                $('#info-name').html(value.nombre + " " + value.apellido);
                $('#info-username').html(value.username);
                $('#info-image').prop("src", value.imagen);
            }
        });

        $('#messages-section').html("");

        $.each(db.conversations, function (key, value) {
            if (value.connections_id == conversation_id) {
                $.each(value.messages, function (key1, value1) {
                    if (value1.from == username) {
                        $('#messages-section').append(
                            "<div class='border border-secondary rounded me'>" +
                            value1.message +
                            "</div>");

                    } else {
                        $('#messages-section').append(
                            "<div class='border border-secondary rounded'>" +
                            value1.message +
                            "</div>");

                    }
                });
            }
        });

        $('#message-box').animate({
            scrollTop: document.querySelector("#message-box").scrollHeight
        }, 1000);



    });



    $('#close').click(function () {
        eachActiveConnection(function (c) {
            c.close();
        });
    });

    // Esta funcion se ejecuta al hacer click sobre el boton enviar
    $('#send').submit(function (e) {

        e.preventDefault();

        var msg = escapeHtml($('#message-text').val());

        console.log(msg);

        if (msg.trim() != "") {
            eachActiveConnection(function (c, $c) {
                if (c.label === 'chat') {
                    console.log($c);
                    c.send(msg);



                    $.each(db.conversations, function (key, value) {
                        if (value.connections_id == c.metadata.conversation_id) {
                            var obj = {
                                from: username,
                                message: msg
                            };
                            db.conversations[key].messages.push(obj);
                        }
                    });


                    $('#messages-section').append(
                        "<div class='border border-secondary rounded me'>" + msg +
                        "</div>");

                    $('#message-box').animate({
                        scrollTop: document.querySelector("#message-box").scrollHeight
                    }, 1000);
                }
            });
        }

        $('#message-text').val('');
        $('#message-text').focus();
    });

    $('#message-text').on('keypress', function (e) {
        if (e.which === 13) {

            $(this).attr("disabled", "disabled");

            var msg = escapeHtml($('#message-text').val());

            if (msg.trim() != "") {
                eachActiveConnection(function (c, $c) {
                    if (c.label === 'chat') {
                        console.log($c);
                        c.send(msg);



                        $.each(db.conversations, function (key, value) {
                            if (value.connections_id == c.metadata.conversation_id) {
                                var obj = {
                                    from: username,
                                    message: msg
                                };
                                db.conversations[key].messages.push(obj);
                            }
                        });


                        $('#messages-section').append(
                            "<div class='border border-secondary rounded me'>" +
                            msg +
                            "</div>");

                        $('#message-box').animate({
                            scrollTop: document.querySelector("#message-box").scrollHeight
                        }, 1000);

                    }
                });
            }

            $(this).removeAttr("disabled");


            $('#message-text').focus();
            $('#message-text').val('');



        }
    });

    $("#call").click(function () {
        llamadaContestada = false;
        $("#hangup").prop("disabled", false);
        $("#call").prop("disabled", true);
        eachActiveConnection(function (c, $c) {
            var call = peer.call(c.peer, window.localStream, {
                metadata: {
                    me: me
                }
            });
            ion.sound.play("repique");
            swal("Llamando a " + c.peer + "...");

            timer = setTimeout(function () {
                if (llamadaContestada == false) {
                    $("#hangup").prop("disabled", true);
                    $("#call").prop("disabled", false);
                    $('#camera').addClass('d-none');
                    $('#info').removeClass('d-none');
                    ion.sound.stop("repique");
                    swal(c.peer + " no ha contestado");
                }

            }, 30000);


            call.on('stream', function (stream) {
                llamadaContestada = true;
                ion.sound.stop("repique");
                window.peer_stream = stream;
                onReceiveStream(stream, 'peer-camera');
                $('#camera').removeClass('d-none');
                $('#info').addClass('d-none');
                swal.close();
            });

            // Se ejecuta cuando la llamada finaliza
            call.on('close', function () {
                $('#camera').addClass('d-none');
                $('#info').removeClass('d-none');
                $("#hangup").prop("disabled", true);
                $("#call").prop("disabled", false);
            });


            $("#hangup").click(function () {
                call.close();
                $("#hangup").prop("disabled", true);
                $("#call").prop("disabled", false);
                $('#camera').addClass('d-none');
                $('#info').removeClass('d-none');
            });
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
            alert("No se pudo acceder a tu camara");
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
    navigator.getUserMedia({
        audio: true,
        video: true
    }, callbacks.success, callbacks.error);
}

function onReceiveStream(stream, element_id) {
    var video = document.getElementById(element_id);
    video.src = window.URL.createObjectURL(stream);
    window.peer_stream = stream;
}