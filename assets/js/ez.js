setTimeout(() => {
    // var a = new AudioContext();
    // var audioContextSrc = a.createMediaElementSource(audio);
    // console.log(audioContextSrc);



    // Bắt đầu thực hiện khi DOM được load hoàn thành
    // Lấy file, audio và canvas element
    var audioElm = document.querySelector("#audio");
    var time = document.querySelector("#time");
    var canvasElm = document.querySelector("canvas");
    canvasElm.width = window.innerWidth;
    canvasElm.height = window.innerHeight;

    audioElm.addEventListener('play', function() {
            // Tiếp, khởi tạo AudioContext
            var audioContext = new AudioContext();
            // Khởi tạo AudioContext source
            var audioContextSrc = audioContext.createMediaElementSource(audio);
            // Khởi tạo Analyser
            var audioAnalyser = audioContext.createAnalyser();
            // Khởi tạo 2D canvas
            canvasContext = canvasElm.getContext("2d");;
            // Kết nối AudioContext source với Analyser
            audioContextSrc.connect(audioAnalyser);
            // Kết nối Analyser với AudioDestinationNode
            audioAnalyser.connect(audioContext.destination);

            // Gán FFT size là 256 cho Analyser
            audioAnalyser.fftSize = 512;

            // Lấy dữ liệu tần số từ Analyser
            var analyserFrequencyLength = audioAnalyser.frequencyBinCount;

            // Khởi tạo một mảng số nguyên dương 8-bit có số lượng phần tử bằng analyserFrequencyLength
            var frequencyDataArray = new Uint8Array(analyserFrequencyLength);

            // Lấy width và height của canvas
            var canvasWith = canvasElm.width;
            var canvasHeight = canvasElm.height;

            // Tính toán barWidth và barHeight
            var barWidth = (canvasWith / analyserFrequencyLength) * 2.5;
            var barHeight;
            var barIndex = 0;

            function renderFrame() {
                // Thông báo với trình duyệt rằng chúng ta đang chuẩn bị thực hiện một animation với method là như này.
                window.requestAnimationFrame(renderFrame);

                // Reset lại barIndex trở về 0
                barIndex = 0;

                // Điền dữ liệu tần số vào mảng
                audioAnalyser.getByteFrequencyData(frequencyDataArray);

                // Vẽ một hình chữ nhật với nền màu đen
                if (document.querySelector('#app.dark')) {
                    canvasContext.fillStyle = "#000";
                } else {
                    canvasContext.fillStyle = "#fff";
                }

                canvasContext.fillRect(0, 0, canvasWith, canvasHeight);

                // Chạy lần lượt từ 0 đến hết dữ liệu tần số của Analyser
                for (var i = 0; i < analyserFrequencyLength; i++) {
                    barHeight = frequencyDataArray[i];
                    // Tạo màu cho thanh bar
                    var rgbRed = barHeight + (25 * (i / analyserFrequencyLength));
                    var rgbGreen = 255 * (i / analyserFrequencyLength);
                    var rgbBlue = 10;

                    // Điền màu và vẽ bar
                    canvasContext.beginPath();
                    canvasContext.fillStyle = "rgb(" + rgbRed + ", " + rgbGreen + ", " + rgbBlue + ")";
                    canvasContext.fillRect(barIndex, canvasHeight / 2, barWidth, barHeight / 2 * 1.3);
                    canvasContext.fillRect(barIndex, canvasHeight / 2 - barHeight / 2, barWidth, barHeight / 2 * 1.3);


                    // canvasContext.fillRect(barIndex, (canvasHeight - barHeight), barWidth, barHeight);

                    barIndex += (barWidth + 2);
                }
            }
            renderFrame();
        })
        // Gọi method để render vào canvas
}, 5001);