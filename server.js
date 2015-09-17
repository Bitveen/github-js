/*
* Сервер для обслуживания статических файлов
* */
var http = require('http');
var fs   = require('fs');
var path = require('path');

var port = process.env.PORT || 8080;
var pathToPublic = './public';

var server = http.createServer(function(req, res) {
    if (req.url === '/') {
        // основной шаблон
        serveHtml(res);
    } else {
        // стили, скрипты и картинки
        serveStatic(req, res);
    }

});


function serveStatic(req, res) {
    if (req.url == '/favicon.ico') {
        return;
    }
    var path = 'public' + req.url;
    var extension = req.url.slice(req.url.lastIndexOf('.'));
    fs.readFile(path, function(err, fileData) {
        if (err) {
            throw err;
        }
        var type = getFileMimeType(extension);
        res.writeHead(200, {
            'Content-Type': type
        });
        res.write(fileData);
        res.end();
    });

}

function serveHtml(res) {
    fs.readFile('public/templates/layout.html', function(err, fileData) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(fileData);
        res.end();
    });
}


function getFileMimeType(extension) {
    var type;
    switch (extension) {
        case '.css':
            type = 'text/css';
            break;
        case '.js':
            type = 'text/javascript';
            break;

    }
    return type;
}


function handle404(){}
function handleHtml(){}
function handleJs(){}
function handleCss(){}



server.listen(port, function() {
    console.log('Server listening on ' + port);
});