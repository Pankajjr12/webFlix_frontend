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

@Component({
  selector: 'app-video-player',
  standalone:false,
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

  videoUrl: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<VideoPlayer>,
    @Inject(MAT_DIALOG_DATA) public video: any,
    public utilityService: UtilityService
  ) {}

  ngOnInit(): void {
    this.loadVideo();
    this.startControlsTimer();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private loadVideo(): void {

    const src = this.video?.src || this.video?.videoUrl;

    if (!src) {
      console.error('Video source missing', this.video);
      return;
    }

    this.videoUrl = src;

    console.log("VIDEO URL:", this.videoUrl);
  }

  private cleanup(): void {

    const video = this.videoElement?.nativeElement;

    if (video) {
      video.pause();
      video.currentTime = 0;
      video.removeAttribute('src');
      video.load();
    }
  }

  togglePlay(): void {

    const video = this.videoElement?.nativeElement;
    if (!video) return;

    if (video.paused) {
      video.play();
      this.isPlaying = true;
    } else {
      video.pause();
      this.isPlaying = false;
    }
  }

  seekForward(): void {

    const video = this.videoElement?.nativeElement;
    if (!video) return;

    video.currentTime = Math.min(video.duration, video.currentTime + 10);
  }

  seekBackward(): void {

    const video = this.videoElement?.nativeElement;
    if (!video) return;

    video.currentTime = Math.max(0, video.currentTime - 10);
  }

  toggleMute(): void {

    const video = this.videoElement?.nativeElement;
    if (!video) return;

    video.muted = !video.muted;
    this.isMuted = video.muted;
  }

  onMouseMove(): void {
    this.startControlsTimer();
  }

  onVideoClick(): void {
    this.togglePlay();
  }

  onVideoError(event: Event): void {
    console.error("Video playback error:", event);
  }

  onProgressClick(event: MouseEvent): void {

    const progressContainer = event.currentTarget as HTMLElement;
    const rect = progressContainer.getBoundingClientRect();

    const clickX = event.clientX - rect.left;
    const width = rect.width;

    const percentage = clickX / width;

    const video = this.videoElement?.nativeElement;

    if (video && this.duration) {
      video.currentTime = percentage * this.duration;
    }
  }

  changeVolume(event: Event): void {

    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value);

    const video = this.videoElement?.nativeElement;

    if (video) {
      video.volume = value;
    }

    this.volume = value;
  }

  toggleFullScreen(): void {

    const container =
      document.querySelector('.player-container') as HTMLElement;

    if (!document.fullscreenElement) {
      container?.requestFullscreen();
      this.isFullScreen = true;
    } else {
      document.exitFullscreen();
      this.isFullScreen = false;
    }
  }

  onLoadedMetadata(): void {

    const video = this.videoElement?.nativeElement;

    if (video) {
      this.duration = video.duration;
    }
  }

  onTimeUpdate(): void {

    const video = this.videoElement?.nativeElement;

    if (video) {
      this.currentTime = video.currentTime;
    }
  }

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

  closePlayer(): void {
    this.dialogRef.close();
  }

  formatTime(seconds: number): string {
    return this.utilityService.formatDuration(seconds);
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