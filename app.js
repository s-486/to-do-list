const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const _ = require('lodash');


const app = express();
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));

const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

const itemSchema = {
    name: String
};

const Item= mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to your todo list"
});

const item2 = new Item({
    name: "press + button to add new items"
});

const item3 = new Item({
    name: "<-- check this to delete items"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema]
}

const List = mongoose.model("List", listSchema);

// Item.insertMany(defaultItems, (err)=>{
//     if(err) {
//         console.log(err);
//     } else{
//         console.log("sucessfully inserted items into DB");
//     }
// }); 



//GET METHOD FOR HOME ROUTE
app.get("/", (req, res)=> { 
    // res.render("list", {listTitle: "Today", newListItems:items});
    Item.find({}, (err, found_item)=> {
        if(found_item.length == 0) {
             Item.insertMany(defaultItems, (err)=>{
                if(err) {
                    console.log(err);
                } else{
                    console.log("sucessfully inserted items into DB");
                }
            }); 
            res.redirect("/");
        } else {
            res.render("list", {listTitle: "Today", newListItems:found_item});
        }
    });
});

app.get("/:customListName", (req, res)=> {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            } else {
                res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
            }
        }
    })

    const list = new List({
        name: customListName,
        items: defaultItems
    });

    list.save();
})

//POST METHOD FOR HOME ROUTE    
app.post("/", (req, res)=> {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    
    const item = new Item({
        name: itemName
    });

    if(req.body.list === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, (err, foundList)=> {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
    
});

app.post("/delete", (req, res)=> {
    const checkedItemId = req.body.checkBox;
    const listName = req.body.listName;

    if(listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, (err)=> {
            if(err) {
                console.log(err);
            } else {
                console.log("deleted sucessfully");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err, foundfList)=> {
            if(!err) {
                res.redirect("/" + listName);
            }
        });
    }
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