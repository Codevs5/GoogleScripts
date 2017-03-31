/*

*/


function test_convertGoogleDoc(){

  var document_id = '1GWQoQHBuixQKm-9TS7c1I6eh1DXUqbbsHG4UCqlupX8'
  var url = convertGoogleDoc( document_id )
  Logger.log( url )

}

function convertGoogleDoc(document_id) {
  /* Returns a URL to publicly available HTML file */

  var html = ""
  var doc = DocumentApp.openById( document_id )

  // Create new folders
  var folder = DriveApp.createFolder(doc.getName())
  var folder_id = folder.getId()
  folder.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW ) // Make it public on the web.
  var image_folder = folder.createFolder("images" )

  var body = doc.getBody()
  Logger.clear()

  var attributes = body.getAttributes( )
  var is_in_code_block = false

  for ( var i= 0; i < body.getNumChildren();i++ ){
    var child = body.getChild(i)
    var type = child.getType()

    var is_heading = false

    if ( type == DocumentApp.ElementType.PARAGRAPH){
      var atts = child.getAttributes( );

      if ( atts['HEADING'] == 'Heading 1'){
        html = html + "\r<h1>"
        var is_heading = true
      }else if ( atts['HEADING'] == 'Heading 2'){
          html = html + "\r<h2>"
          var is_heading = true
       }else if ( atts['HEADING'] == 'Heading 3'){
            html = html + "\r<h3>"
            var is_heading = true
       }


      for (  var c=0; c < child.getNumChildren();c++){
        var grandchild = child.getChild(c)
        var grandchild_type = grandchild.getType( )
        var grandchild_atts = grandchild.getAttributes( )
        var grandchild_font_family  = atts['FONT_FAMILY']

        // https://developers.google.com/apps-script/reference/document/element-type

        if ( grandchild_type == DocumentApp.ElementType.INLINE_IMAGE ){   /////// IMAGE
          var blob = grandchild.getBlob( )
          var content_type = blob.getContentType()
          var suffix = content_type.split("/")[1] //e.g gif/jpg or png
          var image_name = "test.png" //Invent a name, the blob seems to need it?
          blob.setName( image_name )
          try{
            image_name = "image_" + i + "." + suffix
            var photo = image_folder.createFile(blob)
            photo.setName(image_name)
            //Logger.log( "Photo created: " + image_name + " " + photo.getId() )
          }catch(e){
            Logger.log( "Image problem: " + e )
            Logger.log(e)
          }
          var src = 'https://googledrive.com/host/' + folder_id + '/images/' + image_name
          html = html + "\r<p>" + '<a href="' + src + '"><img src="'+ src +'"/></a></p>\r'

        }else if ( grandchild_type ==DocumentApp.ElementType.TEXT){  ////// TEXT
          var text = grandchild.getText( )


          if ( is_heading == false){

            if ( grandchild.getLinkUrl() != null){ // Is it a link?
              html = html + '<a href="' + grandchild.getLinkUrl() + '">' + my_escape(text) + '</a>'

            }else{

              if (grandchild_font_family != null){ // It's been set as courier.
                if ( grandchild_font_family.name() == 'COURIER_NEW'){
                  var font_name = grandchild_font_family.name()
                  html = html + text + "\r"
                }else{
                  html = html + "\r\r<p>" + my_escape(text.replace(/\\r/g, '<br />')) + "</p>"

                }

              }else{
                html = html + "\r\r<p>" + my_escape(text.replace(/\\r/g, '<br />')) + "</p>"
              }
            }

          }else{
            html = html +  my_escape(text) + "" // The heading text
          }

        }else if ( grandchild_type ==DocumentApp.ElementType.PAGE_BREAK){
          html = html + ""
        }

        else{
          Logger.log( "grandchild: " + grandchild.getType() )
        }
      }

      if ( atts['HEADING'] == 'Heading 1'){
        html = html + "</h1>"
      }else if ( atts['HEADING'] == 'Heading 2'){
        html = html + "</h2>"
      }else if ( atts['HEADING'] == 'Heading 3'){
        html = html + "</h3>"
      }

    }else if ( type == DocumentApp.ElementType.LIST_ITEM){

      html = html + "\r\r<p>\t<ul>\r"
      for (  var c=0; c < child.getNumChildren();c++){
        var grandchild = child.getChild(c)
        var grandchild_type = grandchild.getType()
        try{
          html = html +  "\t\t<li>"  + my_escape(grandchild.asText().getText()) + "</li>\r"
        }catch(e){
          Logger.log( "LIST_ITEM WOES:" + e )
        }
      }
      html = html + "\r\t</ul></p>"
    }


  }


  html = my_tidy( html ) // Clean up cock ups
  html = '<html><head>\r<title>' + doc.getName() + '</title>\r</head>\r<body>\r' + html + '</body></html>'

  var html_file = folder.createFile('index.html', html, 'text/html' )
  folder.addFile( html_file )
  //Logger.log( "Doc created: " + html_file.getId() )
  var public_url = 'https://googledrive.com/host/' + folder.getId() + '/index.html'
  Logger.log("Access it at: " + public_url )
  return public_url
}

function my_escape( str ){
  var s = str.replace(/?/g, '&apos;') // Smart quotes!
  s = s.replace(/?/g, '"')// Smart quotes!
  s = s.replace(/?/g, '"')// Smart quotes!
  s = entities_to_html(s) // Don't do < and > so we can add html such as <code>
  return s

}

function my_tidy(html){
  //Need more work
  html = html.replace(/<h2><\/h2>/g, '')
  html = html.replace(/<h3><\/h3>/g, '')
  return html
}

function test_driveapp(){
  var document_id = '1VAIipqttY6ELlIr6a38E68IuMPhxpbnGtVHRukKdEX8'
  var doc = DocumentApp.openById( document_id )
  var folder = DriveApp.createFolder(doc.getName())
  html = '<html><title>Hello</title><body>yeah!</body></html>'
  var html_file = folder.createFile('index.html', html, 'text/html' )
  folder.addFile(html_file)
}
