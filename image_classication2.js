//You should have loaded an asset in google earth engine
//load shapefiles from assest


//collect images with specific bands
var l8fullbands = ['B2','B3','B4','B5','B6', 'B7', 'B10', 'B11' ];

var l8bands =['B5', 'B4', 'B3'];
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
    .filterBounds(Poly1)
    .filterDate('2019-05-01','2019-05-30')
    .map(maskLandsatclouds)
    .select(l8bands);

//used to map area on GEE
Map.addLayer(l8_2019, l8vis, "l8_2019");

//mosaicking
var l8_2019mos = l8_2019.median().clip(Poly1);// layername.median().clip(geometry name given)
Map.addLayer(l8_2019mos, l8vis, "l8_2019mos");

Map.centerObject(Poly1);

print('composcol', l8_2019mos); 

//to iterate for all collection to mosaic
var l8_2019mosCol = function(image){
  var l8_2019mos = l8_2019.median().clip(Poly1);
  return image.addBands(l8_2019mos);
};

l8_2019mosCol = l8_2019.map(l8_2019mosCol);

print('l8moscol2019', l8_2019mosCol);

//Manually created polygons

var water1 = ee.Geometry.Rectangle((25.9697,-15.1246), (25.9704,-15.1246), (25.9704,-15.1232), (25.9697,-15.1232));
var water2 = ee.Geometry.Rectangle((25.9749,-15.1255), (25.9758,-15.1255), (25.9758,-15.1249), (25.9749,-15.1249));
var water3 = ee.Geometry.Rectangle((25.9256,-15.8079), (25.9472,-15.8079), (25.9472,-15.7824), (25.9256,-15.7824));
var water4 = ee.Geometry.Rectangle((25.9801,-15.6816), (26.0038,-15.6816), (26.0038,-15.6572), (25.9801,-15.6572));
var water5 = ee.Geometry.Rectangle((27.1893,-15.8068), (27.2154,-15.8068), (27.2154,-15.7735), (27.1893,-15.7735));
var floodplain1 = ee.Geometry.Rectangle((27.1369,-15.6664),(27.1568,-15.6664),(27.1568,-15.6449),(27.1369,-15.6449));
var floodplain2 = ee.Geometry.Rectangle((27.0747,-15.6651),(27.1036,-15.6651),(27.1036,-15.6354),(27.07477,-15.6354));
var floodplain3 = ee.Geometry.Rectangle((27.1307,-15.7302),(27.1571,-15.7302),(27.1571,-15.7008),(27.1307,-15.7008));
var floodplain4 = ee.Geometry.Rectangle((27.1755,-15.6767),(27.1855,-15.6767),(27.1855,-15.6668),(27.1755,-15.6668));
var forest1 =ee.Geometry.Rectangle((25.7999,-15.3399),(25.8077,-15.3399),(25.8077,-15.3316),(25.7999,-15.3316));
var forest2 = ee.Geometry.Rectangle((25.8312,-15.2841),(25.8490,-15.2841),(25.8490,-15.2647),(25.8312,-15.2647));
var forest3 = ee.Geometry.Rectangle((25.7292,-15.2651),(25.7420,-15.2651),(25.7420,-15.2564),(25.7292,-15.2564));
var forest4 = ee.Geometry.Rectangle((26.1134,-15.1830),(26.1305,-15.1830),(26.1305,-15.1631),(26.1134,-15.1631));
var forest5 = ee.Geometry.Rectangle((25.6828,-15.6420),(25.6920,-15.6420),(25.6920,-15.6315),(25.6828,-15.6315));
var burntarea1 = ee.Geometry.Rectangle((25.6798,-15.1019),(25.6969,-15.1019),(25.6969,-15.0870),(25.6798,-15.0870));
var burntarea2 = ee.Geometry.Rectangle((25.6736,-14.9706),(25.6829,-14.9706),(25.6829,-14.9610),(25.6736,-14.9610));
var burntarea3 = ee.Geometry.Rectangle((25.8573,-15.0135),(25.8910,-15.0135),(25.8910,-14.9864),(25.8573,-14.9864));
var burntarea4 = ee.Geometry.Rectangle((25.8068,-15.0659),(25.8185,-15.0659),(25.8185,-15.0507),(25.8068,-15.0507));
var burntarea5 = ee.Geometry.Rectangle((25.9085,-14.8501),(25.9381,-14.8501),(25.9381,-14.8236),(25.9085,-14.8236));

//Make a FeatureCollection from the hand-made geometries(the polygons above)
var polygons = ee.FeatureCollection([
  ee.Feature(water1,{'class': 0}),
  ee.Feature(water2,{'class': 0}),
  ee.Feature(water3,{'class': 0}),
  ee.Feature(water4,{'class': 0}),
  ee.Feature(water5,{'class': 0}),
  ee.Feature(floodplain1,{'class': 1}),
  ee.Feature(floodplain2,{'class': 1}),
  ee.Feature(floodplain3,{'class': 1}),
  ee.Feature(floodplain4,{'class': 1}),
  ee.Feature(forest1,{'class': 2}),
  ee.Feature(forest2,{'class': 2}),
  ee.Feature(forest3,{'class': 2}),
  ee.Feature(forest4,{'class': 2}),
  ee.Feature(forest5,{'class': 2}),
  ee.Feature(burntarea1,{'class': 3}),
  ee.Feature(burntarea2,{'class': 3}),
  ee.Feature(burntarea3,{'class': 3}),
  ee.Feature(burntarea4,{'class': 3}),
  ee.Feature(burntarea5,{'class': 3}),
  ]);
  
//Get the values for all pixels in each polygon in the training
var training = l8_2019mos.select(l8bands)
  .sampleRegions({
  //Get the sample from the polygons FeatureCollection.
  collection:polygons,
  //Keep this list of properties from the polygons.
  properties:['class'],
  //Set the scale to get Landsat pixels in the polygons.
  scale: 30
});

// Create an SVM classifier with custom parameters.
var classifier = ee.Classifier.svm({
  kernelType: 'RBF',
  gamma: 0.5,
  cost: 10
});

// Train the classifier.
var trained = classifier.train(training,'class', l8bands);

// Classify the image.
var classified = l8_2019mos.classify(trained);

// Display the classification result and the input image.
Map.setCenter(24.5976,-17.1595, 9);
Map.addLayer(l8_2019mos, {l8bands: ['B5', 'B4', 'B3'], max: 0.5, gamma: 2});
Map.addLayer(polygons, {}, 'training polygons'); 
Map.addLayer(classified,
             {min: 0, max: 1, palette: ['red', 'green']},
             'class');