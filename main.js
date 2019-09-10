const { app, BrowserWindow, ipcMain } = require('electron')

global.mainWindow = null
global.recipeWindow = null
let recipeText

app.on('ready', () => {

	mainWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true
		},
		frame: false
	})

  mainWindow.loadFile("index.html")
	mainWindow.maximize()
	//mainWindow.openDevTools()

	ipcMain.on('recipe-request', (event, arg) => {
		recipeWindow = new BrowserWindow({
			webPreferences: {
				nodeIntegration: true
			},
			show: false
		})
		recipeWindow.loadURL(arg)
		//recipeWindow.openDevTools()

		recipeWindow.webContents.once('dom-ready', () => {
			recipeWindow.webContents.executeJavaScript(`

				recipe_selectors = [
					'.recipe-callout',
					'.tasty-recipes',
					'.easyrecipe',
					'.innerrecipe',
					'.recipe-summary.wide',
					'.wprm-recipe-container',
					'.recipe-content',
					'.simple-recipe-pro',
					'div[itemtype="http://schema.org/Recipe"]',
					'div[itemtype="https://schema.org/Recipe"]',
					'.post-body.entry-content',
				]
				const {remote, ipcRenderer} = require('electron')
				let mainWin = remote.getGlobal('mainWindow')
				let selectorCnt = 0;
				recipe_selectors.every(function(s){
					let recipeElement = document.querySelector(s)
					if (recipeElement){
						recipeText = recipeElement.innerText;
					  let doclink = document.URL;
						if (doclink[doclink.length-1] == '/')
					    doclink = doclink.slice(0, -1);
						let recipe_reply = {link: doclink, text: recipeText}
					  mainWin.webContents.send('recipe-reply', recipe_reply)
						console.log("reply sent")
						return false
					}
					selectorCnt++
					return true
				})
				if (selectorCnt == recipe_selectors.length)
				{
					let recipe_reply = {link: "", text: "Recipe not found... :("}
					mainWin.webContents.send('recipe-reply', recipe_reply)
				}
				let recipeWin = remote.getGlobal('recipeWindow')
				recipeWin.close()
			`)
		})
	})
})
