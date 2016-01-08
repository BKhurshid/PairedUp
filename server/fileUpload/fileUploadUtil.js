
//content will hold the data from the uploaded file
var content;
module.exports = {
  sendFileDataToClient: function(data) {
    //send the data from the file to the client. 
    io.emit('fileData', content);
  },
  fileUpload: function(req, res, next) {
    //collect the data from the file in a human readable form. 
    fs.readFile(req.file.path, 'ascii', function ( error, data ) {
      if ( error ) {
        console.error( error );
      } else {
        //content is being asynchronously set to the data in the file
        content = data;
        sendFileDataToClient(content);
      }
    });
  }
};
