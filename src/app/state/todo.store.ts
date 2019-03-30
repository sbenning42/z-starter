import { Update, EntityState, createEntityAdapter, Dictionary } from '@ngrx/entity';
import { Injectable } from '@angular/core';
import { Store, select, createSelector } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { zip } from 'rxjs';
import { TodoService } from '../core/services/todo/todo.service';
import {
    ZSchema,
    ZActionSchema,
    syncConfig,
    asyncConfig,
    createZStore,
    Action,
    asyncWoPayloadConfig,
    basicAsyncResolve
} from "../core/Z";

export const todoSelector = 'TODO';

export interface Todo {
    id: string;
    name: string;
}

export interface TodoState extends EntityState<Todo> {
    actives: string[];
    loaded: boolean;
}

export const todosAdapter = createEntityAdapter<Todo>({ sortComparer: false });

export const selectTodo = states => states[todoSelector] as TodoState;

export const {
    selectAll: selectAllTodo,
    selectEntities: selectEntitiesTodo,
    selectIds: selectIdsTodo,
    selectTotal: selectTotalTodo,
} = todosAdapter.getSelectors();

export interface TodoSchema extends ZSchema {
    selectOne: ZActionSchema<string>;
    deselectOne: ZActionSchema<string>;
    getAll: ZActionSchema<void, Todo[]>;
    getById: ZActionSchema<string, Todo>;
    addOne: ZActionSchema<Partial<Todo>, Todo>;
    updateOne: ZActionSchema<Update<Todo>, Todo>;
    removeOne: ZActionSchema<string, {}>;
    removeAll: ZActionSchema<void, {}>;
}

export type TodoPayloads = string
    | Todo
    | Todo[]
    | Partial<Todo>
    | Update<Todo>;

export const initialTodoState: TodoState = todosAdapter.getInitialState({ loaded: false, actives: [] });

export const todoActionsConfig = {
    selectOne: syncConfig('[TODO] Select One'),
    deselectOne: syncConfig('[TODO] Deselect One'),
    getAll: asyncWoPayloadConfig('[TODO] Get All'),
    getById: asyncConfig('[TODO] Get By Id'),
    addOne: asyncConfig('[TODO] Add One'),
    updateOne: asyncConfig('[TODO] Update One'),
    removeOne: asyncConfig('[TODO] Remove One'),
    removeAll: asyncWoPayloadConfig('[TODO] Remove All'),
};

@Injectable()
export class TodoStore {
    
    Z = createZStore<TodoState, TodoSchema>(this.store, todoSelector, initialTodoState, todoActionsConfig);

    get todo$() { return this.Z._state; }
    get loaded$() { return this.Z.loaded; }
    get actives$() { return this.Z.actives; }

    get ids$() { return this.store.pipe(select(createSelector(selectTodo, selectIdsTodo))); }
    get entities$() { return this.store.pipe(select(createSelector(selectTodo, selectEntitiesTodo))); }
    get all$() { return this.store.pipe(select(createSelector(selectTodo, selectAllTodo))); }
    get total$() { return this.store.pipe(select(createSelector(selectTodo, selectTotalTodo))); }

    get SelectOne() { return this.Z.selectOne.Create; }
    get DeselectOne() { return this.Z.deselectOne.Create; }
    get GetAllRequest() { return this.Z.getAll.Request; }
    get GetAllResponse() { return this.Z.getAll.Response; }
    get GetAllError() { return this.Z.getAll.Error; }
    get GetAllCancel() { return this.Z.getAll.Cancel; }
    get GetByIdRequest() { return this.Z.getById.Request; }
    get GetByIdResponse() { return this.Z.getById.Response; }
    get GetByIdError() { return this.Z.getById.Error; }
    get GetByIdCancel() { return this.Z.getById.Cancel; }
    get AddOneRequest() { return this.Z.addOne.Request; }
    get AddOneResponse() { return this.Z.addOne.Response; }
    get AddOneError() { return this.Z.addOne.Error; }
    get AddOneCancel() { return this.Z.addOne.Cancel; }
    get UpdateOneRequest() { return this.Z.updateOne.Request; }
    get UpdateOneResponse() { return this.Z.updateOne.Response; }
    get UpdateOneError() { return this.Z.updateOne.Error; }
    get UpdateOneCancel() { return this.Z.updateOne.Cancel; }
    get RemoveOneRequest() { return this.Z.removeOne.Request; }
    get RemoveOneResponse() { return this.Z.removeOne.Response; }
    get RemoveOneError() { return this.Z.removeOne.Error; }
    get RemoveOneCancel() { return this.Z.removeOne.Cancel; }
    get RemoveAllRequest() { return this.Z.removeAll.Request; }
    get RemoveAllResponse() { return this.Z.removeAll.Response; }
    get RemoveAllError() { return this.Z.removeAll.Error; }
    get RemoveAllCancel() { return this.Z.removeAll.Cancel; }

