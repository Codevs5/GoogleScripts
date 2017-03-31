
function doGet(e) {
  var app = UiApp.createApplication().setTitle("Convert a Google Document To HTML").setHeight(250).setWidth(500)

  var grid = app.createGrid(8, 3 ).setStyleAttribute(3, 2, "width", "420px").setCellPadding(5)
  grid.setStyleAttribute("margin-left", "auto")
  grid.setStyleAttribute("margin-right", "auto")
  grid.setStyleAttribute("margin-top", "100px")

  // Make the header
  var img_src = "https://lh6.googleusercontent.com/-mU3Vlkn79UU/UZTxvFRznAI/AAAAAAAABtc/SBfRvkjmIoc/w339-h121-no/Untitled.jpg"
  var img_widget = app.createImage( img_src ).setStyleAttribute("margin-left", "60px")
  grid.setWidget(0, 2, img_widget)

  // Create some introduction text
  var html = "<h1>Convert A Google Document To HTML</h1>"
  html +=  "<p>This creates a folder with the same name as your chosen Google Document<br/> in your gDrive and a file called 'index.html' inside it and shares it to be 'Public on the Web'</p>"
  html += "<p>Inside the folder will also be an 'images' folder, where copies of the images<br/> will be. The URLs to these images are full URLs so you can cut and paste the BODY html<br/> into the HTML of a Blogger post and they'll still work.</p>"
  var html_widget = app.createHTML(html, false)
  grid.setWidget(1, 2, html_widget)

  // Create the chooser button
  var handler = app.createServerHandler('choose_google_file').addCallbackElement(grid);
  var button = app.createButton('Choose A Google Document...', handler)
  grid.setWidget(2, 2, button)

  // Make a field to pass the file's id in the app back out again
  var file_id = app.createTextBox().setName('file_id').setId('file_id').setText('').setWidth(200).setVisible(false)
  grid.setWidget(2, 1, file_id)

  // To show the name of the file you've chosen
  var file_name = app.createTextBox().setName('file_name').setId('file_name').setText('').setWidth(400).setVisible(false).setStyleAttribute("border", "0px").setStyleAttribute("font-size", "13px")
  grid.setWidget(3, 2, file_name)

  // Create the "convert" button
  var handler2 = app.createServerHandler('convertHandler').addCallbackElement(grid);
  var convert_button = app.createButton('Convert to HTML', handler2)
  grid.setWidget(4, 2, convert_button)

   // Create a "be patient" message
  var msg = app.createHTML("Be patient, this can take a while.", false)
  grid.setWidget(5, 2, msg)

  // Create a "Done!" message and hide it
  var msg = app.createHTML("Your HTML is ready and is available at...", false).setId("ready").setVisible(false)
  grid.setWidget(6, 2, msg)

  // Create the link of the HTML file created, but hide it for now.
  var link = app.createAnchor('', '').setVisible(false).setId('link').setStyleAttribute("font-size", "18px").setStyleAttribute("background", "yellow")
  grid.setWidget(7, 2, link)

  app.add(grid);
  return app
}




function convertHandler(e){
  // Clicked the "Convert" button. Get the values stored in the app's hidden field
  var file_id = e.parameter.file_id
  var file = DocsList.getFileById(file_id)
  var file_name = file.getName()

  // Do the hard work
  var url = convertGoogleDoc( file_id )

  //Update the app
  var app = UiApp.getActiveApplication( )
  var msg = app.getElementById("ready")
  msg.setVisible( true )
  var link = app.getElementById("link")
  link.setVisible( true ).setHref(url).setText( file_name ).setTitle("Converted: " + file_name )

  return app

}




function choose_google_file() {
  var app = UiApp.createApplication().setTitle("Choose a Google Drive file : ").setHeight(350).setWidth(650)
  Logger.log( "choose_google_file: "  + app.getId() )
  var doclisthandler = app.createServerHandler('chosenHandler')
  app.createDocsListDialog().showDocsPicker().addSelectionHandler(doclisthandler).setWidth(350).setHeight(650).setDialogTitle("Choose a file"). setInitialView(UiApp.FileType.DOCUMENTS)

  return app
}

function chosenHandler(eventInfo) {
  // After you've chosen a Google Document, save the chosen Document's id into hidden fields

  var parameter = eventInfo.parameter;
  var eventType = parameter.eventType;
  var source = parameter.source;

  var file_id = parameter.items[0].id
  var file_name = parameter.items[0].name
  var file_url = parameter.items[0].url

  var file = DocsList.getFileById( file_id )
  var file_name = file.getName()

  // Update the app's interface
  var app = UiApp.getActiveApplication();
  app.getElementById("file_id").setText( file_id )
  app.getElementById("file_name").setText( file_name ).setVisible( true )

  return app
}


function lowercaseify(str){
  /* needs work, to work out a formula to turn a textual status into a CSS class*/
 var new_str = str.replace(/\s+/g, '-').toLowerCase();
  new_str = new_str.replace(/:/g, '')
 return new_str
}
function test_lowercaseify(){
  Logger.log( lowercaseify( "Planning Stage 1:Rejected") )

}
