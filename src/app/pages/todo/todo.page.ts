import { Component, OnInit } from "@angular/core";
import { Observable } from 'rxjs';
import { Todo } from '../../state/todo/todo.model';
import { Store } from '@ngrx/store';
import { getAllTodos, getLoading, getError } from '../../state/todo';

import * as fromStore from '../../state/app.reducer';
import * as fromTodo from '../../state/todo/todo.actions';

@Component({
  selector: "app-todo",
  templateUrl: "./todo.page.html",
  styleUrls: ["./todo.page.scss"]
})
export class TodoPage implements OnInit {
  todos$: Observable<Array<Todo>> = this.store.select(getAllTodos);
  loading$: Observable<boolean> = this.store.select(getLoading);
  error$: Observable<string> = this.store.select(getError);

  constructor(private store: Store<fromStore.AppState>) {}

  ngOnInit() {
    this.store.dispatch(new fromTodo.GetAllTodos());
  }
}
