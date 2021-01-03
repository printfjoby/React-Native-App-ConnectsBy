import SQLite from 'react-native-sqlite-storage';
//SQLite.DEBUG(true);
SQLite.enablePromise(true);
const database_name = "ConnectsBy.db";
const database_version = "1.0";
const database_displayname = "ConnectsBy Database";

export default class HistoryDatabase {
  //------------------------------------------------------------------------------------
  //Initialize database
  initDB() {
    let db;
    return new Promise((resolve) => {
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
  //History table operations
  initHistoryTable() {
    return new Promise((resolve) => {
      this.initDB().then((db) => {
        db.executeSql('SELECT 1 FROM HistoryTable LIMIT 1').then(() => {
          console.log("Database is ready ... executing query ...");
          resolve(db);
        }).catch((error) => {
          console.log("Received error: ", error);
          console.log("Database not yet ready ... populating data");
          db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS HistoryTable (index_no INTEGER PRIMARY KEY AUTOINCREMENT, qr_type INTEGER NOT NULL, qr_data TEXT NOT NULL, time TIMESTAMP DEFAULT (datetime('now','localtime')) )");
          }).then(() => {
            console.log("History table created successfully");
            resolve(db);
          }).catch(error => {
            console.log(error);
          });
        });
      }).catch(error => {
        console.log(error);
      });
    });
  };

  addToHistory(qr_type, qr_data) {
    console.log("dbq " + qr_data)
    return new Promise((resolve) => {
      const qrCodes = [];
      this.initHistoryTable().then((db) => {
        db.transaction((tx) => {
          tx.executeSql('INSERT INTO HistoryTable (qr_type, qr_data) VALUES (?, ?)', [parseInt(qr_type), qr_data]).then(() => {
            console.log("HistoryTable Insert Query Executed")
            resolve();
          });
        }).then((result) => {
          this.closeDatabase(db);
        }).catch((err) => {
          console.log(err);
        });
      }).catch((err) => {
        console.log(err);
      });
    });
  }

  getHistory() {
    return new Promise((resolve) => {
      const qrCodes = [];
      this.initHistoryTable().then((db) => {
        db.transaction((tx) => {
          tx.executeSql('SELECT * FROM  HistoryTable', []).then(([tx, results]) => {
            console.log("Select Query on History Table completed");
            let len = results.rows.length;
            for (let i = len - 1; i >= 0; i--) {
              let row = results.rows.item(i);
              const { index_no, qr_type, qr_data, time } = row;
              qrCodes.push({
                index_no,
                qr_type,
                qr_data,
                time
              });
            }
            resolve(qrCodes);
          });
        }).then((result) => {
          this.closeDatabase(db);
        }).catch((err) => {
          console.log(err);
        });
      }).catch((err) => {
        console.log(err);
      });
    });
  }

  deleteFromHistory(ids) {
    return new Promise((resolve) => {
      this.initDB().then((db) => {
        db.transaction((tx) => {
          tx.executeSql('DELETE FROM HistoryTable WHERE index_no in (' + ids + ')').then(([tx, results]) => {
            console.log("Deleted from HistoryTable" + JSON.stringify(results));
          });
        }).then((result) => {
          resolve();
          this.closeDatabase(db);
        }).catch((err) => {
          console.log(err);
        });
      }).catch((err) => {
        console.log(err);
      });
    });
  }
}