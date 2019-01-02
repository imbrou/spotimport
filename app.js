var SpotifyWebApi = require('spotify-web-api-node'),
                s = null ;

/**
 * Initializes Spotify API.
 * 
 * @return an authenticated Spotify API instance
 */
var initSpotify = async function initSpotify () {
	if ( s === null ) {
		// Instanciate library
		var api = new SpotifyWebApi({
			clientId: 'dc3a0ffddcd64f0b94f57dbcbed0b27f',
			clientSecret: '863b2bbfa8634b74a888b5b04f6dea24',
			//redirectUri: 'http://localhost:3000/callback'
		}) ;
		// Authenticate against Spotify's OAuth servers
		try {
			let data = await api.clientCredentialsGrant() ;
			api.setAccessToken(data.body['access_token']) ;
			s = api ;
		} catch (err) {
			console.log(
				'Something went wrong when retrieving an access token',
				err.message
			) ;
		} ;
	}
	return s ;
}

/**
 * Prints usage.
 */
var printUsage = function printUsage () {
	console.log("\nUsage:\n\tnode app.js <playlist.txt>\n") ;
}

/**
 * Loads tracks of a playlist from a TXT file.
 * Tracks must be newline-separated.
 * On a line, the artist must come first, then the ' - ' separator, then the title.
 * 
 * @param filename {String} path to the file to open
 * @return {String} playlist
 */
var loadPlaylist = function loadPlaylist (filename) {
	let file = require('fs').readFileSync(filename, {encoding: 'utf-8'}) ;
	var playlist = file.split('\n')
		.filter( entry => /\S/.test(entry) ) // remove white lines
		.map( (line, index) => Object({
				index: index,
				artist: line.split(' - ').shift().trim(),
				name: line.split(' - ').pop().trim()
		})) ;
	return playlist ;
}

/**
 * Returns a user's playlists.
 * 
 * @param user {String} username of the user
 * @return the playlists' name and uri in an array of objects.
 */
var playlistsOfUser = async function playlistsOfUser (user) {
	var playlists = await s.getUserPlaylists(user) ;
	playlists = playlists.body.items.map( playlist => Object({
		name: playlist.name,
		uri: playlist.uri
	})) ;
	return playlists ;
}

/**
 * Returns the first track result for a given query string.
 * 
 * @param queryTerm {String} the query string
 * @return the first track result
 */
var firstTrackResultFor = async function firstTrackResultFor (queryTerm) {
	var track = null ;
	try {
		let data = await s.searchTracks(queryTerm, {limit: 5}) ;
		track = data.body.tracks.items[0] ;
		//console.log("Found:") ;
		//console.log(`\tName: ${track.name}`) ;
		//console.log(`\tArtist: ${track.artists[0].name}`) ;
		//console.log(`\tURI: ${track.uri}`) ;
	} catch (err) {
		console.log( `ERROR: ${err}` ) ;
	}
	return track ;
}

/*
 * Fetches the first track results for an array of query terms.
 *
 * @param queries {Array} an array of query terms
 * @return the first result for each query in an array.
 */
var firstTrackResultsFor = async function firstTrackResultsFor (queries) {
	var query = null,
	    track = null,
	   tracks = [] ;

	while ( queries.length > 0 ) {
		query = queries.shift() ;
		//console.log(`>>> Searching for "${query}"...`) ;
		track = await firstTrackResultFor(query) ;
		if (track) {
			tracks.push({
				index: query.index,
				name: track.name,
				artist: track.artists[0].name,
				uri: track.uri
			}) ;
		} else {
			console.log(`WARN: no track found for ${query}`) ;
		}
	}
	return tracks ;
}

////////////////////////////////////////////////////////////////////////

if ( process.argv.length < 3) {
	printUsage() ;
	return 1 ;
}

console.log(">>> Initializing API...") ;
var promise = initSpotify() ;
console.log(">>> Loading playlist...") ;
var playlist = loadPlaylist(process.argv[2]) ;

promise.then( async function () {
	console.log('>>> Tracks loaded: '+playlist.length) ;
	console.log('>>> Fetching the first track result for each track...') ;
	var queries = playlist.map( track => `${track.artist} ${track.name}` ) ;
	var tracks = await firstTrackResultsFor(queries) ;
	//console.log(tracks) ;
	console.log('>>> Tracks found: '+tracks.length) ;
	console.log('>>> Fetching user playlists...') ;
	var playlists = await playlistsOfUser('lebroubrou') ;
	console.log('>>> Playlists fetched: ' + playlists.length) ;
	//console.log(playlists) ;
}) ;

return 0 ;
