import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { AuthService } from './auth-service';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MediaService {
  private apiUrl = environment.apiUrl + '/files'
  private imageCache = new Map<string, string>();
  constructor(private http: HttpClient,
    private authService: AuthService) {

  }

  updateFile(file: File): Observable<{ progress: number; uuid?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const isVideo = file.type.startsWith('video/');
    const uploadUrl = isVideo ? `${this.apiUrl}/upload/video` : `${this.apiUrl}/upload/image`;

    const req = new HttpRequest('POST', uploadUrl, formData, {
      reportProgress: true
    });

    return this.http.request(req).pipe(
      map(event => {
        if (event.type === HttpEventType.UploadProgress) {
          const progress = Math.round(100 * event.loaded / (event.total || 1));
          return { progress };
        }
        else if (event.type === HttpEventType.Response) {
          const body = event.body as any;
          return { progress: 100, uuid: body?.uuid };
        }

        return { progress: 0 };
      })
    );
  }

  getMediaUrl(
    mediaValue: any,
    type: 'image' | 'video',
    options?: {
      useCache?: boolean;
    }
  ): string | null {

    let value = mediaValue;

    // If it's a video object and has poster image
    if (
      type === 'image' &&
      mediaValue &&
      typeof mediaValue === 'object' &&
      mediaValue.poster
    ) {
      value = mediaValue.poster;
    }

    if (!value) {
      return null;
    }

    // Ensure value is string
    if (typeof value !== 'string') {
      return null;
    }

    let uuid = value;

    // If already a full URL
    if (value.includes(`/${type}/`)) {
      uuid = value.substring(value.lastIndexOf('/') + 1);
      return value;
    }

    // Return cached image if available
    if (options?.useCache && type === 'image' && this.imageCache.has(uuid)) {
      return this.imageCache.get(uuid)!;
    }

    // Handle blob or base64 URLs
    if (uuid.startsWith('blob:') || uuid.startsWith('data:')) {
      return uuid;
    }

    const token = this.authService.getToken();
    if (!token) {
      console.log(`No token found for ${type} loading`);
      return null;
    }

    const authenticatedUrl = `${this.apiUrl}/${type}/${uuid}?token=${encodeURIComponent(token)}`;

    // Cache image if needed
    if (options?.useCache && type === 'image') {
      this.imageCache.set(uuid, authenticatedUrl);
    }

    return authenticatedUrl;
  }
}
