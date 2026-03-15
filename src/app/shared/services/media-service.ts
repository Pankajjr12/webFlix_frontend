import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  HttpClient,
  HttpEventType,
  HttpRequest
} from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MediaService {

  private apiUrl = environment.apiUrl + '/files';
  private imageCache = new Map<string, string>();

  constructor(private http: HttpClient) {}

  // =========================
  // Upload Image or Video
  // =========================
  uploadFile(file: File): Observable<{ progress: number; url?: string }> {

    const formData = new FormData();
    formData.append('file', file);

    const isVideo = file.type.startsWith('video/');

    const uploadUrl = isVideo
      ? `${this.apiUrl}/upload/video`
      : `${this.apiUrl}/upload/image`;

    const req = new HttpRequest(
      'POST',
      uploadUrl,
      formData,
      {
        reportProgress: true
      }
    );

    return this.http.request(req).pipe(
      map(event => {

        if (event.type === HttpEventType.UploadProgress) {

          const progress = Math.round(
            100 * event.loaded / (event.total || 1)
          );

          return { progress };

        } else if (event.type === HttpEventType.Response) {

          const body: any = event.body;

          return {
            progress: 100,
            url: body?.url
          };

        }

        return { progress: 0 };
      })
    );
  }

  // =========================
  // Get Media URL
  // =========================
  getMediaUrl(mediaValue: any, p0: string, p1: { useCache: boolean; }): string | null {

    if (!mediaValue) {
      return null;
    }

    // already a Cloudinary URL
    if (typeof mediaValue === 'string' && mediaValue.startsWith('http')) {
      return mediaValue;
    }

    // blob preview
    if (typeof mediaValue === 'string' && mediaValue.startsWith('blob:')) {
      return mediaValue;
    }

    // base64 preview
    if (typeof mediaValue === 'string' && mediaValue.startsWith('data:')) {
      return mediaValue;
    }

    return null;
  }

}