
//collect images with specific bands
var l5bands = ['B5', 'B4', 'B2' ];

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

var l5_2011_12 = ee.ImageCollection('LANDSAT/LT05/C01/T1_TOA')
    .filterBounds(poly1)
    .filterDate('2007-01-01','2007-12-31')// dates should change
    .map(maskLandsatclouds)
    .select(l5bands);

Map.addLayer(l5_2011_12, l5vis, "l5_2011_12");

//print to console
print('compcol',l5_2011_12);

//mosaicking
var l5_2011_12mos = l5_2011_12.median().clip(poly1);// layername.median().clip(geometry name given)
Map.addLayer(l5_2011_12mos, l5vis, "l5_2011_12mos");

Map.centerObject(poly1);

print('compmoscol', l5_2011_12mos);

//to iterate for all collection to mosaic
var l5_2011_12mosCol = function(image){
  var l5_2011_12mos = l5_2011_12.median().clip(poly1);
  return image.addBands(l5_2011_12mos);
}; 

l5_2011_12mosCol = l5_2011_12.map(l5_2011_12mosCol);

print('l5moscol2011_12', l5_2011_12mosCol);

  
//mndwi
var green = l5_2011_12mos.select('B2');
var swir = l5_2011_12mos.select('B5');
var mndwi_2011_12 = green.subtract(swir).divide(green.add(swir)).rename('MNDWI_2011_12');

Map.centerObject(l5_2011_12mos,9);// Mapcenter object(geometry used previously,zoom level which is between 1 to 24)
var mndwiParams2011_12 = {min: -1, max: 1, pallete: ['blue', 'white', 'green','red']};//visualization parameter
Map.addLayer(mndwi_2011_12, mndwiParams2011_12,'MNDWI_2011_12');// (object to add to map, visualization parameters,name of layer)

print('mndwi_2011_12', mndwi_2011_12);

//to iterate for all collection to ndvi
var mndwi_2011_12mosCol = function(image){
  var green = l5_2011_12mos.select('B2');
  var swir = l5_2011_12mos.select('B5');
  var mndwi_2011_12 = green.subtract(swir).divide(green.add(swir)).rename('MNDWI_2011_12');
  return image.addBands(mndwi_2011_12);
}; 

mndwi_2011_12mosCol = l5_2011_12.map(mndwi_2011_12mosCol);

print('mndwimoscol2011_12', mndwi_2011_12mosCol);
 
// //Export image 
// ///If you want to export any, edit this:
// Export.image.toDrive({
//   image:ndbi_2011_12mosCol, ////To choose which imagery to export change the name
//   description: 'ndbi_2011_12', //give correct name
//   scale: 30,
//   region:poly1
// });
