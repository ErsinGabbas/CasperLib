const express = require("express");
const mongoose = require("mongoose");
const translate = require('translate-google');
const path = require('path');
require('dotenv').config();
const fetch = require('node-fetch');
const app = express();
const PORT = 3000;
const BookUser = require("./models/Users");

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use('/public', express.static(path.join(process.cwd(), 'public')));
app.set("view engine", "ejs");
app.set('views',path.join(process.cwd(), 'views'));

mongoose.connect("mongodb+srv://ersingabbas:yElTz7GoGRty1xms@cluster0.m5ygie5.mongodb.net/").then( () => {
    console.log("Connected to MongoDB");
}).catch( (error) => {
    console.log("Error: ", error);
});

app.get("/", (req, res) => {
    res.render("restrictedPage", { error: "" });
});

app.get("/login", (req, res) => {
    res.render("login", { error: "" });
});

app.get("/books", (req, res) => {
    res.render("index");
});

app.get("/logout", (req, res) => {
    res.render("login")
});

app.get('/search', async (req, res) => {
    const searchTerm = req.query.term;
    try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchTerm}`);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            res.json(data.items);
        } else {
            res.status(404).json({ error: 'No results found' });
        }
    } catch (error) {
        console.error('Error searching books:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get("/users", (req, res) => {
   res.render("admin")
});

app.post("/translate", (req, res) => {
    translate(req.body.text, { to: "ru" }).then((translation) => {
        res.json(translation);
    }).catch((error) => {
        console.error("Translation error:", error);
    });
});

app.post("/signIn", async (req, res) => {
    try {
        const user = await BookUser.findOne({ name: req.body.name });
        if (user) {
            const result = req.body.password === user.password;
            if (result) {
                if (user.adminStatus === true) {
                    res.redirect(`/users`);
                } else {
                    res.redirect(`/books?username=${user.name}`);
                }
            } else {
                res.render("login", { error: "Password is incorrect" });
            }
        } else {
            res.render("login", { error: "User does not exist" });
        }
    } catch (error) {
        res.json({ error });
    }
});

app.post("/signUp", async (req, res) => {
    try {
        let user = new BookUser({
            name: req.body.name,
            password: req.body.password,
            adminStatus: false
        });
        const isExists = await BookUser.findOne({ name: user.name });
        if (isExists) {
            res.render("login", { error: "This user already exists" });
        } else {
            await user.save();
            res.redirect(`/books?username=${user.name}`);
        }
    } catch (error) {
        res.json({ message: error.message });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Logout failed. Please try again.');
        } else {
            res.redirect('/login');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
