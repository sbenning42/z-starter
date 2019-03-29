import { Update } from '@ngrx/entity';
import { ZSchema, ZActionSchema, syncConfig, asyncConfig, createZStore } from "../Z/Z";

const todoSelector = 'TODO';

interface Todo {
    id: string;
}

interface TodoState {
    todos: Todo[];
    actives: Todo[];
    loaded: boolean;
    loading: boolean;
    error: Error;
}

interface TodoSchema extends ZSchema {
    selectOne: ZActionSchema<string>;
    deselectOne: ZActionSchema<string>;
    getAll: ZActionSchema<void, Todo[]>;
    getById: ZActionSchema<string, Todo>;
    addAll: ZActionSchema<void, Todo[]>;
    addOne: ZActionSchema<Partial<Todo>, Todo>;
    updateOne: ZActionSchema<Update<Todo>, Todo>;
    removeOne: ZActionSchema<string, {}>;
    removeAll: ZActionSchema<void, {}>;
}
const initialTodoState: TodoState = {
    todos: [],
    actives: [],
    loaded: false,
    loading: false,
    error: null,
};
const todoActionsConfig = {
    selectOne: syncConfig('[TODO] Select One'),
    deselectOne: syncConfig('[TODO] Deselect One'),
    getAll: asyncConfig('[TODO] Get All'),
    getById: asyncConfig('[TODO] Get By Id'),
    addAll: asyncConfig('[TODO] Add All'),
    addOne: asyncConfig('[TODO] Add One'),
    updateOne: asyncConfig('[TODO] Update One'),
    removeOne: asyncConfig('[TODO] Remove One'),
    removeAll: asyncConfig('[TODO] Remove All'),
};
const todoZ = createZStore<TodoState, TodoSchema>(
    undefined,
    todoSelector,
    initialTodoState,
    todoActionsConfig
);

new todoZ.addAll.Request();
new todoZ.selectOne.Create('');
