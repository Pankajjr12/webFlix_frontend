import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { DialogService } from '../../shared/services/dialog-service';
import { NotificationService } from '../../shared/services/notification-service';
import { VideoService } from '../../shared/services/video-service';
import { MediaService } from '../../shared/services/media-service';
import { ErrorHandlerService } from '../../shared/services/error-handler-service';
import { UtilityService } from '../../shared/services/utility-service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-video-list',
  standalone: false,
  templateUrl: './video-list.html',
  styleUrl: './video-list.css',
})
export class VideoList implements OnInit {

  pagedVideos: any = [];
  loading = false;
  loadingMore = false;
  searchQuery = '';
  error = false;
  pageSize = 10;
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  hasMoreVideos = true;
  totalUsers = 0
  totalVideos = 0;
  publishedVideos = 0;
  totalDurationSeconds = 0;

  // data = new MatTableDataSource<any>([]);
  constructor(private dialogService: DialogService,
    private notification: NotificationService,
    private videoService: VideoService,
    private utilityService: UtilityService,
    private cdr: ChangeDetectorRef,
    private mediaService: MediaService,
    private errorHandlerService: ErrorHandlerService,
  ) { }
  ngOnInit(): void {
    this.load();
    this.loadStats()
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const scrollPosition = window.pageYOffset + window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;
    if (scrollPosition >= pageHeight - 200 && !this.loadingMore && !this.loading && this.hasMoreVideos) {
      this.loadMoreVideos()
    }
  }

  load() {
    this.loading = true;
    this.currentPage = 0;
    this.pagedVideos = [];
    const search = this.searchQuery.trim() || undefined;
    this.videoService.getAllAdminVideos(this.currentPage, this.pageSize, search).subscribe({
      next: (response: any) => {
        this.pagedVideos = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.currentPage = response.number;
        this.hasMoreVideos = this.currentPage < this.totalPages - 1;
        // this.data.data = this.pagedVideos;
        this.loading = false;
      },
      error: (err) => {
        this.loadingMore = false;
        this.errorHandlerService.handle(err, 'Failed to load videos')
      }
    })
  }
  loadMoreVideos() {
    if (this.loadingMore || !this.hasMoreVideos) return
    this.loadingMore = true;
    const nextPage = this.currentPage + 1;
    const search = this.searchQuery.trim() || undefined;
    this.videoService.getAllAdminVideos(nextPage, this.pageSize, search).subscribe({
      next: (response: any) => {
        this.pagedVideos = [...this.pagedVideos, ...response.content];
        this.currentPage = response.number;
        this.hasMoreVideos = this.currentPage < this.totalPages - 1;
        // this.data.data = this.pagedVideos;
        this.loading = false;
      },
      error: (err) => {
        this.loadingMore = false;
        this.errorHandlerService.handle(err, 'Failed to load more videos')
      }
    })
  }

  loadStats() {
    this.videoService.getStatsByAdmin().subscribe((stats: any) => {
      this.totalVideos = stats.totalVideos;
      this.publishedVideos = stats.publishedVideos;
      this.totalDurationSeconds = stats.totalDuration;
    })
  }
  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement
    this.searchQuery = input.value;
    this.currentPage = 0;
    this.load();
  }

  clearSearch() {
    this.searchQuery = ''
    this.currentPage = 0
    this.load()
  }
  play(video: any) {
    this.dialogService.openVideoPlayer(video);
  }

  createNew() {
    const dialogRef = this.dialogService.openVideoFormDialog('create');
    dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.load()
        this.loadStats()
      }
    })
  }

  edit(video: any) {
    const dialogRef = this.dialogService.openVideoFormDialog('edit', video);
    dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.load()
        this.loadStats()
      }
    })
  }

  remove(video: any) {
    this.dialogService.openConfirmation(
      'Delete Video?',
      `Are you sure you want to  delete "${video.title}"? This action cannot be undone.`,
      'Delete',
      'Cancel',
      'danger'
    ).subscribe(response => {
      if (response) {
        this.loading = true;
        this.videoService.deleteVideoByAdmin(video.id).subscribe({
          next: () => {
            this.notification.success('Video deletd succesfully');
            this.load()
            this.loadStats()
          },
          error: (err) => {
            this.loading = false;
            this.errorHandlerService.handle(err, 'Failed to delete video. Please try again.')
          }
        })
      }
    })
  }

  togglePublish(event: any, video: any) {
    const newPublishedState = event.checked;
    this.videoService.setPublishedByAdmin(video.id, newPublishedState).subscribe({
      next: (response) => {
        video.published = newPublishedState;
        this.notification.success(`Video ${video.published ? 'published' : 'unpublished'} successfully`)
        this.loadStats()
      },
      error: (err) => {
        video.published = !newPublishedState;
        this.errorHandlerService.handle(err, 'Failed to update publish status . Please try again.')
      }
    })
  }

  getPublishedCount(): number {
    return this.publishedVideos
  }

  getTotalDuration(): string {
    const total = this.totalDurationSeconds;
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
  }

  formatDuration(seconds: number): string {
    return this.utilityService.formatDuration(seconds);
  }

  getPosterUrl(video: any) {
    return this.mediaService.getMediaUrl(video.poster, 'image', {
      useCache: true
    });
  }

}
