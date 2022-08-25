const needle = require('needle');
const countWordsArray = require("count-words-array");
const h2p = require('html2plaintext')
const  Hapi  = require('hapi');
const { Z_DEFAULT_STRATEGY } = require('zlib');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const server = new Hapi.Server({ port: 3000, host: 'localhost' });

server.route({  
  method: 'GET',
  path: '/',
  handler:  async function (request, h) {

    
    var promises = [];
    request.query.list.forEach(async el => {
        promises.push(new Promise(resolve =>{
                    needle.get(el, function (err, res) {
                        if (err)
                            throw err;
                        var result = countWordsArray(h2p(res.body)).filter(word => word.name.length > 3).splice(0,3);
                        var object = 
                        { name : el,
                          values: [
                              result[0].name,
                              result[1].name,
                              result[2].name  
                            ]
                        }
                        resolve(object)
                    })
                })
            )
    })
    let trueAnswer = []
    for (let i =0; i< promises.length; i++){
        trueAnswer.push(await promises[i]);
    }     
    const doc = new PDFDocument();
    
    doc.pipe(fs.createWriteStream('example.pdf'));
    let prettyString = "";
    trueAnswer.forEach(el =>{
      prettyString+= el.name + "\n      " + el.values.join('\n      ') + '\n\n' 
    })
    doc
      .fontSize(27)
      .text(prettyString, 100, 100);
    doc.end();

    return h.response(fs.readFileSync('example.pdf')).header("Content-type", "application/pdf");
   
   
 
      
    }
});




server.start((err) => {
    if (err) {
        throw err;
    }
    
});

