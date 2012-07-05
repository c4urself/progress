var fs = require('fs'),
    _ = require('underscore');

var noop = function () {

};

var Progress = function (description) {
    this.description = description;
    this.init();
}

Progress.prototype = {
    
    getCurrentTask: function() {
        return _.find(self.data.tasks, function (task) {
            return task.current === true;
        });
    },
    
    datadir: "data/",
    
    getFileName: function () {
        return this.datadir + "db.json"
    },
    
    createDBFile: function (oncreate) {
        console.log("DB file does not exist -- creating it".warn);
        
        fs.writeFile(this.getFileName(), JSON.stringify({tasks: []}), function (err) {
            if (err) throw err;
            if (oncreate) oncreate();
        });
    },
    
    loadDBFile: function(onload) {
        var self = this;
        
        var readFile = function () {
            fs.readFile(self.getFileName(), 'utf8', function (err, data) {
                if (err && err.code !== 'ENOENT') throw err;
                console.log("Data in file is %s".debug, JSON.stringify(data));
                self.data = data ? JSON.parse(data) : {};
                if (onload) onload();
            });
        };
        
        fs.exists(self.getFileName(), function (exists) {
            return exists ? readFile() : self.createDBFile(readFile);
        });
        
    },

    init: function() {
        var self = this;
        console.log("Initializing a new task".debug);
        console.log("Description is - %s".debug, this.description);
        
        this.loadDBFile(function () {
            self.add(new Task(self.description));
        });
    },
    
    add: function (task) {
        this.data.current = task.datetime;
        this.data.tasks.push(task.json());
        this.save();
    },
    
    get: function (key) {
        return _.find(self.data.tasks, function (task) {
            return task.datetime === key;
        });
    },
    
    set: function (task) {
        var storedTask = this.get(task.key);
        storedTask = task.json();
    },
    
    save: function () {
        this.writeDBFile(function () {
            console.log("Saved.");
        });
    },
    
    writeDBFile: function (onwrite) {
        var self = this;
        fs.writeFile(self.getFileName(), JSON.stringify(self.data), function() {
            if (onwrite) onwrite();
        });
    }

}

var Task = function (description) {
    this.description = description;
    this.datetime = new Date().toJSON();
    this.completed = false;
    this.tasks = [];
    
    this.data = {};
    this.init();
}

Task.prototype = {
    
    init: function () {
        
    },
    
    json: function() {
        return {
            completed: this.completed,
            datetime: this.datetime,
            tasks: this.tasks,
            description: this.description
        }
    },

    add: function(subtask) {
        this.tasks.push(subtask);
    }
}


module.exports = function (desc) {
    return new Progress(desc);
}

/*
var example = {
    tasks: [
        {
            datetime: '2012-05-01T06:05:033Z',
            description: 'Hunting down a weird error on web1',
            completed: false
            tasks: [
                {
                    datetime: '2012-05-01T06:05:033Z',
                    description: "Logs show an error with smtp, connection refused",
                    completed: false
                    tasks: [
                        {
                            datetime: '2012-05-01T06:05:033Z',
                            description: "Why does this work on web2",
                            completed false
                        },
                        {
                            datetime: '2012-05-01T06:05:033Z',
                            description: "Postfix not installed on web1",
                            completed false
                        }
                    ]
                }
            ]
        }
    ]
}
*/

