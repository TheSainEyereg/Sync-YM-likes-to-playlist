const {YMApi} = require("ym-api");
const {YMAuth, targetPlaylist} = require("./config.json");

const ymApi = new YMApi();

let lastRevision = 0;
async function waitForRevision(action) {
	try {
		return await action(lastRevision+1);
	} catch (e) {
		if (e.name === "wrong-revision") {
			lastRevision = parseInt(e.message.split("actual revision: ")[1])
			return action(lastRevision);
		} else throw e;
	}
}

(async () => {
	await ymApi.init({uid: YMAuth.uid, access_token: YMAuth.access_token});
	const likedList = await ymApi.getPlaylist("3");
	const targetList = await ymApi.getPlaylist(""+targetPlaylist);
	
	const likedTracks = likedList.tracks.map(t => t.track);
	const targetTracks = targetList.tracks.map(t => t.track);


	console.log("Checking for extra tracks...");
	const toRemove = Array.from(targetTracks)
		.filter(tt => !likedTracks.find(lt => (lt.id === tt.id) && (!lt.available || (lt.albums[0].id === tt.albums[0].id)))); // lt -- LikedTrack; tt -- TargetTrack
	
	let removedCount = 0;
	for (const track of toRemove) {
		try {
			await waitForRevision(r => ymApi.removeTracksFromPlaylist(
				""+targetPlaylist,
				//track.available ? [{id: track.id, albumId: track.albums[0].id}] : undefined,
				undefined, // You don't have to specify the track ID
				r,
				{from: targetTracks.indexOf(track)-removedCount, to: targetTracks.indexOf(track)+1-removedCount}
			));
			removedCount++
		} catch (e) {
			console.log(`Can't delete track "${track.artists?.map(a => a.name).join(", ")} - ${track.title}" on position ${targetTracks.indexOf(track)-removedCount} (${e.name})`)
		}
	}
	console.log(`Removed ${toRemove.length} track${toRemove.length == 1 ? "s" : ""}`);

	
	console.log("Checking for missing tracks...");
	const toAddArray = Array.from(likedTracks)
		.filter(lt => !targetTracks.find(tt => (tt.id === lt.id) && (!tt.available || (tt.albums[0].id === lt.albums[0].id))))
		.map(t => ({id: t.id, albumId: t.available ? t.albums[0].id : undefined})); // {"id":"50501070","albumId":6977259}
	await waitForRevision(r => ymApi.addTracksToPlaylist(""+targetPlaylist, toAddArray, r));
	console.log(`Added ${toAddArray.length} track${toAddArray.length == 1 ? "s" : ""}`);


	console.log(`All done!`);
})()