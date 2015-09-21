var http = require('http'),
    fs   = require('fs'),
    path = require('path'),
    url = require('url'),
    EventEmitter = require('events').EventEmitter;

var fileEmitter = new EventEmitter();

var port = process.env.PORT || 8080;
var pathToPublic = 'public';

/* Функция для обслуживания базового файла представления */
function handleLayout(res) {

    fs.readFile(pathToPublic + '/templates/layout.html', function(err, fileData) {
        if (err) {
            fileEmitter.emit('fileError', 'Ошибка при чтении файла.');
            throw err;
        }
        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Content-Length': Buffer.byteLength(fileData)
        });
        res.write(fileData);
        res.end();
    });

}

/* Функция для обслуживания статических файлов: partials, css, js */
function serveStatic(requestPath, req, res) {
    /* Чтобы Chrome не пытался грузить favicon */
    if (requestPath === '/favicon.ico') {
        res.statusCode = 404;
        res.end();
        return;
    }

    var path = pathToPublic + requestPath;

    fs.readFile(path, function(err, fileData) {
        if (err) {
            throw err;
        }
        res.setHeader('Content-Length', Buffer.byteLength(fileData));
        res.statusCode = 200;
        writeStaticHeader(requestPath, res);
        res.write(fileData);
        res.end();
    });

}

/* Функция для записи заголовка Content-Type на базе расширения файла */
function writeStaticHeader(requestPath, res) {

    var extension = requestPath.slice(requestPath.lastIndexOf('.') + 1);
    switch (extension) {
        case 'html':
            res.setHeader('Content-Type', 'text/html');
            break;
        case 'css':
            res.setHeader('Content-Type', 'text/css');
            break;
        case 'js':
            res.setHeader('Content-Type', 'text/javascript');
            break;
        default:
            res.setHeader('Content-Type', 'text/plain');
    }

}


fileEmitter.on('mainLayoutExists', handleLayout);
fileEmitter.on('staticFileExists', serveStatic);

fileEmitter.on('fileError', function(reason) {
    console.log(reason);
});




/* Сам сервер для обслуживания запросов */
var server = http.createServer(function(req, res) {

    var requestPath = url.parse(req.url).pathname;

    if (req.method === 'GET' && requestPath === '/') {

        fs.exists(pathToPublic + '/templates/layout.html', function(exists) {
            if (!exists) {
                fileEmitter.emit('fileError', 'Файл отсутствует.');
            }
            fileEmitter.emit('mainLayoutExists', res);

        });

    } else {
        fs.exists(pathToPublic + requestPath, function(exists) {
            if (!exists) {
                fileEmitter.emit('fileError', 'Файл отсутствует.');
            }
            fileEmitter.emit('staticFileExists', requestPath, req, res);

        });

    }

});

server.listen(port, function() {
    console.log('Server listening on ' + port);
});