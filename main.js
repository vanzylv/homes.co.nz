'use strict'

/*Load original properties file*/
const fs = require('fs'), filename = "properties.txt";
const CHEAP_PROPS = 400000;
const CHUNK_SIZE = 10;
const REMOVE_EVERY_NTH_ROW = 10;

/*Convert file data into usable JS objects*/
const sanitizeFileData = (fileData) => {

  let dataArr = fileData.split('\n');
  let sanitizedArr = [];

  dataArr.forEach((property) => {
    let destructedItem = property.replace(/\r?\n?/g, '').trim().split('\t');

    /*Ignore headers and empty lines*/
    if (destructedItem[0].trim() !== 'ID' && destructedItem[0].trim() !== '') {
      sanitizedArr.push({
        id: destructedItem[0].trim(),
        street: destructedItem[1].trim(),
        town: destructedItem[2].trim(),
        valuationDate: destructedItem[3].trim(),
        value: destructedItem[4].trim()
      });
    }
  });

  /*Remove absolute duplicates*/
  let prunedDuplicates = sanitizedArr.filter((item, index, self) =>
    index === self.findIndex((t) => (
      t.street === item.street && t.town === item.town && t.valuationDate === item.valuationDate && t.value === item.value
    ))
  );

  if (prunedDuplicates.length === sanitizedArr.length) console.log('Yay!, no duplicates');

  return prunedDuplicates;
};

const groupData = (sanitizedArr) => {
  let checkedArr = [], groupedArr = [];

  sanitizedArr.forEach((item) => {
    if (checkedArr.findIndex(x => x.street === item.street && x.valuationDate === item.valuationDate) === -1) {
      let diplicates = findDuplicate(sanitizedArr, item.street, item.town, item.valuationDate);
      groupedArr.push(diplicates);
      checkedArr.push({ street: item.street, valuationDate: item.valuationDate });
    }
  });

  return groupedArr;
}

const findDuplicate = (sanitizedArr, street, town, date) => {
  return sanitizedArr.filter(x => x.street === street && x.town === town && x.valuationDate === date);
}

const flattenObject = (jsObject) => {
  let flatFile = '';
  jsObject.forEach((item) => {
    for (var property in item) {
      if (item.hasOwnProperty(property)) {
        flatFile += item[property] + "\t";
      }
    }
    flatFile += '\r';
  });
  return flatFile;
};

const writeFile = (data, filename) => {
  fs.writeFile(`./results/json/${filename}.json`, JSON.stringify(data), function (err) {
    if (err) {
      return console.log(err);
    }
    console.log(`The ./results/json/${filename} file was saved!`);
  });

  fs.writeFile(`./results/raw/${filename}.txt`, flattenObject(data), function (err) {
    if (err) {
      return console.log(err);
    }
    console.log(`The ./results/raw/${filename} file was saved!`);
  });
};

const createArrayChunks = (masterArr, perChunk) => {
  
  return masterArr.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / perChunk)

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [] // start a new chunk
    }

    resultArray[chunkIndex].push(item);
    return resultArray;
  }, [])

};

const applyFilters = (data) => {
  //remove >= 400k properties
  let filtersArr = data.filter(x => parseInt(x.value) >= CHEAP_PROPS);

  //remove pretentious `street` names
  filtersArr = filtersArr.filter(x => !x.street.toUpperCase().match('AVE|CRES|PL'));

  //remove every 10th item
  filtersArr = filtersArr.filter(function (_, i) {
    return (i + 1) % REMOVE_EVERY_NTH_ROW;
  })

  return filtersArr;
};

/*Sanitize file data*/
const sanitizedData = sanitizeFileData(fs.readFileSync(filename, 'utf8'));

/*Group data*/
const groupedData = groupData(sanitizedData);

/*Answer quesions*/
let answer1Arr = [], answer2Arr = [], answer3Arr = [];

groupedData.forEach((groupedItem) => {

  //last item in arr
  answer1Arr.push(groupedItem[groupedItem.length - 1]);

  //first item in arr
  answer2Arr.push(groupedItem[0]);

  //non duplicates
  if (groupedItem.length === 1) {
    answer3Arr.push(groupedItem[0]);
  }

});

/*Apply Filters*/
const answer4Arr = applyFilters(sanitizedData);

/*Chunk - BONUS POINTS!!*/

//1.Break array into chunks of 10
let chunkedArr = createArrayChunks(sanitizedData, CHUNK_SIZE);
let mergedChunk = [];

//2.Apply filters
chunkedArr.forEach((chunk) => {
  //3.Merge back
  mergedChunk = mergedChunk.concat(applyFilters(chunk));
});

writeFile(answer1Arr, 'answer1');
writeFile(answer2Arr, 'answer2');
writeFile(answer3Arr, 'answer3');
writeFile(answer4Arr, 'answer4');
writeFile(mergedChunk, 'mergedChunk');

//Fin, thank you :)





