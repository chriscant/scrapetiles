# scrapetiles.js

Command line tool to download map tiles from a tile server for specified zoom levels and saves them in a suitable data directory.

Please ensure that you have permission to access and subsequently use the tiles you are downloading

usage: 
```
node scrapetiles.js url zoomfrom zoomto directory

```

If you run this command:
```
node scrapetiles.js https://example.org/tile 5 9 data
```

The data directory would be created with subdirectories 5, 6, 7, 8 and 9.
Map tile images would be downloaded, eg `https://example.org/tile/5/0/0.png` would be downloaded into `data/5/0/0.png`

The number of tiles at each zoom level is worked out automatically ie `Math.pow(2, zoom)`.
The tiles are number 0 to the maximum-1.
So the final tile 
* at zoom level 5 is `data/5/31/31.png`
* at zoom level 6 is `data/6/63/63.png`
* at zoom level 7 is `data/7/127/127.png`

As the zoom level goes up by one, the number of tiles in the layer doubles.


[MIT](LICENCE)
