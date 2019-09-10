# Don't Touch Just Cook
One fine morning (or was it evening?) a couple years ago, I was in the kitchen cooking a meal. When I say cooking I really mean helping my boyfriend cook lunch/dinner by doing the simpler subtasks (divide and conquer y'all) like mincing garlic or chopping spring onions. "What does the recipe say to do after adding the peppers?", he asked. With my hands wet from washing off leftover garlic skin stuck to it, I fumbled with the phone which had turned it's screen off AGAIN, tried to unlock it with my wet thumb multiple times until I gave up and keyed in my pin, getting water droplets all over my screen, before I finally managed to scroll down past the recipe blog's nonsensical ramblings to the recipe itself. That was the day I decided that I hated viewing recipes on the phone, and so I came up with this simple project idea.

Don't Touch Just Cook is my very first foray into web programming (I'm more of an embedded gal). Inspired by [this Chrome recipe filter extension](https://github.com/sean-public/RecipeFilter) It's a simple Electron app that runs on my very slow Raspberry Pi 2, and all it does is take a URL to a recipe blog/website, pulls said recipe's ingredients and instructions list, and displays it. It's also got a few favorite recipes saved so that Sichuan eggplant is just one tap away. Ta-da! New favorite recipes can be added just by providing a name for it, and they can be removed just as easily by using the "manage" button.

I had no experience with Javascript or Electron prior to this so the code may not be the best but hey I tried. 

## How it works
**main.js**, the main process of the app, listens for the submit button or a favorite recipe button click, creates a browser window with said URL, then executes a script on the window to find commonly used HTML div class names (borrowed from the RecipeFilter github above) in order to pull the recipe out. Using the IPC, this gets sent to the renderer process as a String object. 

**renderer.js** receives the String, grabs the recipe and tidies it up by removing any additional blurbs above the ingredient list and nutrition information if any (who cares about all that!). It uses [electron-store](https://github.com/sindresorhus/electron-store) to maintain a list of favorite recipe buttons as well as a cache for the recipe content in order to reduce load times, so any subsequent requests to a link submitted before will load instantly. 

**index.html** makes everything appear nice and pretty using Material Design Lite and Bulma.
