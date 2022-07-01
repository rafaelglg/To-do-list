const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash");
const date = require(__dirname + "/date.js");
let day = date.getDate();

const {
    acceptsLanguages
} = require("express/lib/request");
const {
    Schema
} = require("mongoose");

const app = express();



app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-rafael:espia96@rafa.4xvsx.mongodb.net/todolistDB");

const itemSchema = ({
    name: {
        type: String,
        require: true
    }
});

const Item = mongoose.model("Item", itemSchema)

const item = new Item({
    name: "Welcome to the Todo list of Rafael",
});
const item2 = new Item({
    name: "press + to add new item",
});
const item3 = new Item({
    name: "<-- hit this to delete this item.",
});

const defaultItems = [item, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("list", listSchema)


app.get("/", function (req, res) {

    Item.find({}, function (err, foundItems) {

        if (foundItems === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("succesfully added");
                }
                });
                res.redirect("/");
        } else {
            res.render("list", {listTitle: day,newListItems: foundItems});
        }
        });
    });

app.post("/", function (req, res) {

    const itemName = req.body.newItem.charAt(0).toUpperCase() + req.body.newItem.slice(1);
    const listName = req.body.list;
    const item = new Item ({
        name: itemName
    });
    if (listName === day){
    item.save();
    res.redirect("/");
    } else {
        List.findOne({name:listName}, function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
});

app.post("/delete",function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName= req.body.listName

    if (listName === day){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if (!err){
                console.log("succesfully delete id");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({name: listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
            if(!err){
                res.redirect("/"+listName);
            }
        });
    }

});

app.get("/:customListName", function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err,foundList){
        if (!err){
            if (!foundList){
                const list = new List ({
                    name : customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            } else {
                res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
            }
        }
    });
});


app.get("/about", function (req, res) {
    res.render("about");
});


const port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
    console.log("servidor en el 3000.");
});