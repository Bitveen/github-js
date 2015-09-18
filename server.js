var http = require('http'),
    fs   = require('fs'),
    path = require('path'),
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
function serveStatic(req, res) {
    /* Чтобы Chrome не пытался грузить favicon */
    if (req.url === '/favicon.ico') {
        res.statusCode = 404;
        res.end();
        return;
    }

    var path = pathToPublic + req.url;

    fs.readFile(path, function(err, fileData) {
        if (err) {
            throw err;
        }
        res.setHeader('Content-Length', Buffer.byteLength(fileData));
        res.statusCode = 200;
        writeStaticHeader(req, res);
        res.write(fileData);
        res.end();
    });

}

/* Функция для записи заголовка Content-Type на базе расширения файла */
function writeStaticHeader(req, res) {

    var extension = req.url.slice(req.url.lastIndexOf('.') + 1);
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
            res.statusCode = 500;
    }

}


fileEmitter.on('mainLayoutExists', handleLayout);
fileEmitter.on('staticFileExists', serveStatic);

fileEmitter.on('fileError', function(reason) {
    console.log(reason);
});




/* Сам сервер для обслуживания запросов */
var server = http.createServer(function(req, res) {

    if (req.method === 'GET' && req.url === '/') {

        fs.exists(pathToPublic + '/templates/layout.html', function(exists) {
            if (!exists) {
                fileEmitter.emit('fileError', 'Файл отсутствует.');
            }
            fileEmitter.emit('mainLayoutExists', res);

        });

    } else {
        fs.exists(pathToPublic + req.url, function(exists) {
            if (!exists) {
                fileEmitter.emit('fileError', 'Файл отсутствует.');
            }
            fileEmitter.emit('staticFileExists', req, res);

        });

    }

});

server.listen(port, function() {
    console.log('Server listening on ' + port);
});