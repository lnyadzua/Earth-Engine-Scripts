
var zam = ee.FeatureCollection('users/lmbwia/ZAM');
Map.addLayer(zam,{},'ZAM');

//visualization
var l8bands = ['B1','B2','B3','B4','B5','B6','B7','B9'];

var bandl8 = ['B5','B4','B3'];

var l8params = {
  bands: bandl8,
  min : 0,
  max: 0.3,
  gamma: [0.95, 1.1, 1]
 };


var maskLandsatclouds = function(image) {
  var qa = image.select('BQA')
  var cloudBitMask = ee.Number(2).pow(4).int()
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
  return image.updateMask(mask)
      .select("B.*")
      .copyProperties(image, ["system:time_start"])
}

var getNDVI = function(image){
  var ndvi = image
  .normalizedDifference(['B5', 'B4'])
  .rename('NDVI');
  return image.addBands(ndvi);
};
print("getNDVI", getNDVI);

//############################
//Get image collection

//Make start and end layers


var startDate = '2019-01-01';
var endDate = '2019-12-31';
var weekDifference = ee.Date(startDate).advance(1, 'week').millis().subtract(ee.Date(startDate).millis());
var listMap = ee.List.sequence(ee.Date(startDate).millis(), ee.Date(endDate).millis(), weekDifference);

//function to get weekly composite
var getWeeklyNDVIComposite = function(date){
  //only include NDVI for sonsistent composite
  var l8 = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA')
                  .filterBounds(zam)
                  .filterDate(date, date.advance(1,'week'))
                  .map(maskLandsatclouds)
                  .select(bandl8)
                  .sort('CLOUD_COVER')
                  .map(getNDVI);
  var composite = l8.mean()
                    .set('system:time_start', date.millis(), 'dateYMD', date.format('YYYY-MM-dd'),'numbImages', l8.size());
  return composite;
};

print('getWeeklyNDVIComposite',getWeeklyNDVIComposite);

var l8ndvi = ee.ImageCollection.fromImages(listMap.map(function(dateMillis){
  var date = ee.Date(dateMillis);
  return getWeeklyNDVIComposite(date);
}));

print('l8ndvi',l8ndvi);

Map.addLayer(l8ndvi,{},'l8ndvi');