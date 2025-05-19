import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
@Component({
  selector: 'app-upload-file',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './upload-file.component.html',
  styleUrl: './upload-file.component.css'
})
export class UploadFileComponent implements OnInit {

files: File[] = [];
  errorMessage = '';
  successMessage = '';
  isUploading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
      this.http.get('http://localhost:8000/api');
  }

  onFileSelected(event: Event): void {
    this.errorMessage = '';
    this.successMessage = '';
    const element = event.currentTarget as HTMLInputElement;
    if (element.files) {
      // Limit to max 5 files
      if (element.files.length > 5) {
        this.errorMessage = 'You can upload a maximum of 5 files.';
        this.files = [];
        return;
      }
      this.files = Array.from(element.files);
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.errorMessage = '';
    this.successMessage = '';

    if (this.files.length === 0) {
      this.errorMessage = 'Please select at least one Excel file.';
      return;
    }

    this.isUploading = true;

    const formData = new FormData();
    this.files.forEach(file => {
      formData.append('files', file, file.name);
    });


    // Adjust the URL according to your Django backend location
    const uploadUrl = 'http://localhost:8000/api/upload/';

    this.http.post(uploadUrl, formData, { responseType: 'blob', observe: 'response' }).subscribe({
      next: (response) => {
        if (response.status === 200) {
          const blob = response.body as Blob;
          // Trigger file download
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = 'filtered_data.csv';
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(downloadUrl);

          this.successMessage = 'Download started.';
        } else {
          this.errorMessage = 'Failed to upload files.';
        }
        this.isUploading = false;
      },
      error: (err) => {
        console.log(err)
        this.errorMessage = 'Upload failed. Please try again.';
        this.isUploading = false;
      }
    });
  }
}
