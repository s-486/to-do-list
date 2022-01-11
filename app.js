const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const date = require(__dirname + "/date.js");

const app = express();
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));

const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];


//GET METHOD FOR HOME ROUTE
app.get("/", (req, res)=> {
    
    const day = date.getDate();
    res.render("list", {listTitle: day, newListItems:items});
});

//POST METHOD FOR HOME ROUTE
app.post("/", (req, res)=> {
    item = req.body.newItem;
    if (req.body.list === 'Work List') {
        workItems.push(item);
        res.redirect("/work");
    }
    else {
        items.push(item);
        res.redirect("/");
    }
});

//GET METHOD FOR WORK ROUTE
app.get("/work", (req, res)=> {
    res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.post("/work", (req, res)=> {
    const item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
});

app.get("/about", (req, res)=> {
    res.render("about");
})


app.listen(3000, ()=>{
    console.log("server is up and running.");
});