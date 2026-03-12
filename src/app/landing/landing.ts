import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: false,
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {
  landingForm !: FormGroup;
  year = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.landingForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }
  login() {
    this.router.navigate(['/login']);
  }

  getStarted() {
    this.router.navigate(['/signup'], {
      queryParams: { email: this.landingForm.value.email }
    });
  }

  reasons = [
    {
      title: 'Enjoy on your TV',
      text: 'Watch on smart TVs, PlayStation, Xbox, Chromecast, Apple TV, Blu-ray players and more.',
      icon: 'tv'
    },
    {
      title: 'Download your shows to watch offline',
      text: 'Save your favourites easily and always have something to watch.',
      icon: 'file_download'
    },
    {
      title: 'Watch everywhere',
      text: 'Stream unlimited movies and TV shows on your phone, tablet, laptop and TV.',
      icon: 'devices'
    }, // 👈 MISSING COMMA WAS HERE
    {
      title: 'Create profiles for kids',
      text: 'Send kids on adventures in a space made just for them — free with your membership.',
      icon: 'face'
    }
  ];

  faqs = [
    {
      question: 'What is WebFlix?',
      answer: 'WebFlix is a streaming platform that offers a wide variety of award-winning TV shows, movies, and more on thousands of internet-connected devices.'
    },
    {
      question: 'How much does WebFlix cost?',
      answer: 'Watch WebFlix on your smartphone, tablet, Smart TV, laptop, or streaming device, all for one affordable monthly fee.'
    },
    {
      question: 'Where can I watch?',
      answer: 'Watch anywhere, anytime. Sign in with your WebFlix account to watch instantly on the web or on devices that support the app.'
    },
    {
      question: 'How do I cancel?',
      answer: 'WebFlix is flexible. There are no contracts and no commitments. You can easily cancel your account online anytime.'
    },
    {
      question: 'What can I watch on WebFlix?',
      answer: 'WebFlix has an extensive library of feature films, documentaries, TV shows, anime, award-winning originals, and more.'
    },
    {
      question: 'Is WebFlix good for kids?',
      answer: 'The WebFlix Kids experience is included in your membership to give parents control while kids enjoy family-friendly TV shows and movies.'
    }
  ];
}
