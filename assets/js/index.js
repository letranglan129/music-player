const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const playing = $('#app')
const playList = $('#list')
var audio
const playBtn = $('.play-btn')
const heading = $('.name-heading')
const cdThumb = $('.cd-thumb')
const cd = $('.cd')
const time = $('#time')
const volumeSlider = $('#volume-slider')
const nextBtn = $('.next-btn')
const prevBtn = $('.prev-btn')
const randomBtn = $('.random-btn')
const repeatBtn = $('.repeat-btn')
const formSelect = $('.form-select')
const search = $('#search')
const isTimeupdate = true
const timeValue = $('#time').style
const MUSIC_PLAYER = 'LeLan_Music'
const API_URL = 'https://downloadermp3.letranglan.top'
const buttonTheme = $('.btn-theme')

const app = {
	currentIndex: 0,
	isPlaying: false,
	isRepeat: false,
	isTimeupdate: true,
	isDark: false,
	isRandom: false,
	config: JSON.parse(localStorage.getItem(MUSIC_PLAYER)) || {},
	songs: [],
	store: { full: [] },
	activeKey: '',
	cdThumbAnimate: null,
	setConfig(key, value) {
		this.config[key] = value
		localStorage.setItem(MUSIC_PLAYER, JSON.stringify(this.config))
	},
	loadConfig() {
		this.isRepeat = this.config.isRepeat
		this.isRandom = this.config.isRandom
		this.isDark = this.config.isDark

		repeatBtn.classList.toggle('active', !!this.isRepeat)
		randomBtn.classList.toggle('active', !!this.isRandom)
	},
	fmtMSS(second) {
		return (second - (second %= 60)) / 60 + (9 < second ? ':' : ':0') + second
	},
	changeTypeMusic() {
		formSelect.onchange = e => {
			if (this.store[e.target.value] && this.store[e.target.value].length > 0) {
				this.songs = this.store[e.target.value]
				this.renderPlaylist()

				this.changeActiveSong()
			}
		}
	},
	showToast(option) {
		Toastify({
			text: option?.text,
			className: option?.type || 'success',
			gravity: 'bottom',
			position: 'left',
			duration: 4000,
			close: true,
			style: {
				background: '#121212',
				color: '#fff',
			},
		}).showToast()
	},
	renderPlaylist() {
		const previosItemActive = document.querySelector('.item.active')
		console.log(previosItemActive)
		previosItemActive?.classList.remove('active')
		var htmls = this.songs.map(
			(song, index) =>
				`<div class="item" data-index="${index}" data-key="${song.key}">
                <span class="index">${index + 1}</span>
                <div class="property">
                    <img class="" src="${song.img || song.avatar}" alt="" onError="this.src='/assets/images/cd.png'">
                    <div class="desc">
                        <div class="name">${song.name || song.title}</div>
                        <div class="info">
                            <span class="singger">${song.singger || song.creator}</span>
                        </div>
                    </div>
                </div>
            </div>`,
		)
		playList.innerHTML = htmls.join('')
		const audioElement = document.createElement('audio')
		audioElement.setAttribute('id', 'audio')
		audioElement.setAttribute('crossorigin', 'anonymous')
		audioElement.setAttribute('src', '')
		document.body.append(audioElement)
		audio = $('audio')

		this.clickSongItem()
	},
	changeSearchValue() {
		search.oninput = e => {
			if (e.target.value.trim() === '') {
				this.songs = this.store[formSelect.value]
				this.renderPlaylist()

				this.changeActiveSong()
			} else {
				this.songs = app.store.full.filter(
					song =>
						song.name.toUpperCase().includes(e.target.value.toUpperCase()) ||
						song.singger.toUpperCase().includes(e.target.value.toUpperCase()),
				)
				this.renderPlaylist()
				this.changeActiveSong()
			}
		}
	},
	handleEvent() {
		var _this = this

		// Xử lý đĩa xoay
		_this.cdThumbAnimate = cdThumb.animate([{ transform: 'rotate(360deg)' }], {
			duration: 10000, // 10s
			iterations: Infinity,
		})
		_this.cdThumbAnimate.pause()

		// Thu nhỏ đĩa khi vuốt xuống PlayList (áp dụng cho mobile)
		// Lấy thông số
		window.onunload = hideCd()
		window.onresize = hideCd()

		function hideCd() {
			var cdWidth = cd.offsetWidth
			playList.onscroll = function () {
				if (window.innerWidth <= 768) {
					var scrollTop = playList.scrollTop
					var newCdWidth = cdWidth - scrollTop
					cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
					cd.style.opacity = newCdWidth / cdWidth
					if (newCdWidth < cdWidth / 2) {
						canvas.style.display = 'none'
					} else {
						canvas.style.display = 'block'
					}
				}
			}
		}

		// Xử lý khi nhấn nút play/pause
		playBtn.onclick = function () {
			if (_this.isPlaying) {
				audio.pause()
			} else {
				audio.play()
			}
		}
		audio.onplay = function () {
			_this.isPlaying = true
			_this.cdThumbAnimate.play()
			playing.classList.add('playing')
		}
		audio.onpause = function () {
			_this.cdThumbAnimate.pause()
			_this.isPlaying = false
			playing.classList.remove('playing')
		}

		audio.oncanplay = function () {
			document.querySelector('#totalTimeSpan').innerHTML = _this.fmtMSS(Math.ceil(audio.duration))
		}

		audio.onended = function () {
			if (_this.isRepeat) {
				audio.play()
			} else {
				nextBtn.click()
			}
		}

		// Xử lý thanh
		audio.ontimeupdate = function () {
			if (_this.isTimeupdate) {
				playing.style.setProperty('--seek-before-width', (audio.currentTime / audio.duration) * 100 + '%')
				time.value = (audio.currentTime / audio.duration) * 100
				document.querySelector('#currentTimeSpan').innerHTML = _this.fmtMSS(Math.ceil(audio.currentTime))
			}

			if (audio.played.length === 0) {
				app.setDefualtColorProgress()
				time.value = 0
			} else {
				app.setColorProgress()
			}

			test()
		}

		time.onmousedown = function () {
			_this.isTimeupdate = false
		}

		time.onmouseup = function () {
			_this.isTimeupdate = true
		}

		time.onchange = function () {
			const seekTime = (time.value * audio.duration) / 100
			audio.currentTime = seekTime
		}

		// Xử lý khi nhấn next
		nextBtn.onclick = function () {
			if (_this.isRandom) {
				_this.randomSong()
			} else {
				_this.nextSong()
				audio.play()
			}
		}

		// Xử lý khi nhấn prev
		prevBtn.onclick = function () {
			if (_this.isRandom) {
				_this.randomSong()
			} else {
				_this.prevSong()
				audio.play()
			}
		}

		// Xử lý khi bật Repeat
		repeatBtn.onclick = function () {
			_this.isRepeat = !_this.isRepeat
			_this.setConfig('isRepeat', _this.isRepeat)
			this.classList.toggle('active', _this.isRepeat)
		}

		// Xử lý khi bật Repeat
		randomBtn.onclick = function () {
			_this.isRandom = !_this.isRandom
			_this.setConfig('isRandom', _this.isRandom)
			this.classList.toggle('active', _this.isRandom)
		}
	},
	clickSongItem() {
		var songItem = document.querySelectorAll('.item')
		songItem.forEach(song => {
			song.onclick = function () {
				app.currentIndex = Number(this.dataset.index)

				const previosItemActive = document.querySelector('.item.active')
				previosItemActive?.classList.remove('active')

				this.classList.add('active')
				app.loadCurrentSong()

				audio.play()
			}
		})
	},

	loadCurrentSong() {
		this.activeKey = this.currentSong.key

		heading.textContent = this.currentSong.title || this.currentSong.name
		cdThumb.style.backgroundImage = `url(${
			this.currentSong.img || this.currentSong.bgImage || this.currentSong.coverImage
		}), url('./assets/images/cd.png')`

		audio.src = this.currentSong.audio
		this.changeActiveSong()
	},
	defineProperties() {
		Object.defineProperty(this, 'currentSong', {
			get: function () {
				return this.songs[this.currentIndex]
			},
		})
	},
	nextSong() {
		this.currentIndex++
		if (this.currentIndex >= this.songs.length) {
			this.currentIndex = 0
		}
		this.loadCurrentSong()
	},
	prevSong() {
		this.currentIndex--
		if (this.currentIndex <= 0) {
			this.currentIndex = this.songs.length - 1
		}
		this.loadCurrentSong()
	},
	randomSong() {
		let newIndex
		do {
			newIndex = Math.floor(Math.random() * this.songs.length)
		} while (newIndex === this.currentIndex)
		this.currentIndex = newIndex
		this.loadCurrentSong()
		audio.play()
	},
	audioDurationRangeInput() {
		time.addEventListener('input', e => {
			playing.style.setProperty('--seek-before-width', (e.target.value / e.target.max) * 100 + '%')
			time.value = (e.target.value / e.target.max) * 100
			if (audio.played.length === 0) {
				audio.play()
			}
		})
	},
	handleVolumeControl() {
		function showVolumeIcon(value) {
			if (value * 100 > 75) {
				volumeIcon.classList = 'fal fa-volume-up'
			} else if (value * 100 > 50) {
				volumeIcon.classList = 'fal fa-volume'
			} else if (value * 100 > 25) {
				volumeIcon.classList = 'fal fa-volume-down'
			} else if (value * 100 > 0) {
				volumeIcon.classList = 'fal fa-volume-off'
			} else {
				volumeIcon.classList = 'fal fa-volume-mute'
			}
		}

		let volumeIcon = document.querySelector('#volume-icon')
		document.querySelector('.volume-btn span').onclick = () => {
			audio.muted = !audio.muted

			if (audio.muted) {
				volumeIcon.classList = 'fal fa-volume-mute'
				volumeSlider.value = 0
			} else {
				volumeSlider.value = audio.volume * 100

				showVolumeIcon(volumeSlider.value)
			}
		}

		volumeSlider.addEventListener('input', e => {
			console.log(1)
			let value = e.target.value / e.target.max
			audio.volume = value

			playing.style.setProperty('--volume-before-width', value * 100 + '%')
			volumeSlider.value = value * 100

			showVolumeIcon(value)
		})
	},
	setColorProgress() {
		timeValue.setProperty('--boxshadow', '-2000px 0 0 1995px #00fd0a')
		timeValue.setProperty('--background', '#00fd0a')
		timeValue.setProperty('--borderColor', '#00fd0a')
	},
	setDefualtColorProgress() {
		timeValue.setProperty('--boxshadow', 'unset')
		timeValue.setProperty('--background', 'unset')
		timeValue.setProperty('--borderColor', 'unset')
	},
	changeActiveSong() {
		const previosItemActive = document.querySelector('.item.active')
		previosItemActive?.classList.remove('active')
		document.querySelector(`[data-key="${this.activeKey}"]`)?.classList.add('active')
	},
	fetchAPI(id, callback) {
		fetch(`${API_URL}/top100?id=${id}`)
			.then(response => response.json())
			.then(data => {
				if (data?.status === 'success') {
					const { title, songs } = data.playlist
					const newSongs = songs.map(song => ({
						name: song.title,
						singger: song.artists.map(artist => artist.name).join(', '),
						img: song.thumbnail,
						audio: song.audio,
						key: song.key,
					}))
					if (!this.store[id]) {
						this.store[id] = newSongs
					}

					this.store['full'] = [...this.store['full'], ...newSongs]

					if (callback) {
						callback(newSongs)
					}
				}
			})
	},

	changeTheme() {
		if (this.isDark) {
			playing.classList.add('dark')
		} else {
			playing.classList.remove('dark')
		}

		const _this = this
		buttonTheme.addEventListener('click', () => {
			playing.classList.toggle('dark')
			_this.setConfig('isDark', playing.classList.contains('dark'))
		})
	},

	equalizer() {
		let audioElm = document.querySelector('#audio')
		let time = document.querySelector('#time')
		let canvasElm = document.querySelector('canvas')
		canvasElm.width = window.innerWidth
		canvasElm.height = window.innerHeight

		audioElm?.addEventListener('play', function () {
			let audioContext = new AudioContext()
			let audioContextSrc = audioContext.createMediaElementSource(audio)
			let audioAnalyser = audioContext.createAnalyser()
			canvasContext = canvasElm.getContext('2d')
			audioAnalyser.connect(audioContext.destination)
			audioContextSrc.connect(audioAnalyser)

			audioAnalyser.fftSize = 1024

			let analyserFrequencyLength = audioAnalyser.frequencyBinCount

			let frequencyDataArray = new Uint8Array(analyserFrequencyLength)

			let canvasWith = canvasElm.width
			let canvasHeight = canvasElm.height

			let barWidth = (canvasWith / analyserFrequencyLength) * 2
			let barHeight
			let barIndex = 0

			function renderFrame() {
				window.requestAnimationFrame(renderFrame)

				barIndex = 0

				audioAnalyser.getByteFrequencyData(frequencyDataArray)

				if (document.querySelector('#app.dark')) {
					canvasContext.fillStyle = '#000'
				} else {
					canvasContext.fillStyle = '#fff'
				}

				canvasContext.fillRect(0, 0, canvasWith, canvasHeight)

				for (let i = 0; i < analyserFrequencyLength; i++) {
					barHeight = frequencyDataArray[i] * 2
					let rgbRed = barHeight + 25 * (i / analyserFrequencyLength)
					let rgbGreen = 255 * (i / analyserFrequencyLength)
					let rgbBlue = 10

					canvasContext.beginPath()
					canvasContext.fillStyle = 'rgb(' + rgbRed + ', ' + rgbGreen + ', ' + rgbBlue + ')'
					canvasContext.fillRect(barIndex, canvasHeight, barWidth, barHeight * 2)
					canvasContext.fillRect(barIndex, canvasHeight - barHeight, barWidth, barHeight * 2)

					barIndex += barWidth + 2
				}
			}
			renderFrame()
		})
	},

	start() {
		this.loadConfig()
		this.changeTheme()
		Array.from(formSelect.options).forEach((option, index) => {
			if (index === 0) {
				this.fetchAPI(option.value, newSongs => {
					this.songs = newSongs
					this.renderPlaylist()
					this.handleEvent()
					this.loadCurrentSong()
					this.equalizer()
				})
			} else {
				this.fetchAPI(option.value)
			}
		})

		this.defineProperties()
		this.changeTypeMusic()
		this.changeSearchValue()
		this.audioDurationRangeInput()
		this.handleVolumeControl()
	},
}

app.start()

function test() {
	$('[type="range"]').addEventListener('change', function () {
		let rangePercent = $('[type="range"]').value
		$('[type="range"]').style.filter = 'hue-rotate(-' + (rangePercent * 100) / 30 + 'deg)'
	})
}
