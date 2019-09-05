const {ipcRenderer} = require('electron')

//Dictionary of favorite recipes
var favourites = {
  eggplant : "http://omnivorescookbook.com/sichuan-eggplant/",
  chickenrice : "http://okui-kia.blogspot.com/2011/04/bean-sprout-chicken.html",
  siewyoke : "https://www.malaysianchinesekitchen.com/siew-yoke-roast-pork-belly/"
}

let replyDiv = document.querySelector('#recipeReply');
document.querySelector('button[type="submit"]').addEventListener('click', function(e) {
  let url = document.getElementById("recipeUrl").value;
  ipcRenderer.send('update-notify-value', url)

  //Print loading message
  replyDiv.innerHTML = '<div id="p2" class="mdl-progress mdl-js-progress mdl-progress__indeterminate"></div> Loading...'
  e.preventDefault()
})

ipcRenderer.on('recipe-reply', (event, arg) => {
  console.log("received reply")
  var recipe = tidyUpRecipe(arg)
  let replyDiv = document.querySelector('#recipeReply');
  replyDiv.innerHTML = recipe;
})

function favHandler(id){
  let favUrl = favourites[id]
  console.log(favUrl)
  ipcRenderer.send('update-notify-value', favUrl)

  //Print loading message
  replyDiv.innerHTML = '<div id="p2" class="mdl-progress mdl-js-progress mdl-progress__indeterminate"></div> Loading...'
}

String.prototype.insert = function (index, string) {
  if (index > 0)
    return this.substring(0, index) + string + this.substring(index, this.length);
  return string + this;
};

function tidyUpRecipe(recipe){

  //Start at ingredients header
  var ingredientPos = recipe.search(new RegExp(/ingredients|ingrediants/i))
  if (ingredientPos != -1) recipe = recipe.substr(ingredientPos)

  //Line break at instructions header and recipe notes
  var instructionsPos = recipe.search(new RegExp(/instructions|directions/i))
  if (instructionsPos != -1) recipe = recipe.insert(instructionsPos-1, "<br><br>")

  var notesPos = recipe.search(new RegExp(/notes|recipe notes/i))
  if (notesPos != -1) recipe = recipe.insert(notesPos-1, "<br><br>")

  //Remove nutrition
  var nutritionPos = recipe.search(new RegExp(/nutrition/i))
  if (nutritionPos != -1) recipe = recipe.substr(0, nutritionPos)

  return recipe

}
