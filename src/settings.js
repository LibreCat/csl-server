var fs = require('fs');

var config = { port: 8000 };
var configPath = __dirname + '/../config.json';
if (fs.exists(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));
}

module.exports = config;
