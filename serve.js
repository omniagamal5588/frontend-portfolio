const http = require("http");
const fs = require("fs");
const path = require("path");
const root = __dirname;
const types = { ".html":"text/html", ".css":"text/css", ".js":"text/javascript", ".jpg":"image/jpeg", ".png":"image/png", ".pdf":"application/pdf", ".svg":"image/svg+xml" };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const fp = path.join(root, p);
  if (!fp.startsWith(root)) { res.writeHead(403); return res.end("no"); }
  fs.readFile(fp, (e, data) => {
    if (e) { res.writeHead(404); return res.end("404"); }
    res.writeHead(200, { "Content-Type": types[path.extname(fp).toLowerCase()] || "application/octet-stream" });
    res.end(data);
  });
}).listen(8777, () => console.log("serving on http://localhost:8777"));
