const fs = require('fs');

let config;
if(fs.existsSync('evolver-config.json')){
  const configStream = fs.readFileSync('evolver-config.json', 'utf8');
  config = JSON.parse(configStream);
}

// config.files
// config.changelogPath
// config.changelogLineStart

const package = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const replaceInFiles = require('replace-in-files');
const args = process.argv.slice(2);
const mode = args[0] || 'bugfix';
const modes = ['minor', 'major', 'bugfix'];
const isValid = modes.some((m)=> m == mode);
const currentVersion = package.version;

const lineStart = 8;
const tempKey = '#EVOLVERTEMPKEY#';
const changelogPath = 'CHANGELOG.md';
const versionFiles = [
  'package.json',
  'package-lock.json',
  //'src/environments/*.ts',
];

function prepChangelog(){
  const p = new Promise((resolve, reject)=>{
    const cLog = fs.readFileSync('CHANGELOG.md').toString().split("\n");
    cLog.splice(lineStart, 0, "\n");
    cLog.splice(lineStart, 0, tempKey);
    cLog.splice(lineStart, 0, "\n");
  
    const cLogNew = cLog.join("\n");
  
    
    fs.writeFile(changelogPath, cLogNew, function (err) {
      if (err){
        return console.log(err);
      } else {
        resolve();
      }
    });
  });
  
  return p;
}

function updateVersion(){
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

  const options = {
    files: versionFiles,
    from: new RegExp(currentVersion),  // string or regex
    to: newVersion, // string or fn  (fn: carrying last argument - path to replaced file)
  };

  replaceInFiles(options)
    .then(({ changedFiles, countOfMatchesByPaths }) => {
      console.log('Modified files:', changedFiles);
      console.log('Count of matches by paths:', countOfMatchesByPaths);
      console.log('was called with:', options);
    })
    .catch(error => {
      console.error('Error occurred:', error);
    });
}

function updateChangelog(){
  const date = new Date();
  const dateString = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
  const changeLogValue = '## ['+newVersion+'] - ' + dateString;

  const changeLogOptions = {
    files: [
      'CHANGELOG.MD'
    ],
    // See more: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
    // Replacement
    from: new RegExp(tempKey),  // string or regex
    to: changeLogValue, // string or fn  (fn: carrying last argument - path to replaced file)
  };

  replaceInFiles(changeLogOptions)
    .then(({ changedFiles, countOfMatchesByPaths }) => {
      console.log('Modified files:', changedFiles);
      console.log('Count of matches by paths:', countOfMatchesByPaths);
      console.log('was called with:', changeLogOptions);
    })
    .catch(error => {
      console.error('Error occurred:', error);
    });
}

if(isValid){
  if(fs.existsSync(changelogPath)){
    prepChangelog().then(()=>{
      updateVersion();
      updateChangelog();
    });
  } else {
    updateVersion();
  }
  
} else {
  console.error('Invalid Version Argument', v);
}


