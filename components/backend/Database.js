import SQLite from 'react-native-sqlite-storage';
//SQLite.DEBUG(true);
SQLite.enablePromise(true);
const database_name = "ConnectsBy.db";
const database_version = "1.0";
const database_displayname = "ConnectsBy Database";

export default class Database {
  //------------------------------------------------------------------------------------
  //Initialize database
  initDB() {
    let db;
    return new Promise((resolve, reject) => {
      console.log("Plugin integrity check ...");
      SQLite.echoTest()
        .then(() => {
          console.log("Integrity check passed ...");
          console.log("Opening database ...");
          SQLite.openDatabase(
            database_name,
            database_version,
            database_displayname
          )
            .then(DB => {
              db = DB;
              console.log("Database OPEN");
              resolve(db);
            })
            .catch(error => {
              reject();
              console.log(error);
            });
        })
        .catch(error => {
          console.log("echoTest failed - plugin not functional");
        });
    });
  };
  //Database Closing function
  closeDatabase(db) {
    if (db) {
      console.log("Closing DB");
      db.close()
        .then(status => {
          console.log("Database CLOSED");
        })
        .catch(error => {
          this.errorCB(error);
        });
    } else {
      console.log("Database was not OPENED");
    }
  };

  //----------------------------------------------------------------------------------
  //User table operations
  initUserTable() {
    return new Promise((resolve, reject) => {
      this.initDB().then((db) => {
        // db.executeSql('DROP TABLE IF EXISTS  UserTable').then(([tx, results]) => {
        // console.log("Table Deleted");
        //});
        db.executeSql('SELECT 1 FROM UserTable LIMIT 1').then(() => {
          console.log("Database is ready ... executing query ...");
          resolve(db);
        }).catch((error) => {
          console.log("Received error: ", error);
          console.log("Database not yet ready ... populating data");
          db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS UserTable (index_no INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL, phone2 TEXT, email TEXT, company TEXT, jobTitle TEXT, address TEXT)");
          }).then(() => {
            console.log("User table created successfully");
            resolve(db);
          }).catch(error => {
            console.log(error);
            reject();
          });
        });
      }).catch(error => {
        console.log(error);
        reject();
      });
    });
  };

  addUserDetails(name, phone, phone2, email, company, jobTitle, address) {
    return new Promise((resolve, reject) => {
      this.initUserTable().then((db) => {
        db.transaction((tx) => {
          tx.executeSql('INSERT INTO UserTable (name, phone, phone2, email, company, jobTitle, address) VALUES (?, ?, ?, ?, ?, ?, ?)', [name, phone, phone2, email, company, jobTitle, address]).then(([tx, results]) => {
            console.log("Insert Query Executed")
            console.log(results)
            resolve(results);
          });
        }).then((result) => {
          this.closeDatabase(db);
        }).catch((err) => {
          reject();
          console.log(err);
        });
      }).catch((err) => {
        reject();
        console.log(err);
      });
    });
  }

  getUserDetails() {
    return new Promise((resolve, reject) => {
      this.initUserTable().then((db) => {
        db.transaction((tx) => {
          tx.executeSql('SELECT * FROM  UserTable where index_no = 1', []).then(([tx, results]) => {
            console.log("Select Query completed");
            if (results.rows.length > 0) {
              let row = results.rows.item(0);
              const { name, phone, phone2, email, company, jobTitle, address } = row;
              resolve({ name, phone, phone2, email, company, jobTitle, address });
            } else {
              resolve();
            }
          });
        }).then((result) => {
          this.closeDatabase(db);
        }).catch((err) => {
          console.log(err);
          reject();
        });
      }).catch((err) => {
        console.log(err);
        reject();
      });
    });
  }

  updateUserDetails(name, phone, phone2, email, company, jobTitle, address) {
    return new Promise((resolve, reject) => {
      this.initUserTable().then((db) => {
        db.transaction((tx) => {
          tx.executeSql('UPDATE UserTable SET name = "' + name + '", phone = "' + phone + '", phone2 = "' + phone2 + '", email = "' + email + '", company = "' + company + '", jobTitle = "' + jobTitle + '", address = "' + address + '"').then(([tx, results]) => {
            console.log("Update Query Executed")
            resolve(results);
          });
        }).then((result) => {
          this.closeDatabase(db);
        }).catch((err) => {
          console.log(err);
          reject();
        });
      }).catch((err) => {
        console.log(err);
        reject();
      });
    });
  }

  //----------------------------------------------------------------------------------
  //Table operations
  initTableList() {
    return new Promise((resolve, reject) => {
      this.initDB().then((db) => {
        db.executeSql('SELECT 1 FROM tablesList LIMIT 1').then(() => {
          console.log("Database is ready ... executing query ...");
          resolve(db);
        }).catch((error) => {
          console.log("Received error: ", error);
          console.log("Database not yet ready ... populating data");
          db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS tablesList (index_no INTEGER PRIMARY KEY AUTOINCREMENT, tableName TEXT UNIQUE NOT NULL)");
          }).then(() => {
            console.log("tableList table created successfully");
            resolve(db);
          }).catch(error => {
            console.log(error);
            reject();
          });
        });
      }).catch(error => {
        console.log(error);
        reject();
      });
    });
  };

  addTable(tableName) {
    return new Promise((resolve, reject) => {
      this.initTableList().then((db) => {
        db.transaction((tx) => {
          tx.executeSql('INSERT INTO tablesList (tableName) VALUES (?)', [tableName]).then(([tx, results]) => {
            console.log("Inserted new table name in tablesList table")
          });
          tx.executeSql("CREATE TABLE IF NOT EXISTS " + tableName + " (index_no INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL, time TIMESTAMP DEFAULT (datetime('now','localtime')))")
            .then(([tx, res]) => {
              console.log("Created new table")
            });
        })
          .then((result) => {
            this.closeDatabase(db);
            resolve();
          })
          .catch((err) => {
            reject()
            console.log(err);
          });
      })
        .catch((err) => {
          console.log(err);
          reject();
        });
    })
  }

  renameTable(oldTableName, newTableName) {
    return new Promise((resolve, reject) => {
      this.initTableList().then((db) => {
        db.transaction((tx) => {
          tx.executeSql('UPDATE tablesList SET tableName = "' + newTableName + '" WHERE tableName = "' + oldTableName + '"').then(([tx, results]) => {
            console.log("Updated table name in tablesList")
          });
          tx.executeSql("ALTER TABLE " + oldTableName + " RENAME TO " + newTableName)
            .then(([tx, res]) => {
              console.log("Changed Table name")
            });
        })
          .then((result) => {
            this.closeDatabase(db);
            resolve();
          })
          .catch((err) => {
            console.log(err);
            reject();
          });
      })
        .catch((err) => {
          console.log(err);
          reject();
        });
    })
  }

  deleteTable(tablesToDelete) {
    return new Promise((resolve, reject) => {
      this.initTableList().then((db) => {
        db.transaction((tx) => {
          tablesToDelete.map((item) => {
            tx.executeSql('DROP TABLE IF EXISTS ' + item.tableName).then(([tx, results]) => {
              console.log("Table Deleted");
            });
            tx.executeSql('DELETE FROM tablesList WHERE tableName = ?', [item.tableName]).then(([tx, results]) => {
              console.log("Delete Query Executed");
            });
          })

        }).then((result) => {
          this.closeDatabase(db);
          resolve();
        }).catch((err) => {
          console.log(err);
          reject();
        });
      }).catch((err) => {
        console.log(err);
        reject();
      });
    });
  }
  listTables() {
    return new Promise((resolve, reject) => {
      const tables = [];
      this.initTableList().then((db) => {
        db.transaction(tx => {
          tx.executeSql('SELECT * FROM tablesList', [], (tx, results) => {
            let len = results.rows.length;
            for (let i = len - 1; i >= 0; i--) {
              let row = results.rows.item(i);
              const { index_no, tableName } = row;
              tables.push({
                index_no,
                tableName
              });
            }
            resolve(tables);
          });
        })
          .then((result) => {
            this.closeDatabase(db);
          })
          .catch((err) => {
            console.log(err);
            reject();
          });
      }).catch((err) => {
        console.log(err);
        reject();
      });
    })
  }

  //Called from getManyTableData
  getTableData(tx, tableName) {
    return new Promise((resolve) => {
      const tableData = [];
      tx.executeSql('SELECT * FROM ' + tableName, []).then(([tx, results]) => {
        let len = results.rows.length;
        for (let i = 0; i < len; i++) {
          let row = results.rows.item(i);
          const { index_no, name, phone, time } = row;
          tableData.push({
            name,
            phone,
            time
          });
        }
        resolve({ tableName, tableData });
      });
    })
  }

  getManyTableData(tableNames) {
    return new Promise((resolve, reject) => {
      const selectedTablesData = [];
      let promises = [];
      this.initTableList().then((db) => {
        db.transaction((tx) => {
          tableNames.forEach(tableName => {
            promises.push(this.getTableData(tx, tableName));
          });
          Promise.all(promises)
            .then((results) => {
              results.forEach((result) => {
                let tableName = result.tableName;
                let tableData = result.tableData;
                selectedTablesData.push({
                  tableName,
                  tableData
                })

              })
              resolve(selectedTablesData);
            })
        }).then((res) => {
          this.closeDatabase(db);
        }).catch((err) => {
          console.log(err);
          reject();
        });

      }).catch((err) => {
        console.log(err);
        reject();
      });
    });
  }

  //----------------------------------------------------------------------------------
  //Table content operations
  addPerson(tableName, name, phone) {
    return new Promise((resolve, reject) => {
      this.initDB().then((db) => {
        db.transaction((tx) => {
          tx.executeSql('INSERT INTO ' + tableName + ' (name, phone) VALUES (?, ?)', [name, phone]).then(([tx, results]) => {
            console.log("Insert Query Executed")
            resolve(results);
          });
        }).then((result) => {
          this.closeDatabase(db);
        }).catch((err) => {
          console.log(err);
          reject();
        });
      }).catch((err) => {
        console.log(err);
        reject();
      });
    });
  }

  updatePerson(tableName, index_no, name, phone) {
    return new Promise((resolve, reject) => {
      this.initDB().then((db) => {
        db.transaction((tx) => {
          tx.executeSql('UPDATE ' + tableName + ' SET name = "' + name + '", phone = "' + phone + '" WHERE index_no = "' + index_no + '"').then(([tx, results]) => {
            console.log("Update Query Executed")
            resolve(results);
          });
        }).then((result) => {
          this.closeDatabase(db);
        }).catch((err) => {
          console.log(err);
          reject();
        });
      }).catch((err) => {
        console.log(err);
        reject();
      });
    });
  }

  listPeople(tableName) {
    return new Promise((resolve, reject) => {
      const people = [];
      this.initDB().then((db) => {
        db.transaction((tx) => {
          tx.executeSql('SELECT * FROM ' + tableName, []).then(([tx, results]) => {
            console.log("List People Query completed");
            let len = results.rows.length;
            for (let i = len - 1; i >= 0; i--) {
              let row = results.rows.item(i);
              const { index_no, name, phone, time } = row;
              let sl_no = i + 1;
              people.push({
                sl_no,
                index_no,
                name,
                phone,
                time
              });
            }
            resolve(people);
          });
        }).then((result) => {
          this.closeDatabase(db);
        }).catch((err) => {
          console.log(err);
          reject();
        });
      }).catch((err) => {
        console.log(err);
        reject();
      });
    });
  }

  deletePerson(tableName, id) {
    return new Promise((resolve, reject) => {
      this.initDB().then((db) => {
        db.transaction((tx) => {
          tx.executeSql('DELETE FROM ' + tableName + ' WHERE index_no = ?', [id]).then(([tx, results]) => {
            console.log("Delete Query Executed");
            resolve(results);
          });
        }).then((result) => {
          this.closeDatabase(db);
        }).catch((err) => {
          console.log(err);
          reject();
        });
      }).catch((err) => {
        console.log(err);
        reject();
      });
    });
  }

  deleteManyPerson(tableName, ids) {
    return new Promise((resolve, reject) => {
      this.initDB().then((db) => {
        db.transaction((tx) => {
          tx.executeSql('DELETE FROM ' + tableName + ' WHERE index_no in (' + ids + ')').then(([tx, results]) => {
            console.log("Delete Query Executed");
            resolve(results);
          });
        }).then((result) => {
          this.closeDatabase(db);
        }).catch((err) => {
          console.log(err);
          reject();
        });
      }).catch((err) => {
        console.log(err);
        reject();
      });
    });
  }
}