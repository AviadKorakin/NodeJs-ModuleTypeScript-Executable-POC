import http from "node:http";

const server = http.createServer((req, res) => {
  // Health check endpoint
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello\n");
    return;
  }

  // Default handler
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello from ES Module server!\n");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
