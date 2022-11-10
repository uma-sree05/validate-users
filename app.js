const express = require("express");
const app = express();
const path = require("path");
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");

const dbPath = path.join(__dirname, "userData.db");

let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

// Get Books API
app.get("/register", async (request, response) => {
  const getBooksQuery = `
  SELECT
    *
  FROM
    user;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});
const passwordValid = (password) => {
  return password.length > 4;
};

//API 1 CREATE USER
app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUserQuery = `
     SELECT username FROM user 
     WHERE 
     username='${username}';`;
  const dbUser = await db.get(selectUserQuery);

  //SCENARIO 1
  if (dbUser === undefined) {
    const createUser = `INSERT INTO 
    user (username,name,password,gender,location) 
    VALUES(
        '${username}',
        '${name}',
        '${hashedPassword}',
        '${gender}',
        '${location}'
    );`;

    if (passwordValid(password)) {
      await db.run(createUser);
      response.send("User created successfully");
    } else {
      //SCENARIO 2 PASSWORD SHORT
      response.status(400);
      response.send("Password is too short");
    }
  } else {
    //SCENARIO 1 SEND USER EXISTS
    response.status(400);
    response.send("User already exists");
  }
});

//API 2
app.post("/login", async (request, response) => {
  const { username, password } = request.body;

  const selectUserQuery = `
    SELECT 
        *
    FROM user
     WHERE 
     name ='${name};`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    //SCENARIO 1
    response.status(400);
    response.send("Invalid user");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched === true) {
      //SCENARIO 2
      response.status(200);
      response.send("Login success!");
    } else {
      //SCENARIO 3
      response.status(400);
      response.send("Invalid password");
    }
  }
});

//API 3

app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const selectUserQuery = `
     SELECT * FROM user 
     WHERE 
     username='${username}';`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const passwordValid = await bcrypt.compare(oldPassword, dbUser.password);
    if (isPasswordMatched === true) {
      if (validatePassword(newPassword)) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatePasswordQuery = `
          UPDATE
            user
          SET
            password = '${hashedPassword}'
          WHERE
            username = '${username}';`;

        const user = await db.run(updatePasswordQuery);

        response.send("Password updated");
      } else {
        response.status(400);
        response.send("Password is too short");
      }
    } else {
      response.status(400);
      response.send("Invalid current password");
    }
  }
});

module.exports = app;
