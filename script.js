// Hindi songs data
const songs = [
    {
      id: 1,
      title: "Tum Hi Ho - Aashiqui 2",
      artist: "Arijit Singh",
      youtubeId: "IJq0yyWug1k",
      thumbnail: "https://i.ytimg.com/vi/IJq0yyWug1k/maxresdefault.jpg",
      duration: 262
    },
    {
      id: 2,
      title: "Kabira - Yeh Jawaani Hai Deewani",
      artist: "Arijit Singh, Tochi Raina",
      youtubeId: "jHNNMj5bNQw",
      thumbnail: "https://i.ytimg.com/vi/jHNNMj5bNQw/maxresdefault.jpg",
      duration: 224
    },
    {
      id: 3,
      title: "Kesariya - Brahmastra",
      artist: "Arijit Singh",
      youtubeId: "BddP6PYo2gs",
      thumbnail: "https://i.ytimg.com/vi/BddP6PYo2gs/maxresdefault.jpg",
      duration: 268
    },
    {
      id: 4,
      title: "Raataan Lambiyan - Shershaah",
      artist: "Jubin Nautiyal, Asees Kaur",
      youtubeId: "gvyUuxdRdR4",
      thumbnail: "https://i.ytimg.com/vi/gvyUuxdRdR4/maxresdefault.jpg",
      duration: 230
    },
    {
      id: 5,
      title: "Channa Mereya - Ae Dil Hai Mushkil",
      artist: "Arijit Singh",
      youtubeId: "284Ov7ysmfA",
      thumbnail: "https://i.ytimg.com/vi/284Ov7ysmfA/maxresdefault.jpg",
      duration: 289
    },
    {
      id: 6,
      title: "Apna Bana Le - Bhediya",
      artist: "Arijit Singh, Sachin-Jigar",
      youtubeId: "vgm4YbHpQnQ",
      thumbnail: "https://i.ytimg.com/vi/vgm4YbHpQnQ/maxresdefault.jpg",
      duration: 203
    },
    {
      id: 7,
      title: "Agar Tum Saath Ho - Tamasha",
      artist: "Arijit Singh, Alka Yagnik",
      youtubeId: "sK7riqg2mr4",
      thumbnail: "https://i.ytimg.com/vi/sK7riqg2mr4/maxresdefault.jpg",
      duration: 341
    },
    {
      id: 8,
      title: "Shayad - Love Aaj Kal",
      artist: "Arijit Singh",
      youtubeId: "MJyKN-8UncM",
      thumbnail: "https://i.ytimg.com/vi/MJyKN-8UncM/maxresdefault.jpg",
      duration: 248
    }
  ];
  
  // Player variables
  let playlist = [...songs];
  let currentSongIndex = 0;
  let isPlaying = false;
  let player;
  let volume = 75;
  let isMuted = false;
  let isDarkMode = true;
  
  // DOM elements
  const albumCoverEl = document.getElementById('album-cover');
  const songTitleEl = document.getElementById('song-title');
  const songArtistEl = document.getElementById('song-artist');
  const playBtn = document.getElementById('play-btn');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const muteBtn = document.getElementById('mute-btn');
  const volumeControl = document.getElementById('volume-control');
  const volumeProgress = document.querySelector('.volume-progress');
  const seekSlider = document.getElementById('seek-slider');
  const progressBar = document.querySelector('.progress');
  const currentTimeEl = document.getElementById('current-time');
  const durationEl = document.getElementById('duration');
  const playlistEl = document.getElementById('playlist');
  const shuffleBtn = document.getElementById('shuffle-btn');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  
  // Initialize YouTube API
  function loadYouTubeAPI() {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }
  
  // Create YouTube player when API is ready
  window.onYouTubeIframeAPIReady = function() {
    player = new YT.Player('youtube-player', {
      height: '0',
      width: '0',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        showinfo: 0
      },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange,
        'onError': onPlayerError
      }
    });
  };
  
  // Player is ready
  function onPlayerReady(event) {
    // Load first song
    loadSong(currentSongIndex);
    
    // Set volume
    updateVolume(volume);
    
    // Start progress tracking
    setInterval(updateProgress, 1000);
  }
  
  // Player state change handler
  function onPlayerStateChange(event) {
    // YouTube states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    if (event.data === YT.PlayerState.PLAYING) {
      isPlaying = true;
      updatePlayButton();
    } else if (event.data === YT.PlayerState.PAUSED) {
      isPlaying = false;
      updatePlayButton();
    } else if (event.data === YT.PlayerState.ENDED) {
      nextSong();
    }
  }
  
  // Player error handler
  function onPlayerError(event) {
    console.error('YouTube Player Error:', event.data);
    // Try to play next song if there's an error
    nextSong();
  }
  
  // Load and play a song
  function loadSong(index) {
    const song = playlist[index];
    
    // Update UI
    albumCoverEl.src = song.thumbnail;
    albumCoverEl.alt = `${song.title} Album Art`;
    songTitleEl.textContent = song.title;
    songArtistEl.textContent = song.artist;
    
    // Update playlist active state
    updatePlaylistActive();
    
    // Load YouTube video
    if (player && player.loadVideoById) {
      player.loadVideoById(song.youtubeId);
    }
  }
  
  // Format time from seconds to MM:SS
  function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  // Update progress bar and time display
  function updateProgress() {
    if (player && player.getCurrentTime && player.getDuration) {
      try {
        const currentTime = player.getCurrentTime() || 0;
        const duration = player.getDuration() || 0;
        const progressPercent = (currentTime / duration) * 100;
        
        // Update progress bar
        progressBar.style.width = `${progressPercent}%`;
        
        // Update time displays
        currentTimeEl.textContent = formatTime(currentTime);
        durationEl.textContent = formatTime(duration);
        
        // Update slider value without triggering the change event
        seekSlider.value = progressPercent;
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }
  }
  
  // Play/pause toggle
  function togglePlay() {
    if (player) {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    }
  }
  
  // Play next song
  function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    loadSong(currentSongIndex);
  }
  
  // Play previous song
  function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    loadSong(currentSongIndex);
  }
  
  // Update play/pause button icon
  function updatePlayButton() {
    playBtn.innerHTML = isPlaying ? 
      '<i class="fas fa-pause"></i>' : 
      '<i class="fas fa-play"></i>';
  }
  
  // Update volume display and player volume
  function updateVolume(value) {
    volume = value;
    
    // Update slider and progress
    volumeControl.value = volume;
    volumeProgress.style.width = `${volume}%`;
    
    // Update volume icon
    updateVolumeIcon();
    
    // Set player volume
    if (player && player.setVolume) {
      player.setVolume(volume);
    }
  }
  
  // Update volume icon based on volume level
  function updateVolumeIcon() {
    let icon;
    
    if (isMuted || volume === 0) {
      icon = '<i class="fas fa-volume-mute"></i>';
    } else if (volume < 25) {
      icon = '<i class="fas fa-volume-off"></i>';
    } else if (volume < 75) {
      icon = '<i class="fas fa-volume-down"></i>';
    } else {
      icon = '<i class="fas fa-volume-up"></i>';
    }
    
    muteBtn.innerHTML = icon;
  }
  
  // Toggle mute
  function toggleMute() {
    if (player) {
      if (isMuted) {
        player.unMute();
        updateVolume(volume > 0 ? volume : 75);
      } else {
        player.mute();
        volumeProgress.style.width = '0%';
      }
      
      isMuted = !isMuted;
      updateVolumeIcon();
    }
  }
  
  // Seek to a specific position
  function seekTo(percent) {
    if (player && player.getDuration && player.seekTo) {
      const duration = player.getDuration();
      const seekTime = (percent / 100) * duration;
      player.seekTo(seekTime, true);
    }
  }
  
  // Render the playlist
  function renderPlaylist() {
    playlistEl.innerHTML = '';
    
    playlist.forEach((song, index) => {
      const li = document.createElement('li');
      li.className = `playlist-item ${index === currentSongIndex ? 'active' : ''}`;
      li.dataset.index = index;
      
      li.innerHTML = `
        <div class="playlist-item-thumbnail">
          <img src="${song.thumbnail.replace('maxresdefault', 'default')}" alt="${song.title}">
        </div>
        <div class="playlist-item-info">
          <div class="playlist-item-title">${song.title}</div>
          <div class="playlist-item-artist">${song.artist}</div>
        </div>
        <div class="playlist-item-duration">${formatTime(song.duration)}</div>
      `;
      
      li.addEventListener('click', () => {
        currentSongIndex = index;
        loadSong(currentSongIndex);
        player.playVideo();
      });
      
      playlistEl.appendChild(li);
    });
  }
  
  // Update active state in playlist
  function updatePlaylistActive() {
    document.querySelectorAll('.playlist-item').forEach((item, index) => {
      if (index === currentSongIndex) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }
  
  // Shuffle the playlist
  function shufflePlaylist() {
    const currentSong = playlist[currentSongIndex];
    
    // Fisher-Yates shuffle algorithm
    for (let i = playlist.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playlist[i], playlist[j]] = [playlist[j], playlist[i]];
    }
    
    // Find the new index of the current song
    currentSongIndex = playlist.findIndex(song => song.id === currentSong.id);
    
    // Re-render the playlist
    renderPlaylist();
  }
  
  // Toggle theme
  function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('light-mode', !isDarkMode);
    
    themeToggleBtn.innerHTML = isDarkMode ? 
      '<i class="fas fa-sun"></i>' : 
      '<i class="fas fa-moon"></i>';
  }
  
  // Event listeners
  function setupEventListeners() {
    // Play/pause button
    playBtn.addEventListener('click', togglePlay);
    
    // Next/previous buttons
    nextBtn.addEventListener('click', nextSong);
    prevBtn.addEventListener('click', prevSong);
    
    // Volume control
    volumeControl.addEventListener('input', (e) => {
      updateVolume(e.target.value);
      if (isMuted && e.target.value > 0) {
        toggleMute();
      }
    });
    
    // Mute button
    muteBtn.addEventListener('click', toggleMute);
    
    // Seek slider
    seekSlider.addEventListener('input', (e) => {
      const percent = e.target.value;
      progressBar.style.width = `${percent}%`;
    });
    
    seekSlider.addEventListener('change', (e) => {
      seekTo(e.target.value);
    });
    
    // Shuffle button
    shuffleBtn.addEventListener('click', shufflePlaylist);
    
    // Theme toggle
    themeToggleBtn.addEventListener('click', toggleTheme);
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowright':
          nextSong();
          break;
        case 'arrowleft':
          prevSong();
          break;
        case 'm':
          toggleMute();
          break;
      }
    });
  }
  
  // Initialize the player
  function init() {
    // Load YouTube API
    loadYouTubeAPI();
    
    // Render initial playlist
    renderPlaylist();
    
    // Setup event listeners
    setupEventListeners();
    
    // Set initial theme
    document.body.classList.toggle('light-mode', !isDarkMode);
  }
  
  // Start the application
  init();