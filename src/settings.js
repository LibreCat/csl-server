var fs = require('fs');
var file = fs.readFileSync('config.json', 'UTF-8');
module.exports = JSON.parse(file);