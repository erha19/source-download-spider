const request = require('request');
const fs = require('fs');
const async = require('async');
const imageDir = './images/';
let offset = 0, page = 1;
let options = {};
let Datalist = []

function generateUrl(offset,page){
  return `https://rapidapi.com/v2/packages/trending/all?offset=${offset}&page=${page}`
}
function getDataList(url) {
  options.url = url;
  console.log(`Pull...${url}`)
  request.get(options, function(error, response, body) {
      if(!error && response.statusCode == 200) {
          const res = JSON.parse(response.body);
          if(res.length>0) {
            Datalist = Datalist.concat(res)
            offset+= 10;
            page+= 1;
            getDataList(generateUrl(offset,page));
          }
          else {
            console.log(`Pull complite!`);
            startDownLoad(Datalist)
            downLoadContent(JSON.stringify(Datalist));
          }
      }
  })
}
function downLoadContent(cont) {
  fs.writeFile('./' + 'data.json', cont, 'utf-8', function(err) {
      if(err) {
          console.log(err);
      } else
          console.log('Generate data.json success');
  });
}
function downLoadImg(image) {
    request.head(image.thumbnail, function(err, res, body) {
      if(err) {
          console.log(`pull...${image.thumbnail} Error`)
          console.log('Log:', err.Error)
      }
      else {
        request(image.thumbnail)
        .pipe(fs.createWriteStream(imageDir + image.name.replace(/\W+?/g, '-')))
        .on('close', ()=>console.log('Download success!'))
        .on('error', e=>{
          console.log(`pull...${image.thumbnail} Error`)
        })
      }
    });
    
}

function startDownLoad(imgdata){
  if (!fs.existsSync(imageDir)){
    fs.mkdirSync(imageDir);
  }
  async.eachLimit(imgdata, 3, function (item, callback) {
    downLoadImg(item);
    callback();
  }, function (err) {
      if(err) {
          console.log(err);
      } else {
          console.log('Download success!');
      }
  });
}
getDataList(generateUrl(offset,page))