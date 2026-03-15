import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { VideoService } from '../../../shared/services/video-service';
import { WatchListService } from '../../../shared/services/watch-list-service';
import { NotificationService } from '../../../shared/services/notification-service';
import { UtilityService } from '../../../shared/services/utility-service';
import { MediaService } from '../../../shared/services/media-service';
import { DialogService } from '../../../shared/services/dialog-service';
import { ErrorHandlerService } from '../../../shared/services/error-handler-service';

@Component({
  selector: 'app-my-favorites',
  standalone: false,
  templateUrl: './my-favorites.html',
  styleUrl: './my-favorites.css',
})
export class MyFavorites implements OnInit, OnDestroy {

  allVideos: any[] = [];
  filteredVideos: any[] = [];
  loading = true;
  loadingMore = false;
  error = false;
  searchQuery: string = '';

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  hasMoreVideos = true;

  private searchSubject = new Subject<string>();

  constructor(
    private videoService: VideoService,
    private watchListService: WatchListService,
    private notification: NotificationService,
    private utilityService: UtilityService,
    private mediaService: MediaService,
    private dialogService: DialogService,
    private errorHanlderServcie: ErrorHandlerService
  ) { }

  ngOnInit(): void {
    this.loadVideos(0);
    this.initializeSearchDebounce();
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  initializeSearchDebounce() {
    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(() => {
        this.performSearch();
      });
  }
  @HostListener('window:scroll')
  onScroll(): void {
    const scrollPosition = window.pageYOffset + window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;

    if (
      scrollPosition >= pageHeight - 200 &&
      !this.loadingMore &&
      !this.loading &&
      this.hasMoreVideos
    ) {
      this.loadMoreVideos();
    }
  }

  loadVideos(page: number) {
    this.error = false;
    this.currentPage = page;

    if (page === 0) {
      this.allVideos = [];
      this.filteredVideos = [];
    }

    const search = this.searchQuery.trim() || undefined;
    this.loading = page === 0;
    this.watchListService
      .getWatchlist(page, this.pageSize, search)
      .subscribe({
        next: (response: any) => {

          if (page === 0) {
            this.allVideos = response.content;
            this.filteredVideos = response.content;
          } else {
            this.allVideos = [...this.allVideos, ...response.content];
            this.filteredVideos = [...this.filteredVideos, ...response.content];
          }

          this.currentPage = response.number;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;

          this.hasMoreVideos = this.currentPage < this.totalPages - 1;

          this.loading = false;
          this.loadingMore = false;

        },
        error: (err) => {
          console.error('Error loading videos..', err);
          this.error = true;
          this.loading = false;
        },
      });
  }

  loadMoreVideos() {
    if (this.loadingMore || !this.hasMoreVideos) return;

    this.loadingMore = true;
    const nextPage = this.currentPage + 1;
    const search = this.searchQuery.trim() || undefined;

    this.watchListService.getWatchlist(nextPage, this.pageSize, search).subscribe({
      next: (response: any) => {
        this.allVideos = [...this.allVideos, ...response.content];
        this.filteredVideos = [...this.filteredVideos, ...response.content];
        this.currentPage = response.number;
        this.hasMoreVideos = this.currentPage < this.totalPages - 1;
        this.loadingMore = false;
      },

      error: (err) => {
        this.notification.error('Failed to load more videos');
        this.loadingMore = false;
      }
    });
  }

  onSearch() {
    this.searchSubject.next(this.searchQuery);
  }

  private performSearch() {
    this.currentPage = 0;
    this.loadVideos(0);
  }

  clearSearch() {
    this.searchQuery = '';
    this.currentPage = 0;
    this.loadVideos(0);
  }

  toggleWatchList(video: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    const videoId = video.id!;
    this.watchListService.removeFromWatchlist(videoId).subscribe({
      next: () => {
        this.allVideos = this.allVideos.filter((v: any) => v.id !== videoId);
        this.filteredVideos = this.filteredVideos.filter((v: any) => v.id !== videoId);
        this.notification.success('Removed from My Favorites.')
      },
      error: (err) => {
        this.errorHanlderServcie.handle(err, "Failed to remove from My Favorites. Please try again.")
      }
    })
  }

  getPosterUrl(video: any) {
    return (
      this.mediaService.getMediaUrl(video?.poster, 'image', {
        useCache: true
      }) || ''
    );
  }

  playVideo(video: any) {
    this.dialogService.openVideoPlayer(video);
  }

  formatDuration(seconds: number | undefined) {
    return this.utilityService.formatDuration(seconds);
  }
}
