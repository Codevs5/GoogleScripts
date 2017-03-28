/***************************************************
  This Google Script will send an slack notification to your Slack Channel
  when a file in a Google Drive folder has been added, or modified.
***************************************************/

var ROOT_FOLDER_ID = '***************';
var SLACK_WEBHOOK = 'https://hooks.slack.com/services/************************';
var CHANNEL = 'Channel_name';

function checkForChangedFiles() {
    var folderList = listFolders(ROOT_FOLDER_ID) || [];
  folderList = folderList.split(",");
    for (var i = 0; i < folderList.length; i++) {
        checkForChangedFilesInFolder(folderList[i]);
    }
}


function checkForChangedFilesInFolder(folder_id) {
    var folderID = '"' + folder_id + '"';

    var folderSearch = folderID + " " + "in parents";
    var timezone = Session.getScriptTimeZone();
    var today = new Date();
    var fifteenMinutesAgo = new Date(today.getTime() - 60 * 1000 * 15);
    var startTime = fifteenMinutesAgo.toISOString();

    var search = '(trashed = true or trashed = false) and ' + folderSearch;
    var files = DriveApp.searchFiles(search);

    today = Utilities.formatDate(fifteenMinutesAgo, timezone, "yyyy-MM-dd HH:mm");
    while (files.hasNext()) {

        var file = files.next();
        var dateCreated = Utilities.formatDate(file.getDateCreated(), timezone, "yyyy-MM-dd HH:mm")

        if (dateCreated > today) {
            sendSlackNotification({
                fileName: file.getName(),
                fileURL: file.getUrl(),
                fileOwner: file.getOwner().getName()
            });
        }
    }
}


function sendSlackNotification(changedFile) {

  var payload = {
        "icon_emoji": ":rolled_up_newspaper:",
        "channel": "#" + CHANNEL,
        "username": "Nueva Entrada",
        "text": changedFile.fileOwner + " ha añadido un nuevo documento " + changedFile.fileName + " en " + changedFile.fileURL
    };

  sendMessageToSlack(payload);
}

function sendMessageToSlack(payload) {
    var url = SLACK_WEBHOOK;
    var options = {
        'method': 'post',
        'payload': JSON.stringify(payload)
    };
    var response = UrlFetchApp.fetch(url, options);
}


function listFolders(id) {
    var parentFolder = DriveApp.getFolderById(id);
    var childFolders = parentFolder.getFolders();
    var childs = [];
    while (childFolders.hasNext()) {
        var child = childFolders.next();
        childs.push(getSubFolders(child));
    }
      childs.push(id);

    return childs.join(",");
}

function getSubFolders(parent) {
    parent = parent.getId();
    var childFolder = DriveApp.getFolderById(parent).getFolders();
    var childs = [];
  if (!childFolder.hasNext()) return parent;
    while (childFolder.hasNext()) {
        var child = childFolder.next();
        var res = getSubFolders(child);
        childs.push(res);
    }
  childs.push(parent);
    return childs.join(",");
}
