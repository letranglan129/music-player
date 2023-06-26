const sha512 = require('js-sha512')
const axios = require('axios')

const PROXY_URL = 'https://nct.napdev.workers.dev/'
const API_URL = 'https://beta.nhaccuatui.com/api'
const API_KEY = 'e3afd4b6c89147258a56a641af16cc79'
const SECRET_KEY = '6847f1a4fc2f4eb6ab13f9084e082ef4'

const client = axios.create({
	baseURL: typeof window === 'object' ? PROXY_URL + API_URL : API_URL,
	params: {
		a: API_KEY,
	},
})

client.interceptors.request.use(config => {
	const now = String(Date.now())
	const hash = sha512.hmac(SECRET_KEY, now)
	config.params.t = now
	config.params.s = hash
	return config
})

client.interceptors.response.use(res => res.data)

const joinQueryString = obj =>
	Object.entries(obj)
		.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
		.join('&')

const getSong = songId => client.post('media/info', joinQueryString({ key: songId, type: 'song' }))

const getPlaylistDetail = playlistId =>
	client.post('media/info', joinQueryString({ key: playlistId, type: 'playlist' }))

const getLyric = songId => client.post('lyric', joinQueryString({ key: songId, type: 'song' }))

const getVideoDetail = videoId => client.post('media/info', joinQueryString({ key: videoId, type: 'video' }))

const getTopics = () => client.post('topic')

const getTopicDetail = topicId => client.post('topic/detail', joinQueryString({ key: topicId }))

const getTop100 = top100Id => client.post('top100', joinQueryString({ key: top100Id }))

const searchByKeyword = keyword => client.post('search/all', joinQueryString({ key: keyword }))

const getTopKeyword = () => client.post('search/topkeyword')

const getTrendingArtists = () => client.post('ranking/artist', joinQueryString({ size: 10 }))

module.exports = {
	getSong,
	getPlaylistDetail,
	getLyric,
	getVideoDetail,
	getTopics,
	getTopicDetail,
	getTop100,
	searchByKeyword,
	getTopKeyword,
	getTrendingArtists,
}
