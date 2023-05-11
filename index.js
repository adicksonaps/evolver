const fs = require('fs');
const package = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const replaceInFiles = require('replace-in-files');
const args = process.argv.slice(2);
const mode = args[0];
const modes = ['minor', 'major', 'bugfix'];
const isValid = modes.some((m)=> m == mode);
const currentVersion = package.version;
const cLog = fs.readFileSync('CHANGELOG.md').toString().split("\n");
const lineStart = 8;

cLog.splice(lineStart, 0, "\n");
cLog.splice(lineStart, 0, "## New");
cLog.splice(lineStart, 0, "\n");

var cLogNew = cLog.join("\n");

fs.writeFile('CHANGELOG.md', cLogNew, function (err) {
  if (err) return console.log(err);
});

let newVersion = '';
let tempVersion = new String(package.version);
let parts = tempVersion.split('.');

switch(mode){
  case 'major': {
    let maNumber = Number(parts[0])
    parts[0] = new String(maNumber+1);
    parts[1] = new String(0);
    parts[2] = new String(0);
  }
    
  break;
  case 'minor': {
    let miNumber = Number(parts[1])
    parts[1] = new String(miNumber+1);
    parts[2] = new String(0);
  }
    
  break;
  case 'bugfix': {
    let bNumber = Number(parts[2])
    parts[2] = new String(bNumber+1);
  }    
  break;
}

newVersion = parts.join('.');

const date = new Date();
const dateString = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
const changeLogValue = '## ['+newVersion+'] - ' + dateString;

console.log(args, currentVersion, isValid, newVersion, changeLogValue);

const changeLogOptions = {
  files: [
    'CHANGELOG.MD'
  ],
  // See more: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
  // Replacement
  from: new RegExp('## New', 'g'),  // string or regex
  to: changeLogValue, // string or fn  (fn: carrying last argument - path to replaced file)
};

const options = {
  files: [
    'package.json',
    'package-lock.json',
    'src/environments/*.ts',
  ],
  // See more: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
  // Replacement
  from: new RegExp(currentVersion),  // string or regex
  to: newVersion, // string or fn  (fn: carrying last argument - path to replaced file)
};

if(isValid){
  replaceInFiles(options)
    .then(({ changedFiles, countOfMatchesByPaths }) => {
      console.log('Modified files:', changedFiles);
      console.log('Count of matches by paths:', countOfMatchesByPaths);
      console.log('was called with:', options);
    })
    .catch(error => {
      console.error('Error occurred:', error);
    });
    replaceInFiles(changeLogOptions)
    .then(({ changedFiles, countOfMatchesByPaths }) => {
      console.log('Modified files:', changedFiles);
      console.log('Count of matches by paths:', countOfMatchesByPaths);
      console.log('was called with:', options);
    })
    .catch(error => {
      console.error('Error occurred:', error);
    });
} else {
  console.error('Invalid Version Argument', v);
}