    constructor(
        protected store: Store<any>,
        protected actions$: Actions<Action<any>>,
        protected todo: TodoService
    ) {
        const {
            SelectOne,
            DeselectOne,
            GetAllRequest, GetAllResponse, GetAllError, GetAllCancel,
            GetByIdRequest, GetByIdResponse, GetByIdError, GetByIdCancel,
            AddOneRequest, AddOneResponse, AddOneError, AddOneCancel,
            UpdateOneRequest, UpdateOneResponse, UpdateOneError, UpdateOneCancel,
            RemoveAllRequest, RemoveAllResponse, RemoveAllError, RemoveAllCancel,
            RemoveOneRequest, RemoveOneResponse, RemoveOneError, RemoveOneCancel
        } = this;
        function todoReducer(
            state: TodoState = initialTodoState,
            { type, payload: rawPayload }: Action<TodoPayloads>
        ): TodoState {
            switch (type) {
                case SelectOne.type: {
                    const payload = rawPayload as string;
                    return { ...state, actives: [...state.actives, payload] };
                }
                case DeselectOne.type: {
                    const payload = rawPayload as string;
                    return { ...state, actives: state.actives.filter(actif => actif !== payload) };
                }
                case GetAllResponse.type: {
                    const payload = rawPayload as Todo[];
                    return todosAdapter.addAll(payload, { ...state, loaded: true });
                }
                case AddOneResponse.type: {
                    const payload = rawPayload as Todo;
                    return todosAdapter.addOne(payload, { ...state });
                }
                case UpdateOneResponse.type: {
                    const payload = rawPayload as Todo;
                    const update = { id: payload.id, changes: payload };
                    return todosAdapter.updateOne(update, { ...state });
                }
                case RemoveOneResponse.type: {
                    const payload = rawPayload as string;
                    return todosAdapter.removeOne(payload, { ...state });
                }
                case RemoveAllResponse.type: {
                    return todosAdapter.removeAll({ ...state });
                }
                case GetByIdResponse.type:
                case GetAllRequest.type:
                case GetAllError.type:
                case GetAllCancel.type:
                case GetByIdRequest.type:
                case GetByIdError.type:
                case GetByIdCancel.type:
                case AddOneRequest.type:
                case AddOneError.type:
                case AddOneCancel.type:
                case UpdateOneRequest.type:
                case UpdateOneError.type:
                case UpdateOneCancel.type:
                case RemoveOneRequest.type:
                case RemoveOneError.type:
                case RemoveOneCancel.type:
                case RemoveAllRequest.type:
                case RemoveAllError.type:
                case RemoveAllCancel.type:
                default:
                    return state;
            }
        };
        // store.addReducer(todoSelector, todoReducer);
    }
    dispatch(action: Action<TodoPayloads | void>) {
        this.store.dispatch(action);
    }
    
    @Effect({ dispatch: true })
    protected getAll$ = this.actions$.pipe(
        basicAsyncResolve(this.Z.getAll, () => this.todo.getTodos())
    );
    @Effect({ dispatch: true })
    protected getById$ = this.actions$.pipe(
        basicAsyncResolve(this.Z.getById, (payload: string) => this.todo.getTodo(parseInt(payload)))
    );
    @Effect({ dispatch: true })
    protected addOne$ = this.actions$.pipe(
        basicAsyncResolve(this.Z.addOne, (payload: Partial<Todo>) => this.todo.save(payload))
    );
    @Effect({ dispatch: true })
    protected updateOne$ = this.actions$.pipe(
        basicAsyncResolve(
            this.Z.updateOne,
            (payload: Update<Todo>) => this.todo.save({ id: payload.id, ...payload.changes }),
        )
    );
    @Effect({ dispatch: true })
    protected removeAll$ = this.actions$.pipe(
        basicAsyncResolve(
            this.Z.removeAll,
            (todos: Todo[]) => zip(...todos.map(todo => this.todo.delete(todo))),
            this.all$
        )
    );
    @Effect({ dispatch: true })
    protected removeOne$ = this.actions$.pipe(
        basicAsyncResolve<string, {}, Dictionary<Todo>>(
            this.Z.removeOne,
            (payload: string, todos: Dictionary<Todo>) => this.todo.delete(todos[payload]),
            this.entities$
        )
    );
}
