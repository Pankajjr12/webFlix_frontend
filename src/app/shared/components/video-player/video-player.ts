import {
  Component,
  ElementRef,
  Inject,
  ViewChild,
  OnInit,
  OnDestroy
} from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UtilityService } from '../../services/utility-service';
import { MediaService } from '../../services/media-service';

@Component({
  selector: 'app-video-player',
  standalone: false,
  templateUrl: './video-player.html',
  styleUrls: ['./video-player.css']
})
export class VideoPlayer implements OnInit, OnDestroy {

  @ViewChild('videoPlayer')
  videoElement!: ElementRef<HTMLVideoElement>;

  isPlaying = false;
  currentTime = 0;
  duration = 0;

  volume = 1;
  isMuted = false;

  isFullScreen = false;
  showControls = true;

  controlsTimeout: any;

  private boundFullScreenHandler!: () => void;
  private boundKeydownHandler!: (event: KeyboardEvent) => void;

  private playPromise: Promise<void> | null = null;

  authenticatedVideoUrl: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<VideoPlayer>,
    @Inject(MAT_DIALOG_DATA) public video: any,
    public utilityService: UtilityService,
    private mediaService: MediaService
  ) {

    this.boundFullScreenHandler = this.onFullscreenChange.bind(this);
    this.boundKeydownHandler = this.onKeyDown.bind(this);

    this.loadAuthenticatedVideo();
  }

  ngOnInit(): void {

    this.startControlsTimer();

    document.addEventListener(
      'fullscreenchange',
      this.boundFullScreenHandler
    );

    document.addEventListener(
      'keydown',
      this.boundKeydownHandler
    );

    this.dialogRef.beforeClosed().subscribe(() => {
      this.cleanup();
    });
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  // ---------------- VIDEO LOAD ----------------

  private loadAuthenticatedVideo(): void {

    if (!this.video?.src) {
      console.error("Video src missing");
      return;
    }

    this.authenticatedVideoUrl =
      this.mediaService.getMediaUrl(this.video.src, 'video');

    console.log("VIDEO URL:", this.authenticatedVideoUrl);
  }

  // ---------------- CLEANUP ----------------

  private cleanup(): void {

    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout);
      this.controlsTimeout = null;
    }

    document.removeEventListener(
      'fullscreenchange',
      this.boundFullScreenHandler
    );

    document.removeEventListener(
      'keydown',
      this.boundKeydownHandler
    );

    const video = this.videoElement?.nativeElement;

    if (video) {

      try {
        video.pause();
      } catch {}

      video.currentTime = 0;
      video.removeAttribute('src');
      video.load();

      this.isPlaying = false;
    }

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }

  // ---------------- KEYBOARD CONTROLS ----------------

  onKeyDown(event: KeyboardEvent): void {

    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) return;

    switch (event.key.toLowerCase()) {

      case ' ':
      case 'k':
        event.preventDefault();
        this.togglePlay();
        break;

      case 'arrowleft':
        event.preventDefault();
        this.seekBackward();
        break;

      case 'arrowright':
        event.preventDefault();
        this.seekForward();
        break;

      case 'arrowup':
        event.preventDefault();
        this.increaseVolume();
        break;

      case 'arrowdown':
        event.preventDefault();
        this.decreaseVolume();
        break;

      case 'm':
        event.preventDefault();
        this.toggleMute();
        break;

      case 'f':
        event.preventDefault();
        this.toggleFullScreen();
        break;

      case 'escape':
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          this.closePlayer();
        }
        break;
    }
  }

  // ---------------- PLAY CONTROLS ----------------

  togglePlay(): void {

    const video = this.videoElement?.nativeElement;
    if (!video) return;

    this.pauseAllOtherVideos(video);

    if (video.paused) {

      if (!this.playPromise) {

        this.playPromise = video.play();

        if (this.playPromise !== undefined) {

          this.playPromise
            .then(() => {
              this.isPlaying = true;
            })
            .catch(() => {
              // Ignore play interruption errors
            })
            .finally(() => {
              this.playPromise = null;
            });
        }
      }

    } else {

      if (this.playPromise) {
        this.playPromise.catch(() => {});
        this.playPromise = null;
      }

      video.pause();
      this.isPlaying = false;
    }
  }

  private pauseAllOtherVideos(current: HTMLVideoElement): void {

    const videos = document.querySelectorAll('video');

    videos.forEach((v: any) => {
      if (v !== current && !v.paused) {
        v.pause();
      }
    });
  }

  // ---------------- SEEK ----------------

  seekForward(): void {

    const video = this.videoElement?.nativeElement;
    if (!video) return;

    video.currentTime =
      Math.min(video.duration, video.currentTime + 10);
  }

  seekBackward(): void {

    const video = this.videoElement?.nativeElement;
    if (!video) return;

    video.currentTime =
      Math.max(0, video.currentTime - 10);
  }

  // ---------------- VOLUME ----------------

  toggleMute(): void {

    const video = this.videoElement?.nativeElement;
    if (!video) return;

    video.muted = !video.muted;
    this.isMuted = video.muted;
  }

  changeVolume(event: Event): void {

    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value);

    this.setVolume(value);
    this.isMuted = value === 0;
  }

  increaseVolume(): void {

    const newVolume =
      Math.min(1, this.volume + 0.1);

    this.setVolume(newVolume);
    this.isMuted = false;
  }

  decreaseVolume(): void {

    const newVolume =
      Math.max(0, this.volume - 0.1);

    this.setVolume(newVolume);
    this.isMuted = newVolume === 0;
  }

  private setVolume(value: number): void {

    const video = this.videoElement?.nativeElement;
    if (!video) return;

    video.volume = value;
    this.volume = value;
  }

  // ---------------- FULLSCREEN ----------------

  toggleFullScreen(): void {

    const container =
      document.querySelector('.player-container') as HTMLElement;

    if (!document.fullscreenElement) {
      container?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  onFullscreenChange(): void {
    this.isFullScreen = !!document.fullscreenElement;
  }

  // ---------------- VIDEO EVENTS ----------------

  onLoadedMetadata(): void {

    const video = this.videoElement?.nativeElement;
    if (!video) return;

    this.duration = video.duration;
  }
  onVideoError(event: any) {
    console.error("Video load error", event);
  }

  onTimeUpdate(): void {

    const video = this.videoElement?.nativeElement;
    if (!video) return;

    this.currentTime = video.currentTime;
  }

  onMouseMove(): void {

    this.showControls = true;
    this.startControlsTimer();
  }

  onVideoClick(): void {
    this.togglePlay();
  }

  onProgressClick(event: MouseEvent): void {

    const video = this.videoElement?.nativeElement;
    if (!video || !this.duration) return;

    const bar = event.currentTarget as HTMLElement;
    const rect = bar.getBoundingClientRect();

    const percent =
      (event.clientX - rect.left) / rect.width;

    const newTime = percent * this.duration;

    video.currentTime = newTime;
    this.currentTime = newTime;
  }

  // ---------------- CONTROL VISIBILITY ----------------

  startControlsTimer(): void {

    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout);
    }

    this.showControls = true;

    this.controlsTimeout = setTimeout(() => {

      if (this.isPlaying) {
        this.showControls = false;
      }

    }, 3000);
  }

  // ---------------- CLOSE ----------------

  closePlayer(): void {
    this.dialogRef.close();
  }

  // ---------------- UTILITIES ----------------

  formatTime(seconds: number): string {
    return this.utilityService.formatDuration(seconds);
  }

  // ---------------- GETTERS ----------------

  get videoSrc(): string | null {
    return this.authenticatedVideoUrl;
  }

  get progressPercent(): number {
    return this.duration
      ? (this.currentTime / this.duration) * 100
      : 0;
  }

  get volumePercent(): number {
    return this.volume * 100;
  }

}