
//collect images with specific bands
var l8bands = ['B6', 'B5', 'B2' ];

////////// Visualisation parameters
var l8vis = {
  bands: l8bands,
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

var l8_2019 = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA')
    .filterBounds(poly1)
    .filterDate('2019-01-01','2019-01-31')
    .map(maskLandsatclouds)
    .select(l8bands);

Map.addLayer(l8_2019, l8vis, "l8_2019");

//print to console
print('compcol',l8_2019);

//mosaicking
var l8_2019mos = l8_2019.median().clip(poly1);// layername.median().clip(geometry name given)
Map.addLayer(l8_2019mos, l8vis, "l8_2019mos");

Map.centerObject(poly1);

print('composcol', l8_2019mos);

//to iterate for all collection to mosaic
var l8_2019mosCol = function(image){
  var l8_2019mos = l8_2019.median().clip(poly1);
  return image.addBands(l8_2019mos);
};

l8_2019mosCol = l8_2019.map(l8_2019mosCol);

print('l8moscol2019', l8_2019mosCol);

  
//ndbi
var swir = l8_2019mos.select('B6');
var nir = l8_2019mos.select('B5');
var ndbi_2019 = swir.subtract(nir).divide(swir.add(nir)).rename('NDBI_2019');

Map.centerObject(l8_2019mos,9);// Mapcenter object(geometry used previously,zoom level which is between 1 to 24)
var ndbiParams2019 = {min: -1, max: 1, pallete: ['blue', 'white', 'green']};//visualization parameter
Map.addLayer(ndbi_2019, ndbiParams2019,'NDBI_2019');// (object to add to map, visualization parameters,name of layer)

print('ndbi_2019', ndbi_2019);

//to iterate for all collection to ndvi
var ndbi_2019mosCol = function(image){
  var swir = l8_2019mos.select('B6');
  var nir = l8_2019mos.select('B5');
  var ndbi_2019 = swir.subtract(nir).divide(swir.add(nir)).rename('NDBI_2019');
  return image.addBands(ndbi_2019);
};

ndbi_2019mosCol = l8_2019.map(ndbi_2019mosCol);

print('ndbimoscol2019', ndbi_2019mosCol);

// //Export image 
// ///If you want to export any, edit this:
// Export.image.toDrive({
//   image:ndbi_2019mosCol, ////To choose which imagery to export change the name
//   description: 'ndbi_2019', //give correct name
//   scale: 30,
//   region:poly1
// });
