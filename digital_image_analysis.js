// //Note that we need to cast the result of first() to Image.
// var image = ee.Image(LANDSAT/LM05/C01/T1

// //Filter to get only images in the specifies range.
//     .filterDate('2000-01-01', '2000-12-31')

// //Filter to get only images at the location of the point
//     .filterBounds(point)

// //Sort the collection by a metadata property
// .sort('CLOUD_COVER'));

// //Get the first image out of this collection
//collect images with specific bands
var l5bands = ['B5', 'B4', 'B3' ];

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
    .filterDate('2000-01-01','2010-05-11')// dates should change
    .map(maskLandsatclouds)
    .select(l5bands);