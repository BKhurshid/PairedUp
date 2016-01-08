var fs = require("fs");
module.exports = {
  forceHTTPS: function(req, res, next) {
    var protocol = req.get('x-forwarded-proto');
    protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
  }, 

  allowCrossOrigin: function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
    next();
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