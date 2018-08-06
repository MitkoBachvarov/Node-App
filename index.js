let http = require('http');
let request = require('request');
let fs = require('fs');
let csv = require('csv');
let url = require('url');

let json_request_body = undefined;
let csv_request_body = undefined;
let html_content = undefined;

function createHTMLStringFromJson(retrievedData){
    let body_begin_index = html_content.indexOf('<body>');
    let body_end_index = html_content.indexOf('</body>');

    let string_until_body = html_content.slice(0, body_begin_index + 6);
    let string_from_body = html_content.slice(body_end_index);

    let html_string ='<table>\n';
    html_string += '<tr> \n';
    for (let attribute in retrievedData[0]){
        if(typeof retrievedData[0][attribute] !== 'object'){
            html_string += '<td>' + attribute + '</td> \n';
        }
    }
    html_string += '</tr> \n';

    retrievedData.forEach(function (object) {
        html_string += '<tr> \n';
        for (let attribute in object){
            if(typeof object[attribute] !== 'object'){
                html_string += '<td>' + object[attribute] + '</td> \n';
            }
        }
        html_string += '</tr> \n';
    });


    html_string += '</table> \n </body> \n </html>';
    return string_until_body + html_string + string_from_body;
}

function createHTMLStringFromCsv(retrievedData){
    let body_begin_index = html_content.indexOf('<body>');
    let body_end_index = html_content.indexOf('</body>');

    let string_until_body = html_content.slice(0, body_begin_index + 6);
    let string_from_body = html_content.slice(body_end_index);

    let html_string ='<table>\n';
    html_string += '<tr> \n';
    retrievedData[0].forEach(function (attribute) {
        html_string += '<td>' + attribute + '</td> \n';
    });
    html_string += '</tr> \n';

    let data = retrievedData.slice(1);
    data.forEach(function (row) {
        html_string += '<tr> \n';
        row.forEach(function (cell) {
            html_string += '<td>' + cell + '</td> \n';
        });
        html_string += '</tr> \n';
    });


    html_string += '</table> \n </body> \n </html>';
    return string_until_body + html_string + string_from_body;
}

request('https://www.bnefoodtrucks.com.au/api/1/trucks',function (err, request_res, body) {
    json_request_body = body;
});

request('https://www.data.brisbane.qld.gov.au/data/dataset/1e11bcdd-fab1-4ec5-b671-396fd1e6dd70/resource/3c972b8e-9340-4b6d-8c7b-2ed988aa3343/download/brisbane-public-art-collection-jul-2016-rev-1.2.csv',function (err, request_res, body) {
    csv.parse(body, function (err, data) {
        csv_request_body=data;
    });
});


http.createServer(function (req, res){
    if(json_request_body && csv_request_body && html_content){
        res.writeHead(200, {'Content-Type': 'text/html'});
        let request_url = url.parse(req.url);
        switch (request_url.path){
            case '/json':
                res.end(createHTMLStringFromJson((JSON).parse(json_request_body)));
                break;
            case '/csv':
                res.end(createHTMLStringFromCsv(csv_request_body));
                break;
        }
        //res.end(createHTMLStringFromJson((JSON).parse(request_body)));
    } else {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Nothing retrieved yet');
    }
}).listen(8080);


fs.readFile('./index.html', function (err, html) {
    if(err) {
        throw err;
    } else {
        html_content = html;
    }
});