var fs = require('fs');
var file = fs.readFileSync(__dirname + '/../config.json', 'UTF-8');
module.exports = JSON.parse(file);
