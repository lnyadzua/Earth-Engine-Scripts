//You should have loaded an asset in google earth engine
//load shapefiles from assest

var fe = ee.FeatureCollection('users/lmbwia/ZAM'); //select one of the loaded shapefiles from assests
Map.addLayer(fe, {}, 'ZAM'); //any polygon from asset

//collect images with specific bands
var l8bands = ['B6', 'B5', 'B4' ];

////////// Visualisation parameters
var l8vis = { 
  bands: l8bands, 
  min : 0,
  max:0.5,
  gamma:[0.95, 1.1,1]
};
 
//mask clouds==this is a function on GEE

function maskLandsatclouds(image) {
  var qa = image.select('BQA')
  var cloudBitMask = ee.Number(2).pow(4).int()
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
  return image.updateMask(mask)
      .select("B.*")
      .copyProperties(image, ["system:time_start"])
}

//filter the location with the geometry(bounds)
var l8_2019 = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA')
    .filterBounds(fe)
    .filterDate('2019-08-15','2019-10-15')
    .map(maskLandsatclouds)
    .select(l8bands);

//used to map area on GEE
Map.addLayer(l8_2019, l8vis, "l8_2019");

//mosaicking
var l8_2019mos = l8_2019.median().clip(fe);// layername.median().clip(geometry name given)
Map.addLayer(l8_2019mos, l8vis, "l8_2019mos");

Map.centerObject(fe);

print('composcol', l8_2019mos);

//to iterate for all collection to mosaic
var l8_2019mosCol = function(image){
  var l8_2019mos = l8_2019.median().clip(fe);
  return image.addBands(l8_2019mos);
};

l8_2019mosCol = l8_2019.map(l8_2019mosCol);

print('l8moscol2019', l8_2019mosCol);

  
//ndvi
var nir = l8_2019mos.select('B5');
var red = l8_2019mos.select('B4');
var ndvi_2019 = nir.subtract(red).divide(nir.add(red)).rename('NDVI'); //the rename section will remain

Map.centerObject(l8_2019mos,9);// Mapcenter object(geometry used previously,zoom level which is between 1 to 24)
var ndviParams2019 = {min: -1, max: 1, pallete: ['blue', 'white', 'green']};//visualization parameter
Map.addLayer(ndvi_2019, ndviParams2019,'NDVI');// (object to add to map, visualization parameters,name of layer)

print('ndvi_2019', ndvi_2019);

//to iterate for all collection to ndvi
var ndvi_2019mosCol = function(image){
  var nir = l8_2019mos.select('B5');
  var red = l8_2019mos.select('B4');
  var ndvi_2019 = nir.subtract(red).divide(nir.add(red)).rename('NDVI');
  return image.addBands(ndvi_2019);
};

ndvi_2019mosCol = l8_2019.map(ndvi_2019mosCol);
 
print('ndvimoscol2019', ndvi_2019mosCol);

//before exporting and you want to 
//reduce the image collection to one image by summing it up

var sepndvi2019= ndvi_2019mosCol.reduce(ee.Reducer.mean());
print(sepndvi2019);

//get the mean values from the reduced image collection
var fendvi = sepndvi2019.reduceRegions({
  collection:fe,
  reducer: ee.Reducer.mean(),
  scale:30
}); 

print(fendvi);

//to export the image

// drop .geo column (not needed if goal is tabular data) 
var feout = fendvi.select(['.*'],null,false);

// add a new column for date to each feature in the feature collection
feout = feout.map(function(feature){
  return feature.set('PERIOD','Oct15-31');//'year done for ndvi' and month
});

// add a new column for year
feout = feout.map(function(feature){
  return feature.set('YEAR','2019');//'year done for ndvi' and month
});

//Export data to table
Export.table.toDrive({
  collection: feout,
  description:'ZAM_form1_Oct15-31ndvi2019',// this is a description for how to save the file
  folder:'ZAM',
  fileFormat:'CSV'
});




