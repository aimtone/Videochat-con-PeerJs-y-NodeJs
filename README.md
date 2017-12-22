# VideoChat con PeerJs y NodeJs

## Requerimientos
* Node >= 6 (Para la prueba use Node 6.10.0) 
* NPM >= 5 (Para la prueba use NPM 5.6.0)

## Instalacion

1) Lo primero que debemos hacer para instalar y correr el videochat, es dirigirnos a la carpeta `public` desde la terminal y ejecutar el comando `npm install`

2) Luego nos dirigimos a la carpeta `server` desde la terminal y ejecutamos el comando `npm install`

## Correr el servidor

1) En estos momentos, debemos correr dos servidores, primero tenemos que correr el servidor web que se encarga de montar la aplicacion para poder visualizar, para realizar esto, nos dirigimos a la carpeta `public` y corremos el comando `node website-server.js`, el servidor se ejecutara en `https://localhost` o en la direccion de IP actual del computador

1) Luego, abrimos otra terminal y debemos correr el servidor socket de `PeerJs` que se encarga del flujo de la informacion, para realizar esto, nos dirigimos a la carpeta `server` y corremos el comando `node peer-server.js`

## Configuracion 

Tenga en cuenta que para que la aplicacin se ejecute de forma correcta, desde el cliente debe establecer la direccion del socket al cual ud quiere conectar, en este caso, la direccion generada por el socket de `PeerJs`

Para realizar esto, en un editor de texto, abrimos el archivo ubicado en `public/index.html` y ubicar el siguiente codigo

