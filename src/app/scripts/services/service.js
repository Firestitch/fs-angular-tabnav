(function () {

    angular.module('fs-angular-indexstorage',[])
    .provider('fsIndexStorage', function () {

        var Query = function(name, database) {

            var conditions = [];
            self = this;

            this.where = function(name,operator,value) {
                conditions.push({ name: name, operator: operator, value: value });
                return this;
            }

            this.get = function() {
                return new Promise(
            
                    function(resolve, reject) {
                        
                        self.gets()
                        .then(function(gets) { 
                            resolve(gets[0]);
                        })
                        .catch(function(error) {
                            reject(error);
                        });                        
                    } 
                );
            }

            this.gets = function() {

                return new Promise(
            
                    function(resolve, reject) {

                        database.objectStore(name,{ mode: 'readonly' })
                        .then(function(store) { 

                            var condition = function() {

                                for (var c = 0, clen = conditions.length; c !== clen; c++) {
                                    for (var i = 0, ilen = store.indexNames.length; i !== ilen; i++) {
                                        if(store.indexNames[i]==conditions[c].name) {
                                            return conditions.splice(c,1)[0];
                                        }
                                    }
                                }

                            }();
                          
                            if(condition) {
                                var index = store.index(condition.name);
                                var range = IDBKeyRange.only(condition.value);
                                var cursor = index.openCursor(range);
                            } else {
                                var cursor = store.openCursor(); 
                            }

                            var data = [];
                            cursor.onsuccess = function(event) {
                                var cursor = event.target.result;
                                if (cursor) {
                                    data.push(cursor.value);
                                    cursor.continue();
                                } else {

                                    for (var c = 0, clen = conditions.length; c !== clen; c++) {
                                        
                                        for (var d = 0, dlen = data.length; d !== dlen; d++) {
                                            if(conditions[c].value!==data[d][conditions[c].name]) {
                                                data.splice(d,1);
                                            }
                                        }
                                    }

                                    resolve(data);
                                }
                            };

                            cursor.onerror = function(event) {
                                reject();
                            }; 

                        });                        
                    }
                ); 
            }        
        }

        var fsWebSqlDatabase = function(IDBDatabase) {

            var IDBDatabase = IDBDatabase;
            var self = this;

            this.db = function() {

                if(arguments.length) {
                    IDBDatabase = arguments[0];
                    return self;
                }

                return new Promise(

                    function(resolve, reject) {

                        var timeout = function() {
 
                            if(IDBDatabase)
                                resolve(IDBDatabase);
                            else
                                setTimeout(timeout,10);
                        };

                        setTimeout(timeout);
                    }
                );
            }

            this.transaction = function(name,options) {
                
                return new Promise(

                    function(resolve, reject) {

                        self.db()
                        .then(function(db) {
                            resolve(db.transaction(name,options.mode))
                        });
                    }
                );
            }

            this.objectStore = function(name, options) {

                return new Promise(

                    function(resolve, reject) {

                        self.transaction(name, options)
                        .then(function(transaction) {
                            resolve(transaction.objectStore(name));
                        });
                    }
                );                
            }  

            this.query = function(name) {
                return new Query(name, this);
            }

            this.clear = function(name, options) {

                options = options || {};

                return new Promise(
            
                    function(resolve, reject) {
                        self.objectStore(name, { mode: 'readwrite' })
                        .then(function(store) {
                            var request = store.clear(name);
                            request.onsuccess = function(event) {
                                resolve(event);
                            };
                        });
                    });
            }

            this.add = function(name, data, options) {

                options = options || {};

                self.objectStore(name, { mode: 'readwrite' })
                .then(function(store) {

                    var promises = [];

                    if(!Array.isArray(data)) {
                        data = [data];
                    }

                    if(options.replace) {

                        var request = store.getAllKeys();

                        request.onsuccess = function(event) {

                            if(options.replace) {
                                var keys = event.currentTarget.result;
                            }

                            angular.forEach(data,function(item) {
                                var promise = new Promise(
                            
                                    function(resolve, reject) {

                                        var exist = keys.indexOf(item[store.keyPath])>=0;
                                        var request = exist ? store.put(item) : store.add(item);
                                      
                                        request.onsuccess = function(event) {
                                            resolve();
                                        };

                                        request.onerror = function(event) {
                                            reject(event.target.error.message);
                                        }; 
                                    }
                                ).catch(function(error) {
                                    indexeddb.log(error);
                                });

                                promises.push(promise); 
                            });

                            Promise.all(promises);
                        }

                    } else {
                       
                        angular.forEach(data,function(item) {
                            var promise = new Promise(
                        
                                function(resolve, reject) {

                                    var request = store.add(item);
                                  
                                    request.onsuccess = function(event) {
                                        resolve();
                                    };

                                    request.onerror = function(event) {
                                        reject(event.target.error.message);
                                    }; 
                                }
                            ).catch(function(error) {
                                indexeddb.log(error);
                            });

                            promises.push(promise); 
                        });

                        Promise.all(promises);
                    }

                });
            }
        }

        var UpgradeDB = function(IDBDatabase) {

            var IDBDatabase = IDBDatabase;
            var self = this;

            this.db = function() {
                return IDBDatabase;
            }

            this.createStore = function(name, options) {
                options = options || {};
                if(options.key)
                    options.keyPath = options.key;
                
                var store = this.db().createObjectStore(name, options);

                if(options.key) {
                    store.createIndex(options.key, options.key); 
                }

                return { createIndex: function(name) { 
          
                       store.createIndex(name, name);
                  }};
            }
        }

        var DBDriver = function() {

        }

        /*
        var indexedDB = function(value) {

            var options = { version: 1, log: false, name: 'fsindexeddb' };
            var db = null;
            var database = new fsWebSqlDatabase(null);
            var upgrades = [];
            var self = this;

            this.open = function() {

                return new Promise(
            
                    function(resolve, reject) {

                        if (!window.openDatabase) {
                            return reject('WebSQL not supported');
                        }
                        
                        var shortName = 'fswebsql';
                        var version = '1.0';
                        var displayName = 'Database';
                        var maxSize = 65536;
                        var db = openDatabase(shortName, version, displayName, maxSize);

                        database.db(db);
                        resolve(database);
                    }
                );
            }

            this.drop = function() {

                var DBDeleteRequest = window.indexedDB.deleteDatabase(options.name);
                return this;

                return new Promise(

                        function(resolve, reject) {

                            var DBDeleteRequest = window.indexedDB.deleteDatabase(options.name);

                            DBDeleteRequest.onerror = function(event) {
                                reject();
                            };
                             
                            DBDeleteRequest.onsuccess = function(event) {
                                resolve(self);
                            };
                        });
            }

            this.upgrade = function(func, version) {
                upgrades[version] = func;
                return this;
            }

            this.options = function(opts) {
                opts = opts || {};
                angular.extend(options,opts);
                return this;
            }

            this.log = function(log) {
                
                if(options.log) {
                    console.warn(log);
                }
            }

            this.db = function() {
               return IDBDatabase;
            }

            this.database = function() {
               return database;
            }
        };
        */

        var fsIndexStorageDriver = function() {

        }

        var fsIndexStorageProvider = function() {

            var stores = [];

            this.store = function(name, options) {
                stores.push({ name: name, options: options });
                return this;
            }

            this.open = function() {

                return new Promise(
            
                    function(resolve, reject) {

                        if (!window.openDatabase) {
                            return reject('WebSQL not supported');
                        }
                        
                        var shortName = 'fswebsql';
                        var version = '1.0';
                        var displayName = 'Database';
                        var maxSize = 65536 * stores.length;
                        var db = openDatabase(shortName, version, displayName, maxSize);

                        db.transaction(function(tx) {
                             //tx.executeSql('DROP TABLE IF EXISTS DEMO');

                            tx.executeSql('CREATE TABLE DEMO (id int)');

                            tx.executeSql('desc DEMO', [], function (tx, results) {
                                debugger;

                            });
                        },
                        function (tx, err) {
                            alert("Error processing SQL: "+err);
                        },
                        function () {
                            alert("success!");
                        });

                        //resolve(database);
                    }
                );
            }
        }

        var fsindexstorageprovider = new fsIndexStorageProvider();
        angular.merge(this,fsindexstorageprovider);


        this.$get = function () {
            //return indexeddb.database();
        };
    });

})();
