// Video and lazy loading handler
class MediaHandler {
    constructor() {
        this.init();
    }

    init() {
        this.initLazyLoading();
        this.initVideoPreview();
        this.initCategoryVideos();
        this.initHeroVideo();
    }

    initLazyLoading() {
        if ('IntersectionObserver' in window) {
            // Lazy load images
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px'
            });

            document.querySelectorAll('img.lazy').forEach(img => {
                imageObserver.observe(img);
            });

            // Lazy load videos
            const videoObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const video = entry.target;
                        this.loadVideo(video);
                        observer.unobserve(video);
                    }
                });
            }, {
                rootMargin: '50px 0px'
            });

            document.querySelectorAll('video[data-src]').forEach(video => {
                videoObserver.observe(video);
            });
        } else {
            // Fallback for browsers that don't support IntersectionObserver
            this.loadAllMedia();
        }
    }

    loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;

        // Create a loading spinner
        const spinner = this.createLoadingSpinner();
        img.parentNode.insertBefore(spinner, img.nextSibling);

        // Load the image
        const tempImg = new Image();
        tempImg.onload = () => {
            img.src = src;
            img.classList.remove('lazy');
            img.classList.add('loaded');
            spinner.remove();
        };
        tempImg.src = src;
    }

    loadVideo(video) {
        const src = video.dataset.src;
        if (!src) return;

        // Create a loading spinner
        const spinner = this.createLoadingSpinner();
        video.parentNode.insertBefore(spinner, video.nextSibling);

        // Load the video
        video.src = src;
        video.load();

        video.addEventListener('canplay', () => {
            spinner.remove();
            if (video.classList.contains('category-video')) {
                video.play().catch(() => {
                    // Autoplay failed, show play button
                    this.createPlayButton(video);
                });
            }
        });
    }

    loadAllMedia() {
        // Load all images
        document.querySelectorAll('img.lazy').forEach(img => {
            this.loadImage(img);
        });

        // Load all videos
        document.querySelectorAll('video[data-src]').forEach(video => {
            this.loadVideo(video);
        });
    }

    createLoadingSpinner() {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        return spinner;
    }

    createPlayButton(video) {
        const playButton = document.createElement('button');
        playButton.className = 'play-button';
        playButton.innerHTML = '<i class="fas fa-play"></i>';
        video.parentNode.appendChild(playButton);

        playButton.addEventListener('click', () => {
            video.play();
            playButton.remove();
        });
    }

    initVideoPreview() {
        document.querySelectorAll('.video-preview').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const videoSrc = button.dataset.video;
                this.showVideoModal(videoSrc);
            });
        });
    }

    showVideoModal(videoSrc) {
        const modal = document.createElement('div');
        modal.className = 'video-modal';
        modal.innerHTML = `
            <div class="video-modal-content">
                <span class="close-modal">&times;</span>
                <video controls>
                    <source src="${videoSrc}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                <div class="video-controls">
                    <button class="play-pause"><i class="fas fa-play"></i></button>
                    <button class="mute-unmute"><i class="fas fa-volume-up"></i></button>
                    <div class="progress-bar">
                        <div class="progress"></div>
                    </div>
                    <button class="fullscreen"><i class="fas fa-expand"></i></button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        const video = modal.querySelector('video');
        
        // Initialize custom video controls
        this.initVideoControls(video, modal);

        // Show modal with animation
        setTimeout(() => modal.classList.add('show'), 10);

        // Handle close button
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => {
                video.pause();
                modal.remove();
            }, 300);
        });

        // Start playing
        video.play().catch(() => {
            // Autoplay failed, show play button
            this.createPlayButton(video);
        });
    }

    initVideoControls(video, modal) {
        const controls = modal.querySelector('.video-controls');
        const playPauseBtn = controls.querySelector('.play-pause');
        const muteBtn = controls.querySelector('.mute-unmute');
        const progress = controls.querySelector('.progress');
        const progressBar = controls.querySelector('.progress-bar');
        const fullscreenBtn = controls.querySelector('.fullscreen');

        // Play/Pause
        playPauseBtn.addEventListener('click', () => {
            if (video.paused) {
                video.play();
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            } else {
                video.pause();
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            }
        });

        // Mute/Unmute
        muteBtn.addEventListener('click', () => {
            video.muted = !video.muted;
            muteBtn.innerHTML = video.muted ? 
                '<i class="fas fa-volume-mute"></i>' : 
                '<i class="fas fa-volume-up"></i>';
        });

        // Progress bar
        video.addEventListener('timeupdate', () => {
            const percent = (video.currentTime / video.duration) * 100;
            progress.style.width = `${percent}%`;
        });

        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            video.currentTime = percent * video.duration;
        });

        // Fullscreen
        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                modal.querySelector('.video-modal-content').requestFullscreen();
                fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
            } else {
                document.exitFullscreen();
                fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
            }
        });

        // Update play/pause button on video events
        video.addEventListener('play', () => {
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        });

        video.addEventListener('pause', () => {
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        });
    }

    initCategoryVideos() {
        document.querySelectorAll('.category-card').forEach(card => {
            const video = card.querySelector('video');
            if (!video) return;

            // Play video on hover
            card.addEventListener('mouseenter', () => {
                video.play().catch(() => {
                    // Autoplay failed, show play button
                    this.createPlayButton(video);
                });
            });

            card.addEventListener('mouseleave', () => {
                video.pause();
                video.currentTime = 0;
            });
        });
    }

    initHeroVideo() {
        const heroVideo = document.querySelector('.hero-video');
        if (!heroVideo) return;

        // Add mute/unmute button
        const muteBtn = document.createElement('button');
        muteBtn.className = 'hero-mute-btn';
        muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        heroVideo.parentNode.appendChild(muteBtn);

        muteBtn.addEventListener('click', () => {
            heroVideo.muted = !heroVideo.muted;
            muteBtn.innerHTML = heroVideo.muted ? 
                '<i class="fas fa-volume-mute"></i>' : 
                '<i class="fas fa-volume-up"></i>';
        });

        // Optimize video playback
        heroVideo.play().catch(() => {
            // Autoplay failed, show play button
            this.createPlayButton(heroVideo);
        });
    }
}

// Initialize media handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const mediaHandler = new MediaHandler();
});
