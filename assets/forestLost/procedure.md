# Procedure 

[Nice tutorial](https://datawanderings.com/2020/08/08/raster-backgrounds/)

- Install gdal for [Mac](http://www.kyngchaos.com/software/frameworks/) or [Windows](https://sandbox.idre.ucla.edu/sandbox/tutorials/installing-gdal-for-windows)
- Download the .tif files at `https://glad.geog.umd.edu/projects/gfm/global/gindex.html`
- Then check the projection applied to your geojson and tif file by running :
```
gdalsrsinfo your_map.geojson
gdalsrsinfo your_tif.tif
```
- Convert tif file to same projection than geojson 
```
gdalwarp -s_srs "+proj=sinu +lon_0=0 +x_0=0 +y_0=0 +ellps=WGS84 +units=m +no_defs" -t_srs "+proj=longlat +datum=WGS84 +no_defs" global_forest.tif gf_projected.tif
```
- Align the raster regions, first check the geojson bounds with :
```
ogrinfo your_map.geojson -so -al | grep Extent
```
You get something like: 
> Extent: (-180.000000, -90.000000) - (180.000000, 83.634101)
Now clip your tif file with: 
```
gdal_translate -projwin -180 83.634101 180 -90 gf_projected.tif gf-box.tif
```
- Color your tif file: 
First get insight on tif file values with: 
```
gdalinfo gf-box.tif -stats
```
Then with theses values in mind, define a color scale in a .txt file like this: 
```
0,255,255,255
1,255,255,255
25,0,130,30
75,0,154,30
100,0,200,30
``
And Run the following command: 
```
gdaldem color-relief gf-box.tif gf_colors.txt gf-color.tif
```
- Convert it to PNG before adding it to d3js
```
gdal_translate -of PNG gf-color.tif gf.png
```
