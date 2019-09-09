const database = {
  'linkmap': [
    {
      recipeid: "sichuan_eggplant",
      link: "http://omnivorescookbook.com/sichuan-eggplant",
      name: "Sichuan Eggplant"
    },
    {
      recipeid: "chicken_rice",
      link: "http://okui-kia.blogspot.com/2011/04/bean-sprout-chicken.html",
      name: "Chicken Rice"
    },
    {
      recipeid: "siew_yoke",
      link: "https://www.malaysianchinesekitchen.com/siew-yoke-roast-pork-belly",
      name: "Siew Yoke"
    },
    {
      recipeid: "aglio_olio",
      link: "https://myfoodstory.com/shrimp-spaghetti-aglio-olio-recipe",
      name: "Aglio Olio"
    }
  ],
  'recipecache' : []
}

const {ipcRenderer} = require('electron')
const Store = require('electron-store')
const store = new Store({defaults: database});

//Global element queries
let replyDiv = document.querySelector('#recipeReply');
let dialog = document.querySelector('dialog');
let recipeUrlDiv = document.getElementById("recipeUrl");
let toggle = false

//Display all of our favorites
displayFavButtons();

if (! dialog.showModal) {
  dialogPolyfill.registerDialog(dialog)
}

/**
 * Event listener for submit button
 */
document.querySelector('button[type="submit"]').addEventListener('click', function(e) {

  let url = recipeUrlDiv.value
  let checkCacheReturn = checkCache(url)
  if (checkCacheReturn != "")
  {
    //Clear URL text field
    recipeUrlDiv.value = ""
    replyDiv.innerHTML = checkCacheReturn
    e.preventDefault()
    return
  }
  //Send recipe request
  ipcRenderer.send('recipe-request', url)
  //Print loading message
  replyDiv.innerHTML = '<div class="progress"><progress class="progress is-small is-primary" max="100"></progress></div> Loading...'
  //Clear URL text field
  recipeUrlDiv.value = ""
  e.preventDefault()
})

/**
 * Event listener for manage favorites button
 */
 document.querySelector('#manage').addEventListener('click', function(e) {
   toggle = !toggle
   if (toggle) {
     let manlinkmapping = store.get('linkmap');
     for (i in manlinkmapping)
     {
       let childname = "child_" + manlinkmapping[i].recipeid
       let fav = document.getElementById(childname)
       fav.innerHTML += `<button class="mdl-chip__action cancelbutton" onclick="deleteHandler('` + manlinkmapping[i].recipeid + `')"><i class="material-icons">cancel</i></button>`
     }
   }
    else {
      //Fresh display because some may have been removed
      displayFavButtons()
    }
 })

 /**
  * Event listener for clear cache button
  */
  document.querySelector('#clear').addEventListener('click', function(e) {
    let updatedcache = []
    store.set('recipecache', updatedcache)
    replyDiv.innerHTML = "Cache cleared!"
  })

/**
 * Event listener for add favorite button
 */
document.querySelector('#fav').addEventListener('click', function(e) {
  //Show dialog pop-up only if URL is entered
  let url = recipeUrlDiv.value
  if (url != ""){
    dialog.showModal()
  }
})

/**
 * Event listener for Enter button when adding new favorite
 */
dialog.querySelector('.enter').addEventListener('click', function() {
  dialog.close()
  //Get URL and name, add to linkmap database
  let url = recipeUrlDiv.value
  let recipename = document.getElementById("recipeName").value
  if (recipename == "") {
    replyDiv.innerHTML = "Add new favorite failed: no recipe name!"
      return
  }
  let id = recipename.replace(" ", "_").toLowerCase()
  let updatedmap = [...store.get('linkmap'), {recipeid: id, link: url, name: recipename}]
  console.log(updatedmap)
  store.set('linkmap', updatedmap)
  //Create new favorite button
  let newindex = store.get('linkmap').length
  let favButtonDiv = document.querySelector('#favButtonHtml');
  favButtonDiv.innerHTML += `<div class="inline" id="child_` + id
  + `"><button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect favbutton" onclick="favHandler(` + (newindex-1)
  + `)"> <div class="favtext">` + recipename + `</div></button></div>`
  console.log(favButtonDiv.innerHTML)
  //Clear input text boxes
  recipeUrlDiv.value = ""
  document.getElementById("recipeName").value = ""
});

