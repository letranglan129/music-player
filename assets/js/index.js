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
const nextBtn = $('.next-btn')
const prevBtn = $('.prev-btn')
const randomBtn = $('.random-btn')
const repeatBtn = $('.repeat-btn')
const isTimeupdate = true
const timeValue = $('#time').style
const MUSIC_PLAYER = 'LeLan_Music'
const buttonTheme = $('.btn-theme')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRepeat: false,
    isTimeupdate: true,
    isDark: false,
    isRandom: false,
    config: JSON.parse(localStorage.getItem(MUSIC_PLAYER)) || {},
    setConfig(key, value) {
        this.config[key] = value
        localStorage.setItem(MUSIC_PLAYER, JSON.stringify(this.config))
    },
    loadConfig() {
        this.isRepeat = this.config.isRepeat
        this.isRandom = this.config.isRandom
        this.isDark = this.config.isDark
    },
    songs: [
        {
            name: 'Hiện Đại',
            singger: 'Khắc Việt',
            img: 'https://data.chiasenhac.com/data/cover/141/140696.jpg',
            audio: 'assets/public/audio/HienDai-KhacViet-7022864.mp3',
        },
        {
            name: 'Họ Yêu Ai Mất Rồi',
            singger: 'Doãn Hiếu, B',
            img: 'https://avatar-ex-swe.nixcdn.com/song/2021/04/13/2/d/6/a/1618312888559_640.jpg',
            audio: 'assets/public/audio/Ho Yeu Ai Mat Roi - Doan Hieu_ B_.mp3',
        },
        {
            name: 'Anh Không Tha Thứ',
            singger: 'Doãn Hiếu, B',
            img: 'https://data.chiasenhac.com/data/cover/129/128284.jpg',
            audio: 'assets/public/audio/AnhKhongThaThu-DinhDung-6684271.mp3',
        },
        {
            name: 'Hoa Nở Không Màu',
            singger: 'Hoài Lâm',
            img: 'https://i1.sndcdn.com/artworks-Y39ZYiEyfjV9nYRr-g8TwFw-t500x500.jpg',
            audio: 'assets/public/audio/HoaNoKhongMau1-HoaiLam-6281704.mp3',
        },
        {
            name: 'Anh Đếch Cần Gì Nhiều Ngoài Em',
            singger: 'Đen Vâu, Thành Đồng',
            img: 'https://i1.sndcdn.com/artworks-000440387448-u7eltk-t500x500.jpg',
            audio: 'assets/public/audio/Anh Dech Can Gi Nhieu Ngoai Em - Den_ Vu.mp3',
        },
        {
            name: 'Sóng Gió',
            singger: 'Đen Vâu, Thành Đồng',
            img: 'https://i1.sndcdn.com/artworks-000595652919-yvx8jv-t500x500.jpg',
            audio: 'assets/public/audio/Song Gio - Jack_ K-ICM.mp3',
        },
    ],
    renderPlaylist() {
        var htmls = this.songs.map(
            (song, index) =>
                `<div class="item ${
                    index === 0 ? 'active' : ''
                }" data-index="${index}">
                <span class="index">${index + 1}</span>
                <div class="property">
                    <img class="" src="${song.img || song.avatar}" alt="">
                    <div class="desc">
                        <div class="name">${song.name || song.title}</div>
                        <div class="info">
                            <span class="singger">${
                                song.singger || song.creator
                            }</span>
                        </div>
                    </div>
                </div>
            </div>`
        )
        playList.innerHTML = htmls.join('')
        var appss = document.createElement('audio')
        appss.setAttribute('id', 'audio')
        appss.setAttribute('crossorigin', 'anonymous')
        appss.setAttribute('src', '')
        document.body.append(appss)
        audio = $('audio')
    },
    handleEvent() {
        var _this = this

        // Xử lý đĩa xoay
        const cdThumbAnimate = cdThumb.animate(
            [{ transform: 'rotate(360deg)' }],
            {
                duration: 10000, // 10s
                iterations: Infinity,
            }
        )
        cdThumbAnimate.pause()

        //Thu nhỏ đĩa khi vuốt xuống PlayList (áp dụng cho mobile)
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
                _this.setColorProgress()
            }
        }
        audio.onplay = function () {
            _this.isPlaying = true
            cdThumbAnimate.play()
            playing.classList.add('playing')
        }
        audio.onpause = function () {
            cdThumbAnimate.pause()
            _this.isPlaying = false
            playing.classList.remove('playing')
        }

        // Xử lý thanh
        audio.ontimeupdate = function () {
            if (_this.isTimeupdate) {
                let progress = Math.floor(
                    (audio.currentTime / audio.duration) * 100
                )
                time.value = progress
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
                audio.play()
            } else {
                _this.nextSong()
                audio.play()
            }
        }

        // Xử lý khi nhấn prev
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong()
                audio.play()
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

        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        // Xử lý khi bật Repeat
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            this.classList.toggle('active', _this.isRandom)
        }

        var songItem = document.querySelectorAll('.item')
        songItem.forEach(song => {
            song.onclick = function () {
                app.currentIndex = Number(this.dataset.index)

                const previosItemActive = document.querySelector('.item.active')
                previosItemActive?.classList.remove('active')

                this.classList.add('active')
                app.loadCurrentSong()
                audio.play()
                _this.setColorProgress()
            }
        })
    },
    loadCurrentSong() {
        heading.textContent = this.currentSong.title || this.currentSong.name
        cdThumb.style.backgroundImage = `url(${
            this.currentSong.img ||
            this.currentSong.bgImage ||
            this.currentSong.coverImage
        })`
        audio.src = this.currentSong.audio || this.currentSong.music
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
    },
    setColorProgress() {
        timeValue.setProperty('--boxshadow', '-2000px 0 0 1995px #00fd0a')
        timeValue.setProperty('--background', '#00fd0a')
        timeValue.setProperty('--borderColor', '#00fd0a')
    },

    fetchAPI() {
        fetch(
            'https://api.apify.com/v2/key-value-stores/EJ3Ppyr2t73Ifit64/records/LATEST?fbclid=IwAR1egiaT-EGYpZypIL1OvTdWGPGgV3352-IacqZV2k-pa4TGLllEBMMMr7w'
        )
            .then(response => response.json())
            .then(data => {
                this.songs.push(...data?.songs?.top100_VN[0]?.songs)
                this.renderPlaylist()
                this.handleEvent()
                this.defineProperties()
                this.loadCurrentSong()
                this.equalizer()
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
        var audioElm = document.querySelector('#audio')
        var time = document.querySelector('#time')
        var canvasElm = document.querySelector('canvas')
        canvasElm.width = window.innerWidth
        canvasElm.height = window.innerHeight

        audioElm?.addEventListener('play', function () {
            var audioContext = new AudioContext()
            var audioContextSrc = audioContext.createMediaElementSource(audio)
            var audioAnalyser = audioContext.createAnalyser()
            canvasContext = canvasElm.getContext('2d')
            audioAnalyser.connect(audioContext.destination)
            audioContextSrc.connect(audioAnalyser)

            audioAnalyser.fftSize = 512

            var analyserFrequencyLength = audioAnalyser.frequencyBinCount

            var frequencyDataArray = new Uint8Array(analyserFrequencyLength)

            var canvasWith = canvasElm.width
            var canvasHeight = canvasElm.height

            var barWidth = (canvasWith / analyserFrequencyLength) * 2.5
            var barHeight
            var barIndex = 0

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

                for (var i = 0; i < analyserFrequencyLength; i++) {
                    barHeight = frequencyDataArray[i]
                    var rgbRed = barHeight + 25 * (i / analyserFrequencyLength)
                    var rgbGreen = 255 * (i / analyserFrequencyLength)
                    var rgbBlue = 10

                    canvasContext.beginPath()
                    canvasContext.fillStyle =
                        'rgb(' + rgbRed + ', ' + rgbGreen + ', ' + rgbBlue + ')'
                    canvasContext.fillRect(
                        barIndex,
                        canvasHeight / 2,
                        barWidth,
                        (barHeight / 2) * 1.3
                    )
                    canvasContext.fillRect(
                        barIndex,
                        canvasHeight / 2 - barHeight / 2,
                        barWidth,
                        (barHeight / 2) * 1.3
                    )

                    barIndex += barWidth + 2
                }
            }
            renderFrame()
        })
    },

    start() {
        this.loadConfig()
        this.changeTheme()
        this.fetchAPI()
    },
}

app.start()

function test() {
    var rangePercent = $('[type="range"]').value
    $('[type="range"]').addEventListener('change', function () {
        rangePercent = $('[type="range"]').value
        $('[type="range"]').style.filter =
            'hue-rotate(-' + rangePercent * 100 + 'deg)'
    })
}
