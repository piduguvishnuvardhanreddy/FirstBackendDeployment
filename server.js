const express = require('express');
const path = require('path');
const {open} = require('sqlite');
const sqlite3 = require('sqlite3');
const cors = require('cors');
let db;
const dbPath = path.join(__dirname, "full.db");
const app = express();
app.use(express.json());
app.use(cors());

const initializeDbandServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });
        app.listen(3000, () => {
            console.log("Server is running on http://localhost:3000/")
        });
    }
    catch(error) {
        console.log(`Database Error is ${error.message}`);
        process.exit(1);
    }
};

initializeDbandServer();

// API 1 

app.get("/home/", async (request, response) => {
    const addName = `SELECT * FROM todos;`;
    const dbResponse = await db.all(addName);
    response.send(dbResponse);
  });

// API 2
app.post("/home/", async (request,response) => {
    const  {newname} = request.body;
    const insertQuery = `INSERT INTO todos (name) VALUES ('${newname}');`;
    const dbResponse = await db.run(insertQuery);
    const bookId = dbResponse.lastID;
    response.send( bookId );
});
//API3 
app.get("/", async (request,response) => {
    const getCartQuery = `SELECT * FROM CART;`;
    const dbResponse = await db.all(getCartQuery);
    response.send(dbResponse);
});

// API 4 
app.post("/", async (request,response) => {
    const {id, product_name, quantity} = request.body;
    const getCart = `INSERT INTO CART(id,product_name,quantity) VALUES("${id}","${product_name}","${quantity}");`;
    const dbResponse = await db.run(getCart);
    const itemId = dbResponse.lastID;
    response.send({id: itemId});
});
// API 5 
app.get('/user/', async (request,response) => {
    const getUser = `SELECT * FROM user;`;
    const dbResponse = await db.all(getUser);
    response.send(dbResponse);
})

// API RRGISTER 
app.post("/user/", async (request, response) => {
    const { username,  password, name } = request.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`;
    const dbUser = await db.get(selectUserQuery);
    if (dbUser === undefined) {
      const createUserQuery = `
        INSERT INTO 
          user (username, password, name) 
        VALUES 
          (
            '${username}', 
            '${hashedPassword}', 
            '${name}',
          )`;
      const dbResponse = await db.run(createUserQuery);
      const newUserId = dbResponse.lastID;
      response.send(`Created new user with ${newUserId}`);
    } else {
      response.status = 400;
      response.send("User already exists");
    }
  });


