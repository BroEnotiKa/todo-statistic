const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');

const files = getFiles();
const regexp = /\/\/ TODO (.*?)(\n|\r\n)/g;
const TODO = '// TODO'

const commands = {
    'exit': () => process.exit(0),
    'show': (files) => show(files),
    'important': (files) => important(files),
    'user': (files, name) => user(files, name),
    'sort': (files, arg) => sort(files, arg),
}

console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

function processCommand(command) {
    let [cmd, ...args] = command.split(' ');
    if (commands[cmd]){
        let res = commands[cmd](files, ...args)
        if (res)
            console.log(res);
    }
    else {
        console.log('wrong command!');
    }
    // user(files, ...args);
}

// TODO you can do it!


function parseFiles(files) {
    let result = []
    for (const file of files) {
        let matchAll = file.matchAll(regexp);
        matchAll = Array.from(matchAll);
        for (const m of matchAll)
            result.push(m[1])
    }
    return result;
}

function show(files) {
    return parseFiles(files).map(f => `${TODO} ${f}`);
}

function important(files){
    return parseFiles(files).filter(todo => todo.includes('!'));
}

function user(files, name){
    let username = name.toLowerCase();
    return parseFiles(files).filter(todo => getUser(todo) === username);
}

function sort(files, arg){
    let todoArray = parseFiles(files);
    if (arg === 'importance'){
        todoArray.sort((u1, u2) => compareImportance(u1, u2));
    } else if (arg === 'user'){
        todoArray.sort((u1, u2) => compareUser(u1, u2));
    } else if (arg === 'date'){
        todoArray.sort(compareDate);
    } else {
        throw TypeError(`Invalid argument ${arg}!`);
    }
    return todoArray;
}

function compareUser (a, b) {
    let u1 = getUser(a);
    let u2 = getUser(b);
    if (u1 === '' || u2 === '')
        return 1;
    return u1.localeCompare(u2);
}

function getUser(todo){
    if (todo.includes(';')){
        let name = todo.slice(0, todo.indexOf(';'));
        return name.toLowerCase();
    } else {
        return '';
    }
}

function compareDate(a, b) {
    let aa = a.split('; ');
    let ab = b.split('; ');
    if (aa.length === 1)
        return 0;
    if (ab.length === 1)
        return 0;
    let dateA = new Date(aa[1].split('-'));
    let dateB = new Date(ab[1].split('-'));
    if (dateA < dateB) return 1;
    if (dateA === dateB) return 0;
    return -1;
}

function compareImportance(a, b){
    let counter1 = getElementCount(a, '!');
    let counter2 = getElementCount(b, '!');
    if (counter1 < counter2) return 1;
    if (counter1 === counter2) return 0;
    return -1
}

function getElementCount(str, elem){
    let result = 0;
    for (const ch of str){
        if (ch === elem){
            result++;
        }
    }
    return result;
}
