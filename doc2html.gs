

function doc2html() {
    Logger.clear();
    var source_doc = DocumentApp.openById(sourceDocID);
    var target_doc = DocumentApp.openById(targetDocID);
    var docName = 'img_' + source_doc.getName().split(' ').join('');

    var rootFolder = DriveApp.getFolderById(folderImages);
    rootFolder.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
    var imgFolder = rootFolder.createFolder(docName);
    var folderID = imgFolder.getId();

    var content = '';
    var body = source_doc.getBody();
    for (var i = 0; i < body.getNumChildren(); i++) {
        var child = body.getChild(i);
        content += parseChild(child, folderID, docName);
    }
    target_doc.getBody().editAsText().appendText(content);
    //Logger.log(content);
    var payload = {
        title: docName,
        content: content,
        author: 'Pepe',
        date: Date.now()
    }
}


function parseChild(child, folderID, docName) {
    switch (child.getType()) {
        case DocumentApp.ElementType.BODY_SECTION:
            Logger.log('body');
            break;
        case DocumentApp.ElementType.COMMENT_SECTION:
            Logger.log('Comment');
            break;
        case DocumentApp.ElementType.HEADER_SECTION:
            Logger.log('Header section');
            break;
        case DocumentApp.ElementType.INLINE_IMAGE:
            return parseImage(child, folderID, docName);
        case DocumentApp.ElementType.LIST_ITEM:
            Logger.log('List');
            break;
        case DocumentApp.ElementType.PARAGRAPH:
            return parseParagraph(child, folderID, docName);
        case DocumentApp.ElementType.TABLE:
            Logger.log('table');
            break;
        case DocumentApp.ElementType.TEXT:
            return parseText(child);
        default:
            Logger.log('Unsupported: ' + child.getType());
    }
}

function parseParagraph(child, folderID, docName) {
    var content = '';
    for (var i = 0; i < child.getNumChildren(); i++) {
        content += parseChild(child.getChild(i), folderID, docName);
    }
    return content;
}

function parseText(child) {
    var text = child.asText();
    var content = '<p>';

    var bold = {
        active: false,
        startsAt: 0,
        clousure: '</strong>'
    };
    var italic = {
        active: false,
        startsAt: 0,
        clousure: '</i>'
    };
    var underline = {
        active: false,
        startsAt: 0,
        clousure: '</u>'
    };
    var link = {
        active: false,
        startsAt: 0,
        clousure: '</a>'
    };

    var parsedText = text.getText();

    for (var i = 0; i < parsedText.length; i++) {
        if (text.isBold(i) && !bold.active) { //Starts bold
            bold.startsAt = i;
            bold.active = true;
            content += '<strong>';
        } else if (!text.isBold(i) && bold.active) { //ends bold
            bold.active = !bold.active;
            content += '</strong>';
        } else if (text.isItalic(i) && !italic.active) { //Starts italic
            italic.startsAt = i;
            italic.active = true;
            content += '<i>';
        } else if (!text.isItalic(i) && italic.active) { //ends italic
            italic.active = !italic.active;
            content += '</i>';
        } else if (text.isUnderline(i) && !underline.active) { //Starts underline
            underline.startsAt = i;
            underline.active = true;
            content += '<u>';
        } else if (!text.isUnderline(i) && underline.active) { //ends underline
            underline.active = !underline.active;
            content += '</u>';
        } else if (isURL(text, i) && !link.active) {
            link.active = true;
            link.startsAt = i;
            //Aquí va una chapuza pero es demasiado tarde para pensar algo mejor
            //que se joda al que le toque leerlo, será a mi yo descansado, da igual,
            //jodete Joseba
            var prevChar = parsedText.charAt(i - 1);
            Logger.log('Ultimo: ' + prevChar)
            content = content.slice(0, content.length - 1) + '<a href="' + text.getLinkUrl(i) + '">' + prevChar;
            //content += '<a href="'+ text.getLinkUrl(i) +'">';
        } else if (!isURL(text, i) && link.active) {
            link.active = !link.active;
            content += '</a>';
        }
        content += parsedText.charAt(i);
    }
    var htmlTags = [bold, italic, underline, link];
    content += closeHTMLTags(htmlTags);
    return content + '</p>';
}

function parseImage(child, folderID, docName) {
    var blob = child.getBlob();
    var content_type = blob.getContentType();
    var suffix = content_type.split("/")[1];
    var img_name = "img_" + Date.now() + '.' + suffix;
    blob.setName(img_name);
    try {
        var folder = DriveApp.getFolderById(folderImages);
        var imageStored = folder.createFile(blob);
        imageStored.setName(img_name);
    } catch (e) {
        Logger.log('Problem storing the image');
        Logger.log(e);
    }
    var src = 'https://googledrive.com/host/' + folderImages + '/' + img_name;
    return '<img src="' + src + '"/>';
}

function closeHTMLTags(list) {
    list.sort(function(a, b) {
        return b.startsAt - a.startsAt;
    });
    var res = "";
    for (var i = 0; i < list.length; i++) {
        if (list[i].active) res += list[i].clousure;
    }
    return res;
}

function isURL(text, i) {
    return text.getText().length > i && text.getLinkUrl(i) !== null;
}
