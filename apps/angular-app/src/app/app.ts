import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {  RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header';

@Component({
  imports: [RouterOutlet, CommonModule, HeaderComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  readonly title = 'angular-app';
  
}
