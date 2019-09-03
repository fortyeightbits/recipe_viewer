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
  replyDiv.innerHTML = "Loading..."
  e.preventDefault()
})

ipcRenderer.on('recipe-reply', (event, arg) => {
  console.log("received reply")
  let replyDiv = document.querySelector('#recipeReply');
  replyDiv.innerHTML = arg;
})

function favHandler(id){
  let favUrl = favourites[id]
  console.log(favUrl)
  ipcRenderer.send('update-notify-value', favUrl)

  //Print loading message, animation not working
  replyDiv.innerHTML = '<div id="p2" class="mdl-progress mdl-js-progress mdl-progress__indeterminate"></div> Loading...'
}
