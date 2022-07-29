//jshint esversion:6

// REQUIREMENTS
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const res = require("express/lib/response");

const app = express();

app.set('view engine', 'ejs');

// function ignoreFavicon(req, res, next) {
//   if (req.originalUrl.includes('favicon.ico')) {
//     res.status(204).end()
//   }
//   next();
// }
// app.use(ignoreFavicon);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// CONNECTION WITH DATABASE
mongoose.connect("mongodb+srv://lokesh-admin:BeteBete@cluster0.90ya8.mongodb.net/todolistDB");

// CREATING SCHEMA
const itemSchema = {
  name: String
};

const listSchema = {
  name : String,
  items: [itemSchema]
}

//                       SINGULAR NAME
//                           ||
const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Welcome to your todo List!",
});
const item2 = new Item({
  name: "Hit the + button to add a new item",
});
const item3 = new Item({
  name: "<--- Hit this to delete an item",
});

const defaultItems = [item1, item2, item3];
// const day = date.getDate();
let day = "Today";

app.get("/", function (req, res) {
  Item.find({}, function (err, founditems) {

    if (founditems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) { console.log(err) }
        else console.log("Saved to DB")
      });
      res.redirect("/")
    }else
    res.render("list", { listTitle: day, newListItems: founditems });
  });
});


app.get("/:customList",function(r,s){
  const customListName = _.capitalize(r.params.customList);
  List.findOne({name: customListName},function(err,foundList){
    if (!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save()
        s.redirect("/" + customListName)
      }else
      s.render("list" , {listTitle: foundList.name, newListItems: foundList.items})
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item  = new Item({
    name: itemName,
  });
  console.log(listName);
    if(listName==="Today"){
      item.save();
      res.redirect("/");
    }else{
      List.findOne({name:listName},function(err,foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
      })
    }
});

app.post("/delete" , function(req,res){
  const listName = req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(req.body.checkbox,function(err){
      if(!err){
        console.log("deleted!")
        res.redirect("/")
      }
    });
  }else{
    List.findOneAndUpdate(
      {name: listName},
      {$pull: {items: {_id: req.body.checkbox}}},
      function(err,foundList){
        if(!err){
          res.redirect("/"+listName);
        }
      }
    );
  }
})

let port = process.env.PORT;
if(port == null || port == ""){
  port=3000;
}

app.listen(port, function () {
  console.log("Server started");
});
