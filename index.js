const express = require("express");
const app = express();
const cors = require("cors");

//POSTできたりするように（おまじない）
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//sqlite3関連設定
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./main.db", (err) => {
    if (err) {
        console.error("database error: " + err.message);
    } else {
        db.serialize(() => {
            //都度table削除（あれば）
            db.run("drop table if exists lists");
            //table生成（無ければ）
            db.run("create table if not exists lists( \
                id integer primary key autoincrement, \
                name text, \
                longitude integer, \
                latitude integer, \
                altitude integer \
            )", (err) => {
                if (err) {
                    console.error("table error: " + err.message);
                }
            });
        });
    }
});
const db2 = new sqlite3.Database("./main2.db", (err) => {
    if (err) {
        console.error("database error: " + err.message);
    } else {
        db2.serialize(() => {
            //都度table削除（あれば）
            //db2.run("drop table if exists lists");
            //table生成（無ければ）
            db2.run("create table if not exists lists( \
                id integer primary key autoincrement, \
                name text, \
                longitude1 integer, \
                latitude1 integer, \
                altitude1 integer, \
                longitude2 integer, \
                latitude2 integer, \
                altitude2 integer \
            )", (err) => {
                if (err) {
                    console.error("table error: " + err.message);
                }else{
                    db2.run("insert into lists(name,longitude1,latitude1,altitude1,longitude2, latitude2, altitude2) values('Hiroshimaa',133.4553 ,34.3853, 50, 150 ,40, 100)");
                }
            });
        });
    }
});
//リッスン開始
app.listen(3001, () => {
    console.log("Start server on port 3001.");
});

app.get("/", (req, res) => {
    res.send("welcome");
});

//create
app.post("/lists", (req, res) => {
    const reqBody = req.body;
    const stmt = db.prepare("insert into lists(name,longitude,latitude,altitude) values(?,?,?,?)"); //lastID取得のため
    stmt.run(reqBody.name, reqBody.longitude, reqBody.latitude, reqBody.altitude, (err, result) => { //lambda式を使うとthis.lastIDでは取得できない
        if (err) {
            res.status(400).json({
                "status": "error",
                "message": err.message
            });
            return;
        } else {
            res.status(201).json({
                "status": "OK",
                "lastID": stmt.lastID
            });
        }
        console.log("inserted", reqBody);
    });
});

//get lists
app.get("/lists", (req, res) => {
    db.all("select * from lists", [], (err, rows) => {
        if (err) {
            res.status(400).json({
                "status": "error",
                "message": err.message
            });
            return;
        } else {
            res.status(200).json({
                "status": "OK",
                "lists": rows
            });
        }
    });
});
//creaste2
app.post("/lists2", (req, res) => {
    const reqBody = req.body;
    const stmt = db2.prepare("insert into lists(name,longitude1,latitude1,altitude1,longitude2,latitude2,altitude2) values(?,?,?,?)"); //lastID取得のため
    stmt.run(reqBody.name, reqBody.longitude1, reqBody.latitude1, reqBody.altitude1, reqBody.longitude2, reqBody.latitude2, reqBody.altitude2, (err, result) => { //lambda式を使うとthis.lastIDでは取得できない
        if (err) {
            res.status(400).json({
                "status": "error",
                "message": err.message
            });
            return;
        } else {
            res.status(201).json({
                "status": "OK",
                "lastID": stmt.lastID
            });
        }
    });
});

//get lists2(二点間の直線)
app.get("/lists2", (req, res) => {
    db2.all("select * from lists", [], (err, rows) => {
        if (err) {
            res.status(400).json({
                "status": "error",
                "message": err.message
            });
            return;
        } else {
            res.status(200).json({
                "status": "OK",
                "lists": rows
            });
        }
    });
});

//get member
app.get("/lists/:id", (req, res) => {
    const id = req.params.id;
    db.get("select * from lists where id = ?", id, (err, row) => {
        if (err) {
            res.status(400).json({
                "status": "error",
                "message": err.message
            });
            return;
        } else {
            res.status(200).json({
                "status": "OK",
                "lists": row
            });
        }
    })
})

// update member
app.patch("/lists", (req, res) => {
    const { id, name, longitude, latitude, altitude } = req.body;
    const stmt = db.prepare("UPDATE lists SET name = ?, longitude = ?, latitude = ?, altitude = ? WHERE id = ?");
    stmt.run(name, longitude, latitude, altitude, id, function(err) {
        if (err) {
            res.status(400).json({
                "status": "error",
                "message": err.message
            });
            return;
        } else {
            res.status(200).json({
                "status": "OK",
                "updatedID": this.changes
            });
        }
    });
});

//delete member
app.delete("/lists/:id", (req, res) => {
    const id = req.params.id;
    const stmt = db.prepare("DELETE FROM lists WHERE id = ?");
    stmt.run(id, function(err) {
        if (err) {
            res.status(400).json({
                "status": "error",
                "message": err.message
            });
            return;
        } else {
            res.status(200).json({
                "status": "OK",
                "deletedID": this.changes
            });
        }
    });
});
