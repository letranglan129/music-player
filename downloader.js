const express = require('express')
const cloudinary = require('cloudinary')
const NCC = require('./api')
const fs = require('fs')
const cors = require('cors')
const app = express()

const PORT = process.env.PORT || 3000

app.use(
	cors({
		origin: '*',
		// origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'https://consto.serveo.net'],
	}),
)

cloudinary.config({
	cloud_name: 'dpskzzdjn',
	api_key: '145466596876425',
	api_secret: 'kUnDyhJ63s3KNTZdNoSInmvEEXQ',
})

async function saveMp3(id) {
	const data = await NCC.getTop100(id)
	data.playlist.songs.forEach((song, index) => {
		NCC.getSong(song.key).then(songDetail => {
			if (songDetail && songDetail.song.streamUrls.length > 0) {
				cloudinary.v2.uploader.upload(
					songDetail.song.streamUrls[0].streamUrl,
					{ public_id: songDetail.song.key, resource_type: 'auto', folder: 'songs' },
					function (error, result) {
						if (error) console.log(error)
						else
							console.log(
								`Tải lên thành công ${songDetail.song.key} -- ${songDetail.song.title} -- ${index}`,
							)
					},
				)
			}
		})
	})
}

app.get('/top100', async function (req, res) {
	let [resCloudinary, top100] = await Promise.all([
		cloudinary.v2.api.resources({ resource_type: 'video', max_results: 500 }),
		NCC.getTop100(req.query.id),
	])

	const ids = resCloudinary.resources.map(resource => resource.public_id.split('/')[1])
	let playList = JSON.parse(JSON.stringify(top100.playlist))
	let songs = playList.songs.filter(song => ids.includes(song.key))

	playList = {
		...playList,
		songs: songs.map(song => ({
			...song,
			audio: `https://res.cloudinary.com/dpskzzdjn/video/upload/songs/${song.key}.mp3`,
		})),
	}
	top100 = { ...top100, playlist: playList }

	return res.json(top100)
})

app.get('/getSong', async function (req, res) {
	const data = await NCC.getSong(req.query.id)
	return res.json(data)
})

app.listen(PORT, async () => {
	setTimeout(async () => {
		await saveMp3('iY1AnIsXedqE')
		await saveMp3('aY3KIEnpCywU')
		await saveMp3('kr9KYNtkzmnA')
	}, 604800000)
	console.log(`Server đang lắng nghe trên cổng ${PORT}`)
})
