
var port = 7000;
var http = require("http");
var server = http.createServer();
server.on('request', request);
server.listen(port);
function request(request, response) {
    var jade = '';

    request.on('data', function (data) {
        jade += data;
    });
    request.on('end', function () {
        if (jade != null && jade != "" && request.method == "POST") {
            const myModule = require('./cktsim-server');

            var result = myModule.cktsim(jade);
            var finally_result = result.substr(27, result.length-35);
            //var json = JSON.stringify(result, function (key, value) {
            //    if (typeof value === "function") {
            //        return "/Function(" + value.toString() + ")/";
            //    }
            //    return value;
            //});
            response.setHeader("Content-Type", "text/json");
            response.setHeader("Access-Control-Allow-Origin", "*");
            response.end(JSON.stringify(finally_result));
        }
        else {
            response.setHeader("Content-Type", "text/json");
            response.setHeader("Access-Control-Allow-Origin", "*");
            response.end('starting');
        }
    });
}