/**
 * Function to handle requests for favorite recipes
 */
function favHandler(index) {
  //Get favorite link
  let favlinkmapping = store.get('linkmap');
  let dishurl = favlinkmapping[index].link
  console.log(dishurl)
  //Check cache
  let checkCacheReturn = checkCache(dishurl)
  if (checkCacheReturn != ""){
    replyDiv.innerHTML = checkCacheReturn
    return
  }
  //Send recipe request
  ipcRenderer.send('recipe-request', dishurl)
  //Print loading message
  replyDiv.innerHTML = '<div class="progress"><progress class="progress is-small is-primary" max="100"></progress></div> Loading...'
}

/**
 * Function to handle removing favorite buttons
 */
 function deleteHandler(id) {
   //Delete favorite recipe from database
   let dellinkmapping = store.get('linkmap');
   let updatedmap = store.get('linkmap').filter(dellinkmapping => dellinkmapping.recipeid !== id)
   console.log(updatedmap)
   store.set('linkmap', updatedmap)
   //Remove favorite button
   let childname = "child_" + id
   let favToDel = document.getElementById(childname)
   favToDel.parentNode.removeChild(favToDel);
 }

/**
 * Event listener for reply received through IPC
 */
ipcRenderer.on('recipe-reply', (event, arg) => {
  //If recipe not found
  if (arg.link == "") {
    replyDiv.innerHTML = arg.text
    return
  }
  let recipe = tidyUpRecipe(arg.text)
  //Cache it to reduce load times
  let updatedcache = [...store.get('recipecache'), {cachelink: arg.link, recipetext: recipe}]
  store.set('recipecache', updatedcache)
  //Display recipe
  replyDiv.innerHTML = recipe;
})

/**
 * Function to tidy up recipe
 */
function tidyUpRecipe(recipe){

  //Start at ingredients header
  let ingredientPos = recipe.search(new RegExp(/ingredients|ingrediants/i))
  if (ingredientPos != -1) recipe = recipe.substr(ingredientPos)

  //Line break at instructions header and recipe notes
  let instructionsPos = recipe.search(new RegExp(/instructions|directions/i))
  if (instructionsPos != -1) recipe = recipe.insert(instructionsPos-1, "<br><br>")

  let notesPos = recipe.search(new RegExp(/notes|recipe notes/i))
  if (notesPos != -1) recipe = recipe.insert(notesPos-1, "<br><br>")

  //Remove nutrition
  let nutritionPos = recipe.search(new RegExp(/nutrition/i))
  if (nutritionPos != -1) recipe = recipe.substr(0, nutritionPos)

  return recipe
}

/**
 * Helper function to check cache
 */
 function checkCache(url){
   //Check if we know this url
   let submitcache = store.get('recipecache');
   for (i in submitcache){
     if (submitcache[i].cachelink == url)
     {
       return submitcache[i].recipetext
     }
   }
   return ""
 }


/**
 * Helper function to display favorite buttons
 */
function displayFavButtons(){
  let favButton = document.querySelector('#favButtonHtml');
  let linkmapping = store.get('linkmap');
  favButton.innerHTML = ""
  for (i in linkmapping){
    favButton.innerHTML += `<div class="inline" id="child_` + linkmapping[i].recipeid
    + `"><button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect favbutton" onclick="favHandler(`
    + i + `)"> <div class="favtext">` + linkmapping[i].name + `</div></button></div>`
  }
}

/**
 * Helper function for inserting string at index
 */
String.prototype.insert = function (index, string) {
  if (index > 0)
    return this.substring(0, index) + string + this.substring(index, this.length);
  return string + this;
};
