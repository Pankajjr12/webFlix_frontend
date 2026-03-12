import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { VideoService } from '../../shared/services/video-service';
import { WatchListService } from '../../shared/services/watch-list-service';
import { NotificationService } from '../../shared/services/notification-service';
import { UtilityService } from '../../shared/services/utility-service';
import { MediaService } from '../../shared/services/media-service';
import { DialogService } from '../../shared/services/dialog-service';
import { ErrorHandlerService } from '../../shared/services/error-handler-service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit, OnDestroy {

  allVideos: any[] = [];
  filteredVideos: any[] = [];
  loading = true;
  loadingMore = false;
  error = false;
  searchQuery: string = '';

  featuredVideos: any[] = [];
  currentSlideIndex = 0;
  featuredLoading = true;

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  hasMoreVideos = true;

  private searchSubject = new Subject<string>();
  private sliderInterval: any;
  private savedScrollPosition = 0;

  constructor(
    private videoService: VideoService,
    private watchListService: WatchListService,
    private notification: NotificationService,
    private utilityService: UtilityService,
    private mediaService: MediaService,
    private dialogService: DialogService,
    private errorHanlderServcie: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.loadFeaturedVideos();
    this.loadVideos(0);
    this.initializeSearchDebounce();
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
    this.stopSlider();
  }

  initializeSearchDebounce() {
    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(() => {
        this.performSearch();
      });
  }

  private startSlider() {
    this.sliderInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  private stopSlider() {
    if (this.sliderInterval) {
      clearInterval(this.sliderInterval);
    }
  }

  nextSlide() {
    if (this.featuredVideos.length > 0) {
      this.currentSlideIndex =
        (this.currentSlideIndex + 1) % this.featuredVideos.length;
    }
  }

  prevSlide() {
    if (this.featuredVideos.length > 0) {
      this.currentSlideIndex =
        (this.currentSlideIndex - 1 + this.featuredVideos.length) %
        this.featuredVideos.length;
    }
  }

  gotoSlide(index: number) {
    this.currentSlideIndex = index;
    this.stopSlider();

    if (this.featuredVideos.length > 1) {
      this.startSlider();
    }
  }

  goToCurrentFeaturdVideo() {
    return this.featuredVideos[this.currentSlideIndex] || null;
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

  loadFeaturedVideos() {
    this.featuredLoading = true;

    this.videoService.getFeaturedVideos().subscribe({
      next: (videos: any) => {
        this.featuredVideos = videos;
        this.featuredLoading = false;

        if (this.featuredVideos.length > 1) {
          this.startSlider();
        }
      },
      error: (err) => {
        this.featuredLoading = false;
        this.errorHanlderServcie.handle(
          err,
          'Error loading featured videos.'
        );
      },
    });
  }

  loadVideos(page: number) {
    this.error = false;
    this.currentPage = page;

    if (page === 0) {
      this.allVideos = [];
      this.filteredVideos = [];
    }

    const search = this.searchQuery.trim() || undefined;
    const isSearching = !!search;

    this.loading = page === 0;

    this.videoService
      .getPublishedVideosPaginated(page, this.pageSize, search)
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

          if (isSearching && this.savedScrollPosition > 0) {
            setTimeout(() => {
              window.scrollTo({
                top: this.savedScrollPosition,
                behavior: 'auto',
              });
              this.savedScrollPosition = 0;
            }, 0);
          }
        },
        error: (err) => {
          console.error('Error loading videos..', err);
          this.error = true;
          this.loading = false;
          this.loadingMore = false;
        },
      });
  }

  loadMoreVideos() {
    if (this.loadingMore || !this.hasMoreVideos) return;

    this.loadingMore = true;
    this.loadVideos(this.currentPage + 1);
  }

  onSearch() {
    this.searchSubject.next(this.searchQuery);
  }

  private performSearch() {
    this.savedScrollPosition =
      window.pageYOffset || document.documentElement.scrollTop;

    this.currentPage = 0;
    this.loadVideos(0);
  }

  clearSearch() {
    this.searchQuery = '';
    this.currentPage = 0;
    this.savedScrollPosition = 0;
    this.loadVideos(0);
  }

  isInWatchList(video: any): boolean {
    return video.isInWatchList === true;
  }

  toggleWatchList(video: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    const videoId = video.id!;
    const isInList = this.isInWatchList(video);

    if (isInList) {
      video.isInWatchList = false;

      this.watchListService.removeFromWatchlist(videoId).subscribe({
        next: () => {
          this.notification.success('Removed from My Favorites');
        },
        error: (err) => {
          video.isInWatchList = true;
          this.errorHanlderServcie.handle(
            err,
            'Failed to remove from My favorites. Please try again.'
          );
        },
      });
    } else {
      video.isInWatchList = true;

      this.watchListService.addToWatchlist(videoId).subscribe({
        next: () => {
          this.notification.success('Added to My Favorites');
        },
        error: (err) => {
          video.isInWatchList = false;
          this.errorHanlderServcie.handle(
            err,
            'Failed to add to My favorites. Please try again.'
          );
        },
      });
    }
  }

  getPosterUrl(video: any) {
    return (
      this.mediaService.getMediaUrl(video, 'image', {
        useCache: true,
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