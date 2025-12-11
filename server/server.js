const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" })); 


const DB_CONFIG = {
  host: "localhost",
  user: "root",
  password: "",
  database: "movie_app",
};


function ensureDatabaseAndTables(cb) {
  const tmpCfg = { host: DB_CONFIG.host, user: DB_CONFIG.user, password: DB_CONFIG.password };
  const tmpConn = mysql.createConnection(tmpCfg);

  tmpConn.connect((err) => {
    if (err) {
      console.error("MySQL (temporary) connection failed:", err.message);
      return cb(err);
    }

    
    tmpConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
      (err) => {
        if (err) {
          console.error("Failed creating database:", err.message);
          tmpConn.end();
          return cb(err);
        }

        
        tmpConn.changeUser({ database: DB_CONFIG.database }, (err) => {
          if (err) {
            console.error("Failed to select database:", err.message);
            tmpConn.end();
            return cb(err);
          }

          const createTableSQL = `CREATE TABLE IF NOT EXISTS movies (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            rating DECIMAL(3,1) DEFAULT NULL,
            image LONGTEXT DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

          tmpConn.query(createTableSQL, (err) => {
            tmpConn.end();
            if (err) {
              console.error("Failed creating table:", err.message);
              return cb(err);
            }
           
            return cb(null);
          });
        });
      }
    );
  });
}


let db;

function startServer() {
  
  db = mysql.createConnection(DB_CONFIG);

  db.connect((err) => {
    if (err) {
      console.error("MySQL connection failed:", err.message);
      
      process.exit(1);
    }
    console.log("MySQL connected");



    app.get("/movies", (req, res) => {
      db.query("SELECT * FROM movies", (err, result) => {
        if (err) {
          console.error("GET /movies error:", err.message);
          return res.status(500).json({ message: "Database error", error: err.message });
        }
        res.json(result);
      });
    });

  
    app.get("/movies/:id", (req, res) => {
      db.query("SELECT * FROM movies WHERE id=?", [req.params.id], (err, result) => {
        if (err) {
          console.error(`GET /movies/${req.params.id} error:`, err.message);
          return res.status(500).json({ message: "Database error", error: err.message });
        }
        if (!result || result.length === 0) return res.status(404).json({ message: "Not found" });
        res.json(result[0]);
      });
    });

    
    app.post("/movies", (req, res) => {
      const { name, rating, image } = req.body;
      if (!name) return res.status(400).json({ message: "Name is required" });

      db.query(
        "INSERT INTO movies (name, rating, image) VALUES (?, ?, ?)",
        [name, rating || null, image || null],
        (err, result) => {
          if (err) {
            console.error("POST /movies error:", err.message);
            return res.status(500).json({ message: "Database error", error: err.message });
          }
          res.status(201).json({ message: "Created", id: result.insertId });
        }
      );
    });

    
    app.put("/movies/:id", (req, res) => {
      const { name, rating, image } = req.body;
      if (!name) return res.status(400).json({ message: "Name is required" });

      let sql, data;

      if (image) {
        sql = "UPDATE movies SET name=?, rating=?, image=? WHERE id=?";
        data = [name, rating || null, image, req.params.id];
      } else {
        sql = "UPDATE movies SET name=?, rating=? WHERE id=?";
        data = [name, rating || null, req.params.id];
      }

      db.query(sql, data, (err, result) => {
        if (err) {
          console.error(`PUT /movies/${req.params.id} error:`, err.message);
          return res.status(500).json({ message: "Database error", error: err.message });
        }
        if (result.affectedRows === 0) return res.status(404).json({ message: "Not found" });
        res.json({ message: "Updated" });
      });
    });

 
    app.delete("/movies/:id", (req, res) => {
      db.query("DELETE FROM movies WHERE id=?", [req.params.id], (err, result) => {
        if (err) {
          console.error(`DELETE /movies/${req.params.id} error:`, err.message);
          return res.status(500).json({ message: "Database error", error: err.message });
        }
        if (result.affectedRows === 0) return res.status(404).json({ message: "Not found" });
        res.json({ message: "Deleted" });
      });
    });

    const PORT = process.env.PORT || 8081;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
}


ensureDatabaseAndTables((err) => {
  if (err) {
    console.error("Database initialization failed:", err.message);
    process.exit(1);
  }
  startServer();
});