<pre><code>
var peer = new Peer(username, {
    host: "localhost",
    port: 9000,
    path: '/peerjs',
    debug: 3,
    config: {
        'iceServers': [
            {
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
</code></pre>

En el atributo `host`, sustituir por la direccion de IP actual del computador

Luego de hacer esto, el videochat funcionara a la perfeccion

# Eventos y funciones de PeerJs

## Eventos

<pre><code>
// Sintaxis
@params {
    evento : typeof string
    funcion: typeof function
}
peer.on(evento, funcion);
</code></pre>

### Listado de eventos

A continuacion, se presenta una tabla con los eventos de PeerJs usados en este videochat, cabe destacar que no son todos, para obtener mas informacion sobre la documentacion de PeerJs visite su pagina oficial 

| Evento | Ejemplo | Descripcion |Funcion disparadora |
| ------ | ------- | ----------- |----------------- |
| open   | `peer.on('open', function(id) { // definicion });` | Este evento se ejecuta al conectarse de forma correcta al socket de PeerJs, el parametro `id` de la funcion anonima devuelve el `id` autogenerado por PeerJs o el personalizado por el desarrollador | Constructor de PeerJs |
| error  | `peer.on('open', function(err) { // definicion });` | Este evento se ejecuta si ocurre un error al intentar conectarse al socket de PeerJs, el parametro `err` de la funcion anonima devuelve el error generado en `err.type`| Constructor de PeerJs |
| connection | `peer.on('connection', function(conn) { // definicion });` | Este evento se ejecuta cuando se dectecta que una persona se ha conectado con tu usuario, el parametro `conn` de la funcion anonima devuelve la informacion sobre dicha conexion, este parametro a su vez, devuelve sus propios eventos los cuales especificaremos mas adelante | `peer.connect()` |
| call | `peer.on('call', function(call) { // definicion });` | Esta evento se ejecuta cuando se detecta que alguien te esta llamando, el parametro `call` de la funcion anonima devuelve la informacion correspodiente a esta conexion, este parametro a su vez, devuelve sus propios eventos los cuales especificaremos mas adelante |  `peer.call()` |

### Funciones

`peer.connect(id, opciones)`

Ejemplo
<pre><code>
@ Params {
    id : string
    opciones: object
}
peer.connect("id-peer", {
    label: 'chat',
    serialization: 'none',
    metadata: {
        // informacion personalizada para enviar al otro usuario
    }
});
</code></pre>

`peer.call(id, stream ,opciones)`

Ejemplo
<pre><code>
@ Params {
    id : string
    stream : blob,
    opciones: object
}
peer.call("id-peer", stream, {
    metadata: {
        // informacion personalizada para enviar al otro usuario
    }
});
</code></pre>

### Listado de eventos del parametro `conn`

Ya que el parametro `conn` pertenece a una funcion anonima que es llamada desde el evento `connection`, es importante saber que los siguiente eventos a continuacion, corresponde a una variable local que solo puede ser ejecutada desde su entorno, tanto sus atributos, como eventos y funciones

| Evento | Ejemplo | Descripcion |  Funcion disparadora |
| ------ | ------- | ----------- |----------------- |
| data   | `conn.on('data', function (data) { \\ definicion });` | Este evento se ejecuta cuando un usuario conectado contigo, envia informacion, el parametro `data` en la funcion anonima, es la informacion misma
| close   | `conn.on('close', function () { \\ definicion });` | Este evento se ejecuta cuando se detecta que un usuario conectado contigo se ha desconectado del servidor | `conn.close()` |

### Listado de eventos del parametro `call`

El parametro `call` pertenece a una funcion anonima que es llamada desde el evento `call`, es importante saber que los siguiente eventos a continuacion, corresponde a una variable local que solo puede ser ejecutada desde su entorno, tanto sus atributos, como eventos y funciones

| Evento | Ejemplo | Descripcion | Funcion disparadora |
| ------ | ------- | ----------- | ----------------- |
| stream   | `conn.on('stream', function (stream) { \\ definicion });` | Este evento se ejecuta cuando aceptas una llamada de un usuario, el mismo recibe el audio y video enviado desde el usuario remoto | `call.answer()` |
| close   | `conn.on('close', function () { \\ definicion });` | Este evento se ejecuta cuando se detecta que un usuario conectado contigo actualmente por videollamada se desconecta de la misma, sin embargo, el chat se mantiene activo ya que la conexion del chat no pertenece al entorno de la funcion anonima del evento `call` | `call.close()` |

### Funciones para el parametro `conn`

`call.answer(stream)`

Ejemplo
<pre><code>
@ Params {
    stream : blob
}
call.answer(stream);
</code></pre>

# Funciones utiles de esta aplicacion

`eachActiveConnection(conn)`: analiza todos los `divs` con la clase `.active`, toda aquel que tenga la clase y este conectado con el usuario, recibira la informacion que este envie, esta funcion se encarga de enviar a cada una de estas conexiones activas actualmente

### Definicion
<pre><code>
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
</code></pre>

`requestLocalVideo` : Se encarga de solicitarte la conexion con tu camara web 
### Definicion
<pre><code>
function requestLocalVideo(callbacks) {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    navigator.getUserMedia({
        audio: true,
        video: true
    }, callbacks.success, callbacks.error);
}
</code></pre>

`onReceiveStream` : Se encarga de ubicar el stream recibido en la etiqueta `<video>` correspondiente 
### Definicion
<pre><code>
function onReceiveStream(stream, element_id) {
    var video = document.getElementById(element_id);
    video.src = window.URL.createObjectURL(stream);
    window.peer_stream = stream;
}
</code></pre>

`escapeHtml` : Se encarga de escapar los caracteres de etiquetas HTML con el fin de que cuando un usuario envie un mensaje cuyo contenido sea HTML, se envie tal cual y como lo ha escrito, evitando asi que el navegador pueda interpretar el contenido como HTML
### Definicion
<pre><code>
var entityMap = {"&": "&amp;","<": "&lt;",">": "&gt;",'"': "&quot;","'": "&#39;","/": "&#x2F;","`": "&#x60;","=": "&#x3D;"};
function escapeHtml(string) {
    return String(string).replace(/[&<>"'`=\/]/g, function(s) {
        return entityMap[s];
    });
}
</code></pre>