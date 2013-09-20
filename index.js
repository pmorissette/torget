var request = require('request'),
  zlib = require('zlib'),
  fs = require('fs');

var headers = {
    "accept-charset" : "ISO-8859-1,utf-8;q=0.7,*;q=0.3",
    "accept-language" : "en-US,en;q=0.8",
    "accept" : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "accept-encoding" : "gzip,deflate",
}

var options = {
    headers: headers
}

module.exports = function(hash, filename, callback) {
    // setup options
    hash = hash.toUpperCase();
    options.url = "http://torcache.net/torrent/{0}.torrent".replace('{0}', hash);

    // create request and handle response
    var req = request(options)

    req.on('response', function (res) {
        if (res.statusCode !== 200) {
            return callback(new Error('Status not 200'));
        }

        // create writeStream
        var outStream = null;
        try {
            outStream = fs.createWriteStream(filename);
        } catch(err) {
            return callback(err);
        }

        var encoding = res.headers['content-encoding'];
        if (encoding == 'gzip') {
            res.pipe(zlib.createGunzip()).pipe(outStream)
        } else if (encoding == 'deflate') {
            res.pipe(zlib.createInflate()).pipe(outStream)
        } else {
            res.pipe(outStream)
        }

        return callback(null);
    });

    req.on('error', function(err) {
        return callback(err);
    });
}
