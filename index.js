const {YMApi} = require("ym-api");
const {YMAuth, targetPlaylist} = require("./config.json");

const ymApi = new YMApi();

async function waitForRevision(action) {
	try {
		return await action(1);
	} catch (e) {
		if (e.name === "wrong-revision") {
			return action(parseInt(e.message.split("actual revision: ")[1]));
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
		.filter(tt => !likedTracks.find(lt => lt.available && (lt.id === tt.id) && (lt.albums[0].id === tt.albums[0].id))); // lt -- LikedTrack; tt -- TargetTrack
	let removedCount = 0;
	for (const track of toRemove) {
		if (!track.available) continue;

		await waitForRevision(r => ymApi.removeTracksFromPlaylist(
			""+targetPlaylist,
			[{id: track.id, albumId: track.albums[0].id}],
			r,
			{from: targetTracks.indexOf(track)-removedCount, to: targetTracks.indexOf(track)+1-removedCount}
		));
		removedCount++
	}
	console.log(`Removed ${toRemove.length} track${toRemove.length == 1 ? "s" : ""}`);

	
	console.log("Checking for missing tracks...");
	const toAddArray = Array.from(likedTracks)
		.filter(lt => lt.available && !targetTracks.find(tt => (tt.id === lt.id) && (tt.albums[0].id === lt.albums[0].id)))
		.map(t => ({id: t.id, albumId: t.albums[0].id})); // {"id":"50501070","albumId":6977259}
	await waitForRevision(r => ymApi.addTracksToPlaylist(""+targetPlaylist, toAddArray, r));
	console.log(`Added ${toAddArray.length} track${toAddArray.length == 1 ? "s" : ""}`);


	console.log(`All done!`);
})()