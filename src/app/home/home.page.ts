import { Component, OnInit } from '@angular/core';
import { TodoStore } from '../state/todo.store';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  constructor(
    public todo: TodoStore
  ) {}

  ngOnInit() {
    this.todo.dispatch(new this.todo.GetAllRequest());
  }
}
