require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const filter = require("bad-words");

const app = express();

mongoose.connect(process.env.DB_URI, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const badWordFilter = new filter();

const ingredientSchema = new mongoose.Schema({
    name: String,
    quantity: String
});

const kuihSchema = new mongoose.Schema({
    kuihId: String,
    name: String,
    about: String,
    ingredients: [ingredientSchema],
    recipe: [String],
    puzzle: Boolean
});

const scoreSchema = new mongoose.Schema({
    username: String,
    kuihName: String,
    score: Number
});

const Ingredient = new mongoose.model("Ingredient", ingredientSchema);
const Kuih = new mongoose.model("Kuih", kuihSchema);
const Score = new mongoose.model("Score", scoreSchema);

app.get("/", (req, res) => {
    Kuih.find({puzzle: true}, (err, foundKuihs) => {
        if (!err) {
            res.render("home", {kuihs: foundKuihs});
        }
    });
});

app.get("/composethekuih", (req, res) => {
    res.render("compose");
});

app.get("/directory", (req, res) => {
    Kuih.find({}, null, {sort: {name: 1}}, (err, foundKuihs) => {
        if (!err) {
            res.render("directory", {kuihs: foundKuihs});
        } else {
            res.redirect("/");
        }
    });
});

app.get("/scoreboard", (req, res) => {
    Kuih.find({puzzle: true}, (err, foundKuihs) => {
        if (!err) {
            Score.find({}, null, {sort: {score: 1}}, (error, foundScores) => {
                if (!error) {
                    res.render("scoreboard", {scores: foundScores, kuihs: foundKuihs, all: true});
                }
            });
        } else {
            res.redirect("/");
        }
    });
});

app.get("/scoreboard/:kuih", (req, res) => {
    const kuihId = req.params.kuih.toLowerCase().replace(/ /g,'');

    Kuih.find({puzzle: true}, (err1, foundKuihs) => {
        if (!err1) {
            Kuih.findOne({kuihId: kuihId}, (err2, kuih) => {
                if (!err2) {
                    Score.find({kuihName: kuih.name}, null, {sort: {score: 1}}, (err3, foundScores) => {
                        if (!err3) {
                            res.render("scoreboard", {scores: foundScores, kuihs: foundKuihs, kuihName: kuih.name, all: false});
                        } else {
                            res.redirect("/scoreboard");
                        }
                    });
                } else {
                    res.redirect("/scoreboard");
                }
            });
        } else {
            res.redirect("/scoreboard");
        }
    });
});

app.get("/:kuih", (req, res) => {
    const kuihId = req.params.kuih.toLowerCase().replace(/ /g,'');

    Kuih.findOne({kuihId: kuihId}, (err, foundKuih) => { // returns and object   .find() returns an array
        if (!err) {
            if (!foundKuih) {
                res.redirect("/");
            } else {
                res.render("blog", {kuih: foundKuih});
            }
        } else {
            res.redirect("/");
        }
    });
});

app.get("/:kuih/puzzle", (req, res) => {
    const kuihId = req.params.kuih.toLowerCase().replace(/ /g,'');

    Kuih.findOne({kuihId: kuihId, puzzle: true}, (err, foundKuih) => { // returns and object   .find() returns an array
        if (!err) {
            if (!foundKuih) {
                res.redirect("/");
            } else {
                res.render("puzzle", {name: foundKuih.name, kuihId: foundKuih.kuihId});
            }
        } else {
            res.redirect("/");
        }
    });
});

app.post("/add", (req, res) => {
    const {kuihName, about, ingredients, recipe, puzzle} = req.body;
    let ingredientListToSave = [];
    const ingredientsSplitList = ingredients.split("///");
    ingredientsSplitList.forEach(ingredient => {
        const [quantity, item] = ingredient.split("...");
        const newIngredient = new Ingredient({
            name: item,
            quantity: quantity
        });
        ingredientListToSave.push(newIngredient);
    });

    const recipeList = recipe.split("///");
    const newKuih = new Kuih({
        kuihId: kuihName.toLowerCase().replace(/ /g,''),
        name: kuihName,
        about: about,
        ingredients: ingredientListToSave,
        recipe: recipeList,
        puzzle: Boolean(puzzle)
    });

    console.log(newKuih);

    newKuih.save()
    res.redirect("/compose");
});

app.post("/updatescore", (req, res) => {
    const {username, kuihName, score} = req.body;

    if (badWordFilter.list.includes(username)) {
        res.send("Your score will not be updated as your username contains profanities. Press the browser's back button to return.");
    } else {
        Score.findOne({username: username, kuihName: kuihName}, (err, foundScore) => {
            if (!err) {
                if (!foundScore) {
                    const newScore = new Score({
                        username: username,
                        kuihName: kuihName,
                        score: score
                    });
                    newScore.save();
                    res.redirect("/"+kuihName);
                } else {
                    if (score < foundScore.score) {
                        Score.findOneAndUpdate(
                            {username: username, kuihName: kuihName},
                            {score: score},
                            (error, foundScoreToUpdate) => {
                                if (!error) {
                                    res.redirect("/"+kuihName);
                                } else {
                                    res.redirect("/"+kuihName);
                                }
                            });
                    } else {
                        res.redirect("/"+kuihName);
                    }
                }
            } else {
                res.redirect("/");
            }
        });
    }
});

app.listen(3000, () => {
    console.log("Server has started on port 3000");
});
