// EduVexa Independent Video Background Script
// This file safely injects cinematic video without altering existing CSS/JS.

document.addEventListener('DOMContentLoaded', () => {
    const heroSection = document.getElementById('hero-section') || document.querySelector('.hero');
    if (!heroSection) return;

    // 1. Inject Inline CSS safely for Video
    const styleTag = document.createElement('style');
    styleTag.textContent = `
        .hero {
            position: relative !important;
            overflow: hidden !important;
        }
        .hero-content {
            position: relative !important;
            z-index: 2 !important;
        }
        .hero-video-bg {
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            min-width: 100% !important;
            min-height: 100% !important;
            width: auto !important;
            height: auto !important;
            z-index: 1 !important;
            transform: translate(-50%, -50%) !important;
            object-fit: cover !important;
            opacity: 0.45 !important;
            pointer-events: none !important;
        }
    `;
    document.head.appendChild(styleTag);

    // 2. Create Video Element
    const video = document.createElement('video');
    video.className = 'hero-video-bg';
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('disablepictureinpicture', '');
    video.poster = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600&auto=format&fit=crop';

    const source = document.createElement('source');
    source.src = 'https://cdn.coverr.co/videos/coverr-students-walking-in-a-university-5332/1080p.mp4';
    source.type = 'video/mp4';

    video.appendChild(source);

    // 3. Prepend inside Hero Section
    heroSection.insertBefore(video, heroSection.firstChild);
});
