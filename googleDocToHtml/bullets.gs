function replaceBullets(targetDocId) {
  var elementContent = "New item testing"; // a paragraph with its formating

  var targetDoc = DocumentApp.openById(targetDocId);
  var body = targetDoc.getBody();
  var childIndex = 0;
  for (var i = 0; i < targetDoc.getNumChildren(); i++) {
    var child = targetDoc.getChild(i);
    processChildren( child )
  }
}

function test_replaceBullets(){
  var targetDocId = "1Q5g8jZciFha5g2e0zdDT9p4K9G6rsHxMZNlsNW5g_6s"
  Logger.log( replaceBullets(targetDocId))
}

function processChildren(child){
  for (var i = 0; i < child.getNumChildren(); i++) {

  if (child.getType() == DocumentApp.ElementType.LIST_ITEM){
      while(child.getType() == DocumentApp.ElementType.LIST_ITEM){
        child = targetDoc.getChild(i)
        childIndex = body.getChildIndex(child);
        Logger.log("LIT ITEM " + childIndex)
        i++
      }
      child = targetDoc.getChild(i-2)
      var listId = child.getListId();
      Logger.log(childIndex)
      //var newElement = child.getParent().insertListItem(childIndex, elementContent);
      //newElement.setListId(child);
      break;
  }else if ( child.getType() == DocumentApp.ElementType.PARAGRAPH | child.getType() == DocumentApp.ElementType.TABLE){
    processChildren( child )
  }

  }
