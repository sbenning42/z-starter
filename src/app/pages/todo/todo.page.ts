import { Component, OnInit } from "@angular/core";
import { Observable, of } from 'rxjs';

@Component({
  selector: "app-todo",
  templateUrl: "./todo.page.html",
  styleUrls: ["./todo.page.scss"]
})
export class TodoPage implements OnInit {

  loading$: Observable<boolean> = of(false);
  error$: Observable<string> = of(null);

  constructor(
  ) {}

  ngOnInit() {
  }
}
