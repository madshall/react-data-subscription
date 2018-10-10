const HTTP = require("http");
const URL = require("url");

const PORT = 3001;

const endpoints = {
  "ping": (params, response, method) => {
    response.writeHead(200);
    response.end(JSON.stringify({
      endpoint: "ping",
      params,
      message: "ok",
      method
    }));
  }
};

const error = (code, response) => {
  response.writeHead(code);
  response.end(`{"error": ${code}}`);
};

HTTP.createServer((request, response) => {
  response.setHeader("Content-Type", "application/json");
  console.log(request.method);
  const url = URL.parse(request.url, true);
  const endpoint = url.pathname.slice(1);

  if (!endpoints[endpoint]) {
    return error(404, response);
  }

  if(request.method === "GET") {
    endpoints[endpoint](url.query, response, request.method);
  } else if (request.method === "POST") {
    let body = '';

    request.on("data", chunk => {
      body += chunk.toString();
    });

    request.on("end", () => {
      endpoints[endpoint](JSON.parse(body), response, request.method);
    });
  } else {
    error(405, response);
  }
}).listen(PORT);
console.log(`Started server on http://localhost:${PORT}`);
