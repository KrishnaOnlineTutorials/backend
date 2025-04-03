const http = require('http'); // creating a server

const server = http.createServer((req, res) => {
    if(req.url === '/home') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Hello, this is sample example');
    }
    else if(req.url === '/readData'){
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify([{firstName: 'A', lastName: 'B'}, {firstName: 'C', lastName: 'D'}]));
    }
    else if(req.url === '/redirect') {
        res.writeHead(301, { Location: '/home'});
        res.end()
    }

    // /redirect -> /noData -> /error -> 
    else {
        res.statusCode = 404;
        res.end('Resource not found')
    }
    // 1xx, 2xx, 3xx, 4xx, 5xx
});

server.listen(3001, () => {
    console.log('Server running at http://localhost:3000/')
});