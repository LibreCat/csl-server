var connect = require('connect'),
    csl = require('./csl'),
    settings = require('./settings');

function init() {
    var server = connect();
    server.use(connect.query());
    server.use(connect.logger());
    server.use(connect.json());

    server.use('/styles', method('GET', listHandler(csl.styles())));
    server.use('/locales', method('GET', listHandler(csl.locales())));
    server.use('/', method('POST', formatHandler));

    server.listen(settings.port);
    console.log('server listening on port ' + settings.port + '.');
}

function listHandler(array) {
    return function(req, res) {
        sendResponse(res, 200, array);
    };
}

function method(method, handler) {
    return function(req, res, next) {
        if (method == req.method)
            handler(req, res, next);
        else
            next();
    };
}

function sendResponse(res, code, data, header) {
    if (header == null)
        header = {};
    if (header['Content-Type'] == undefined)
        header['Content-Type'] = 'application/json';
    var body = {
        code: code,
        status: code < 499 ? code < 399 ? 'success' : 'error' : 'failure',
        data: data
    };
    res.writeHead(code, header);
    res.end(JSON.stringify(body));
}

function formatHandler(req, res) {
    csl.format(req.body, req.query.format, req.query.style, req.query.locale,
        function(data) {
            sendResponse(res, 200, data);
        }, function(code, msg) {
            sendResponse(res, code, msg);
        });
}

init();