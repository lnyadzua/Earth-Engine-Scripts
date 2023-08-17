//load shapefiles

var kas = ee.FeatureCollection('users/lmbwia/kasinthula');
Map.addLayer(kas, {}, 'kasinthula');

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
    .filterBounds(kas)
    .filterDate('2019-09-20','2019-09-30')
    .map(maskLandsatclouds)
    .select(l8bands);

//used to map area on GEE
Map.addLayer(l8_2019, l8vis, "l8_2019");

//mosaicking
var l8_2019mos = l8_2019.median().clip(kas);// layername.median().clip(geometry name given)
Map.addLayer(l8_2019mos, l8vis, "l8_2019mos");

Map.centerObject(kas);

print('composcol', l8_2019mos);

//to iterate for all collection to mosaic
var l8_2019mosCol = function(image){
  var l8_2019mos = l8_2019.median().clip(kas);
  return image.addBands(l8_2019mos);
};

l8_2019mosCol = l8_2019.map(l8_2019mosCol);

print('l8moscol2019', l8_2019mosCol);

  
//ndvi
var nir = l8_2019mos.select('B5');
var red = l8_2019mos.select('B4');
var ndvi_2019 = nir.subtract(red).divide(nir.add(red)).rename('NDVI_2019');

Map.centerObject(l8_2019mos,9);// Mapcenter object(geometry used previously,zoom level which is between 1 to 24)
var ndviParams2019 = {min: -1, max: 1, pallete: ['blue', 'white', 'green']};//visualization parameter
Map.addLayer(ndvi_2019, ndviParams2019,'NDVI_2019');// (object to add to map, visualization parameters,name of layer)

print('ndvi_2019', ndvi_2019);

//to iterate for all collection to ndvi
var ndvi_2019mosCol = function(image){
  var nir = l8_2019mos.select('B5');
  var red = l8_2019mos.select('B4');
  var ndvi_2019 = nir.subtract(red).divide(nir.add(red)).rename('NDVI_2019');
  return image.addBands(ndvi_2019);
};

ndvi_2019mosCol = l8_2019.map(ndvi_2019mosCol);
 
print('ndvimoscol2019', ndvi_2019mosCol);

// var ndvicolchart = ui.Chart.image.series({
//   imageCollection : ndvi_2019mosCol.select('NDVI_2019'),
//   region: fp,
//   reducer: ee.Reducer.mean(),
//   scale: 30,
// });
// print(ndvicolchart);
//Export as table

var ndvits = ndvi_2019mosCol.map(function(image){
  var date = image.get('system:time_start')
  var mean = image.reduceRegion({
    reducer : ee.Reducer.mean(),
    geometry: kas,
    scale:30
  });
  
//and return a feature with 'null' geometry with propertie(dictionary)
return ee.Feature(null,{mean: mean.get('NDVI_2019'),
                         'date':date})
});

//Export a .csv table of date, mean NDVI for farmpolygons

Export.table.toDrive({
  collection: ndvits,
  description: 'kastable',
  fileFormat: 'CSV'
});

//Make a feature without geometry and set the properties to the 
//dictionary of means.

// // Export image 
// // If you want to export any, edit this:
// Export.image.toDrive({
//   image:ndvi_2019mosCol.select(["NDVI_2019"]), ////To choose which imagery to export change the name
//   description: "ndvi_2019", //give correct name
//   region:fp,
//   scale: 30
// });


