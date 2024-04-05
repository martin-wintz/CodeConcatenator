# CodeConcatenator
Easily select files in your project and concatenate their source code for pasting into ChatBots

Runs locally on Windows, Mac, or Linux. Powered by [Electron](https://www.electronjs.org/) and implemented in [React](https://react.dev/).


#### Features

* View your files in a tree structure and select them to load their contents into a text area
* ASCII mode for the file tree so you can paste in your directory/file structure as well
* Watches for changes in your working directory and updates both contents and file tree
* Respects your .gitignore
* Token estimation

### Running locally for development

After cloning the repository

```
npm install
npm run dev
npm start
```