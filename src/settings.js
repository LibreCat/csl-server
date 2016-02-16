var fs = require('fs');

var config = { port: 8888 };
var configPath = __dirname + '/../config.json';

if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));
}

module.exports = config;
