// Import Howler (commented as we're using CDN in HTML)
// import {Howl, Howler} from 'howler';
// or for CommonJS:
// const {Howl, Howler} = require('howler');

document.addEventListener('DOMContentLoaded', function() {
    // Current playing sound
    let currentSound = null;
    
    // Get DOM elements
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const songItems = document.querySelectorAll('#songList li');
    
    // Initialize Howler
    Howler.volume(volumeSlider.value);
    
    // Event listeners
    playBtn.addEventListener('click', playAudio);
    pauseBtn.addEventListener('click', pauseAudio);
    stopBtn.addEventListener('click', stopAudio);
    volumeSlider.addEventListener('input', changeVolume);
    
    // Add click event to each song in playlist
    songItems.forEach(item => {
        item.addEventListener('click', function() {
            const songSrc = this.getAttribute('data-src');
            playSong(songSrc);
        });
    });
    
    // Functions
    function playAudio() {
        if (currentSound && !currentSound.playing()) {
            currentSound.play();
        }
    }
    
    function pauseAudio() {
        if (currentSound && currentSound.playing()) {
            currentSound.pause();
        }
    }
    
    function stopAudio() {
        if (currentSound) {
            currentSound.stop();
        }
    }
    
    function changeVolume() {
        Howler.volume(volumeSlider.value);
    }
    
    function playSong(songSrc) {
        // Stop current sound if playing
        if (currentSound) {
            currentSound.stop();
        }
        
        // Create new Howl instance
        currentSound = new Howl({
            src: [songSrc],
            html5: true,
            onplay: function() {
                console.log('Playing: ' + songSrc);
            },
            onend: function() {
                console.log('Finished: ' + songSrc);
            },
            onerror: function() {
                console.log('Error playing: ' + songSrc);
            }
        });
        
        // Play the sound
        currentSound.play();
    }
});
