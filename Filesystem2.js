var readlineSync = require('readline-sync');
var fs = require('fs');
var exit = false;
var parent_id = 0;
var currentFolder = 0;
var lastId = 0;
var printed = 0;
var folder_stack = [];
folder_stack[0] = 0;
var completed_add = 0;
var idCounter = 7;
var finished = 0;
var newArray = [];
var newFileSystem = [];
var menu = [
    'Print current folder',
    'Change current folder',
    'Create file or folder',
    'Delete file or folder',
    'Save file system to file',
    'Load file system from file',
    //'Search in file or folder',
    'Quit Program'
];
/* this will be the storage for our file system */
//var files={id,parent,name,content};
//var folders={id,parent,name};
var depth = 0;
var fsStorage = [{
    id: 0,
    name: 'root',
    children: [{
            id: 1,
            name: 'sub1',
            children: [
                { id: 4, name: 'file1.txt', content: 'text text' },
                { id: 5, name: 'sub3', children: [] }
            ]
        },
        { id: 2, name: 'sub2', children: [] },
        { id: 3, name: 'file2.txt', content: 'text' },
    ]
}];

var begin = fsStorage[0].children;
main();

function main() {
    printCurrentFolder();
    while (!exit) {
        printMenu();
    }
    process.exit(0);
}

function printMenu() {
    var answer = readlineSync.keyInSelect(menu, 'Please make your choice:');
    switch (answer) {
        case 0:
            printCurrentFolder();
            break;
        case 1:
            {
                printed = 0;
                changeCurrentFolder();
                printCurrentFolder();
            }
            break;
        case 2:
            createFileOrFolder();
            break;
        case 3:
            deleteFileOrFolder();
            break;
        case 4:
            buildFlatArray();
            break;
        case 5:
            reBuildTree();
            break;
            //  case 4:
            //      searchInFileOrFolder();
            //       break;
        case 6:
            quitProgram();
            break;
    }
}

function printCurrentFolder() {
    printed = 0;
    printChildrenOfFolderWithIdOf(currentFolder, fsStorage);
}

function printChildrenOfFolderWithIdOf(myId, myArray) {
    if (printed)
        return;
    if (!myArray) {
        return;
    }
    for (var i = 0; i < myArray.length; i++) {
        if (myArray[i].id == myId) {
            console.log("showing content of:");
            console.log("<" + myArray[i].name + ">");
            //console.log("--" + myArray[i].children);
            for (var x = 0; x < myArray[i].children.length; x++) {
                if (myArray[i].children[x].children)
                    console.log("------" + myArray[i].children[x].name + " <fold>");
                else
                    console.log("------" + myArray[i].children[x].name + " <file>");
            }
            printed = 1;
            return;
        } else printChildrenOfFolderWithIdOf(myId, myArray[i].children);
    }
}

function changeCurrentFolder() {
    /* todo: implement cli to move in all directions  */
    var folderName = readlineSync.question('type the name of the folder to change to:(or .. to move up) ');
    if (folderName == '..') {
        if (currentFolder == 0) {
            console.log("already in root , can not move above that");
            return;
        }
        currentFolder = folder_stack.pop();
        console.log("moved one folder up:" + currentFolder);
        return;
    }
    found = 0;
    findChildId(currentFolder, folderName, fsStorage);
    if (!found)
        console.log("no such folder name:" + folderName);
}

function findChildId(location, myNameis, myArray) {
    // console.log(myArray);
    if (!myArray)
        return;
    for (var i = 0; i < myArray.length; i++) {
        if (location == myArray[i].id)
            if (myArray[i].children)
                for (var x = 0; x < myArray[i].children.length; x++) {
                    if (myArray[i].children[x].name == myNameis) {
                        if (!myArray[i].children[x].children)
                            return;
                        folder_stack.push(currentFolder);
                        // console.log("pushed: " + currentFolder);
                        currentFolder = myArray[i].children[x].id;
                        found = 1;
                        return currentFolder;
                    }
                }
        findChildId(location, myNameis, myArray[i].children);
    }
}

function createFileOrFolder() {
    var myType = 0;
    /* todo: implement additon of file/folder to file system array   */
    var folderName = readlineSync.question('creating a file or a folder? (type file or folder)');
    if (folderName === "folder") {
        myType = 1;
        folderName = readlineSync.question('type the name of the folder to create:');
    } else if (folderName === "file") {
        myType = 2;
        folderName = readlineSync.question('type the name of the file to create:');
        var content = readlineSync.question('type the content of the file:');
    } // else { console.log("wrong option"); return; }
    else {
        console.log("error in file name");
        return;
    }


    createFileIn(currentFolder, fsStorage, folderName, content, myType);

}

