var CSL = require("../lib/citeproc").CSL,
    fs  = require("fs");

function loadDir(dir, regexp) {
    var files = {};
    fs.readdirSync(dir).forEach(function(file) {
        if (file.match(regexp)) {
            var label = RegExp.$1;
            var content = fs.readFileSync(dir + file, 'UTF-8');
            files[label] = content;
        }
    });
    return files;
}

var styles = loadDir("styles/", /(.*)\.csl$/);
    locales = loadDir("locales/", /locales-(.*)\.xml$/);

var engineCache = {};

var sys = {
    retrieveItem: function(id) {
        return this.item;
    },
    retrieveLocale: function(id) {
        return this.locale;
    }
};

exports.styles = function() {
    return Object.keys(styles);
};

exports.locales = function() {
    return Object.keys(locales);
};

exports.format = function(item, format, style, locale, callback, errback) {
    if (format == null)
        format = "text";
    if (style == null)
        style = ["nature"];
    if (locale == null)
        locale = "en-US";

    if (!Array.isArray(style))
        style = [style];

    var localeXML = locales[locale];

    if (format !== 'text' && format !== 'html' && format !== 'rtf') {
        errback(400, "unknown format " + format);
        return;
    }

    if (localeXML == undefined) {
        errback(400, "unknown locale " + locale);
        return;
    }

    item.id = 'item';
    sys.item = item;
    sys.locale = localeXML;

    var data = {};

    for (var i = 0; i < style.length; i++) {
        var s = style[i];
        var styleXML = styles[s];

        if (styleXML == undefined) {
            errback(400, "unknown style " + s);
            return;
        }

        if (!engineCache[s]) {
            engineCache[s] = {};
        }
        var engine = engineCache[s][locale];
        if (!engine) {
            engine = engineCache[s][locale] = new CSL.Engine(sys, styleXML);
        }

        engine.updateItems(['item']);
        engine.setOutputFormat(format);
        var bib;
        try {
            bib = engine.makeBibliography();
        } catch(e) {
            errback(500, e);
            return;
        }
        if (bib[0]['bibliography_errors'].length == 0) {
            data[s] = bib[1][0];
        } else {
            errback(400, "not enough metadata to construct bibliographic item");
            return;
        }
    }

    callback(data);
}
