var Spotify = require('spotify-web-api-node'),
         fs = require('fs'),
       path = require('path'),
          s ;

/**
 * Init Spotify API.
 */
var initSpotify = function initSpotify () {
	if ( s === null ) {
		s = new Spotify({
			clientId: 'dc3a0ffddcd64f0b94f57dbcbed0b27f',
			clientSecret: '863b2bbfa8634b74a888b5b04f6dea24',
			redirectUri: 'http://localhost:3000/callback'
		}) ;
	}
	return s ;
}

/**
 * Print usage.
 */
var printUsage = function printUsage () {
	console.log("\nUsage:\n\tnode app.js <playlist.txt>\n") ;
}

var loadPlaylist = function loadPlaylist (filename) {
	return new Promise(function(resolve, reject) {
		fs.readFile(filename, {encoding: 'utf-8'}, function (err,data) {
			if (!err) {
				resolve(data) ;
			} else {
				reject(err) ;
			}
		}) ;
	});
}

var firstTrackResultFor = function firstTrackResultFor (queryTerm) {
	s.searchTracks(queryTerm, {limit: 5})
		.then( function (data) {
			console.log( JSON.stringify(data,null,2) ) ;
		}) ;
}

if ( process.argv.length < 3) {
	printUsage() ;
	return 1 ;
}

process.stdout.write(">>> Initializing API…") ;
initSpotify() ;
process.stdout.write(" done!\n") ;

process.stdout.write(">>> Loading file…") ;
var promise = loadPlaylist(process.argv[2]) ;
process.stdout.write(" done!\n") ;
promise.then( function (playlist) {
	console.log(playlist) ;
}) ;
//console.log(playlist) ;

return 0 ;