function createFileIn(location, fsStorage, folderName, content, myType) {

    for (var i = 0; i < fsStorage.length; i++) {
        if (location == fsStorage[i].id) {
            // console.log("enter here: " + fsStorage[i].id);
            if (myType == 2) {
                fsStorage[i].children.push({
                    "id": idCounter++,
                    "name": folderName,
                    "content": content
                });
                console.log(folderName + " created!");
            }
            if (myType == 1) {
                fsStorage[i].children.push({
                    "id": idCounter++,
                    "name": folderName,
                    "children": []
                });
                console.log(folderName + " created!");
            }
            return;
        }
        if (fsStorage[i].children)
            createFileIn(location, fsStorage[i].children, folderName, content, myType);
    }
    return;
}

function deleteFileOrFolder() {
    console.log('delete file folder');
    var folderName = readlineSync.question('type the name of the file or folder to delete:');

    // console.log(folderName);
    finished = 0;
    if ((folderName == "root"))
        console.log("can not erase root");
    eraseMe(currentFolder, fsStorage, folderName);
    // console.log("erased: " + folderName);
}

function eraseMe(location, myArray, folderName) {
    if (finished == 1)
        return;
    for (var i = 0; i < myArray.length; i++) {
        if (location == myArray[i].id)
            for (var x = 0; x < myArray[i].children.length; x++) {
                if (folderName == myArray[i].children[x].name) {
                    console.log("erase:" + myArray.name);
                    myArray[i].children.splice(x, 1);
                    finished = 1;
                    return;
                }
            }
        if (myArray[i].children)
            eraseMe(location, myArray[i].children, folderName);
    }
}

function searchInFileOrFolder() {
    console.log('searching current files folder');
    /* todo: implement search across all folders by name and content  */
}

function quitProgram() {
    var answer = readlineSync.keyInYNStrict('Are you sure?');
    exit = answer ? true : false;
}

function printChildren(myArr) {
    if (!myArr) {
        return;
    }
    for (var i = 0; i < myArr.length; i++) {
        console.log(myArr[i].name);
        depth++;
        if (depth < 1)
            printChildren(myArr[i].children);
    }
}

function buildArray(newArray, oldArray) {
    for (var i = 0; i < oldArray.length; i++) {
        if (oldArray[i].id == currentFolder)
            newArray.push({
                "id": oldArray[i].id,
                "name": oldArray[i].name,
                "parent": null
            });
        else {
            if (!oldArray[i].content)
                newArray.push({
                    "id": oldArray[i].id,
                    "name": oldArray[i].name,
                    "parent": currentFolder
                });
            else
                newArray.push({
                    "id": oldArray[i].id,
                    "name": oldArray[i].name,
                    "parent": currentFolder,
                    "content": oldArray[i].content
                });
        }
        console.log(oldArray[i].name);
        if (oldArray[i].children) {
            folder_stack.push(currentFolder);
            currentFolder = oldArray[i].id;
            buildArray(newArray, oldArray[i].children);
            currentFolder = folder_stack.pop();
        } //else return;
    }
}

function buildFlatArray() {
    folder_stack = [];
    folder_stack[0] = 0;
    newArray = [];
    var oldCurrentFolder = currentFolder;
    currentFolder = 0;
    var folderName = readlineSync.question('type a file name to Save fileSystem to: ');
    buildArray(newArray, fsStorage);
    try {
        fs.writeFileSync(__dirname + "/" + folderName, JSON.stringify(newArray));
    } catch (err) {
        console.log("Error !!!!!!!!!!!!!!!!!!" + err);
    }

    currentFolder = oldCurrentFolder;
}

function reBuildTree() {
    var folderName = readlineSync.question('type a file name to Load fileSystem from: ');
    try {
        newArray = JSON.parse(fs.readFileSync(__dirname + "/" + folderName).toString());
    } catch (err) {
        console.log("error:" + err);
    }

    //  console.log(newArray);
    //  console.log("");
    //   console.log("");
    //  console.log(newArray[0]);
    fsStorage = [];
    fsStorage.push({ name: "root", id: 0, children: [] });
    buildMe(newArray, fsStorage);
    //   console.log(fsStorage);
    //  console.log("");
    //   console.log("");
    //   console.log(fsStorage[0]);
    //  fileSystemUnFlattener(newArray);
    // console.log("built file system");
}

function buildMe(flatArray, newFileSystem) {
    for (var i = 1; i < flatArray.length; i++) {
        if (flatArray[i].content) {
            createFileIn2(flatArray[i].parent, newFileSystem, flatArray[i].name, flatArray[i].content, 2, flatArray[i].id);
        } else createFileIn2(flatArray[i].parent, newFileSystem, flatArray[i].name, flatArray[i].content, 1, flatArray[i].id);
    }
}

function createFileIn2(location, fsStorage, folderName, content, myType, myId) {
    for (var i = 0; i < fsStorage.length; i++) {
        if (location == fsStorage[i].id) {
            //   console.log("enter here: " + fsStorage[i].id);
            if (myType == 2)
                fsStorage[i].children.push({
                    "id": myId,
                    "name": folderName,
                    "content": content
                });
            if (myType == 1)
                fsStorage[i].children.push({
                    "id": myId,
                    "name": folderName,
                    "children": []
                });
            return;
        }
        if (fsStorage[i].children)
            createFileIn2(location, fsStorage[i].children, folderName, content, myType, myId);
    }
    return;
}