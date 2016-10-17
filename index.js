var fs = require("fs");
var path = require("path");

var fcrc = {};

var rcPath = fcrc.path = path.join(process.env.HOME, '.fc00rc');

var defaultRc = fcrc.defaultRc = {
    version: 1,
};

// write rc to path
var write = fcrc.write = function (rc) {
    if (typeof(rc) !== 'object') { throw new Error("Expected object"); }
    fs.writeFileSync(rcPath, JSON.stringify(rc, null, 2));
    return;
};

// read the rc from file if exists, else make and return the default
var read = fcrc.read = function () {
    var rc;
    try {
        rc = fs.readFileSync(rcPath,'utf-8');
    } catch (err) {
        if (err.code === 'ENOENT') {
            // rc file doesn't exist
            write(defaultRc);
            rc = clone(defaultRc);
        } else {
            console.log(err);
            throw err;
        }
    }

    try {
        rc = JSON.parse(rc);
    } catch (err) {
        throw new Error("Couldn't parse " + rcPath);
    }

    return rc;
};

module.exports = fcrc;