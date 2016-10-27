var fs = require("fs");
var path = require("path");
var Package = require("./package.json");

var fcrc = {};

var clone = function (o) { return JSON.parse(JSON.stringify(o)); };

var dirPath = path.join(process.env.HOME, '.fc00');

var rcPath = fcrc.path = path.join(dirPath, 'config');

var isDir = function (p) {
    if (fs.existsSync(p)) {
        if (fs.statSync(p).isDirectory()) {
            return true;
        }
        return false;
    }
    return null;
};

var exists = fcrc.exists = function (p) {
    try {
        fs.readFileSync(p || fcrc.path);
        return true;
    } catch (err) {
        return false;
    }
};

var defaultRc = fcrc.defaultRc = {
    version: Package.version,
};

// write rc to path
var write = fcrc.write = function (rc) {
    if (typeof(rc) !== 'object') { throw new Error("Expected object"); }
    fs.writeFileSync(rcPath, JSON.stringify(rc, null, 2));
    return;
};

[{
    type: 'profile',
    path: 'profiles',
},{
    type: 'peer',
    path: 'peers',
}].forEach(function (o) {
    var O = fcrc[o.type] = {
        path: function (name) { return path.join(dirPath, o.path, name); },
        exists: function (name) { return exists(O.path(name)); },
        write: function (name, content) {
            fs.writeFileSync(O.path(name), JSON.stringify(content, null, 4));
        },
        read: function (name) {
            try {
                return fs.readFileSync(O.path(name), 'utf-8');
            } catch (err) {
                console.error(err);
                return;
            }
        },
    };
});

var init = fcrc.init = function (opt, _profile) {
    // make sure required directories exist
    [   dirPath,
        path.join(dirPath, 'profiles'),
        path.join(dirPath, 'peers'),
    ].forEach(function (p) {
        if (!isDir(p)) { fs.mkdirSync(p); }
    });

    var rc = clone(defaultRc);

    if (typeof(_profile) === 'object') {
        // make a default profile
        profile.write('default', _profile);
        rc.profile = 'default';
    }

    if (typeof(opt) === 'object') {
        Object.keys(opt).forEach(function (k) {
            rc[k] = clone(opt[k]);
        });
    }

    // write a basic config
    write(rc);
};

// read the rc from file if exists, else make and return the default
var read = fcrc.read = function () {
    var rc;
    try {
        rc = fs.readFileSync(rcPath,'utf-8');
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.error("fc00 is not initialized!");
            console.error("try running `fc00 init`");
            return null;
        } else {
            console.log(err);
            throw err;
        }
    }

    if (typeof(rc) === 'string') {
        try {
            rc = JSON.parse(rc);
        } catch (err) {
            throw new Error("Couldn't parse " + rcPath);
        }
    }

    return rc;
};

module.exports = fcrc;
