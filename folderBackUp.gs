/***************************************************
  This Google Script will make a backup of the
  selected folder
***************************************************/

var TARGET_FOLDER_NAME = 'folder_name';


//Main function
function start() {

    var today = new Date().toDateString();
    var sourceFolder = TARGET_FOLDER_NAME;
    var targetFolder = TARGET_FOLDER_NAME + ".BackUp." + today.split(" ").join("-");

    var source = DriveApp.getFoldersByName(sourceFolder);
    var target = DriveApp.createFolder(targetFolder);

    if (source.hasNext()) {
        copyFolder(source.next(), target);
    }

}


function copyFolder(source, target) {

    var folders = source.getFolders();
    var files = source.getFiles();

    while (files.hasNext()) {
        var file = files.next();
        file.makeCopy(file.getName(), target);
    }

    while (folders.hasNext()) {
        var subFolder = folders.next();
        var folderName = subFolder.getName();
        var targetFolder = target.createFolder(folderName);
        copyFolder(subFolder, targetFolder);
    }

}
