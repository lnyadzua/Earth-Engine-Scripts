//You should have loaded an asset in google earth engine
//load shapefiles from assest

var fe = ee.FeatureCollection('users/lmbwia/Mazabuka'); //select one of the loaded shapefiles from assests
Map.addLayer(fe, {}, 'Mazabuka'); //any polygon from asset

//collect images with specific bands
var l5bands = ['B7', 'B4', 'B3' ];

////////// Visualisation parameters
var l5vis = {
  bands: l5bands,
  min : 0, 
  max:0.5,
  gamma:[0.95, 1.1,1]
};

//mask clouds

function maskLandsatclouds(image) {
  var qa = image.select('BQA')
  var cloudBitMask = ee.Number(2).pow(4).int() 
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
  return image.updateMask(mask)
      .select("B.*")
      .copyProperties(image, ["system:time_start"])
}

var l5 = ee.ImageCollection('LANDSAT/LT05/C01/T1_TOA')
    .filterBounds(fe)
    .filterDate('2013-05-01','2013-06-30')
    .map(maskLandsatclouds)
    .select(l5bands);

Map.addLayer(l5, l5vis, "l5");

//print to console
print('compcol',l5);

//mosaicking
var l5_mos = l5.median().clip(fe);// layername.median().clip(geometry name given)
// Map.addLayer(l8_2019mos, l8vis, "l8_2019mos");

// Map.centerObject(poly1);

print('composcol', l5_mos);

// //to iterate for all collection to mosaic
// var l8_2019mosCol = function(image){
//   var l8_2019mos = image.median().clip(poly1);
//   return image.addBands(l8_2019mos);
// };

// l8_2019mosCol = l8_2019.map(l8_2019mosCol);

// print('l8moscol2019', l8_2019mosCol);

  
// //ndvi
// var nir = l8_2019mos.select('B5');
// var red = l8_2019mos.select('B4');
// var ndvi_2019 = nir.subtract(red).divide(nir.add(red)).rename('NDVI_2019');

// Map.centerObject(l8_2019mos,9);// Mapcenter object(geometry used previously,zoom level which is between 1 to 24)
// var ndviParams2019 = {min: -1, max: 1, pallete: ['blue', 'white', 'green']};//visualization parameter
// Map.addLayer(ndvi_2019, ndviParams2019,'NDVI_2019');// (object to add to map, visualization parameters,name of layer)

// print('ndvi_2019', ndvi_2019);

//to iterate for all collection to ndvi 
var nbr_mosCol = function(image){
  var nir = image.select('B4');
  var swir = image.select('B7');
  var nbr = nir.subtract(swir).divide(nir.add(swir)).rename('NBR');
  return nbr;
};

var nbr = nbr_mosCol(l5_mos);

print('nbr', nbr);

var nbrexport = nbr.select('NBR');
print('nbrexport', nbrexport);

// Export image 
// If you want to export any, edit this:
Export.image.toDrive({
  image:nbrexport, ////To choose which imagery to export change the name
  description: 'nbrexport2013', //give correct name
  scale: 30,
  region:fe,
  maxPixels: 1e8
});
