type ID = string

type TodoEvent =
  | { type: "task_created", taskId: ID, name: string }
  | { type: "task_renamed", taskId: ID, name: string }
  | { type: "task_attached_to_context", taskId: ID, contextId: ID }
  | { type: "task_detached_from_context", taskId: ID, contextId: ID }
  | { type: "task_checked", taskId: ID }
  | { type: "task_unchecked", taskId: ID }
  | { type: "task_due_date_set", taskId: ID, dueDate: string }
  | { type: "task_due_date_unset", taskId: ID }
  | { type: "task_deleted", taskId: ID }
  | { type: "context_created", contextId: ID, name: string }
  | { type: "context_renamed", contextId: ID, name: string }
  | { type: "context_deleted", contextId: ID }
  | { type: "task_reordered_in_context", contextId: ID, oldPosition: number, newPosition: number }

interface TodoState {
  tasks: Map<ID, Task>,
  contexts: Map<ID, Context>
}

interface Task {
  id: ID,
  name: string,
  checked: boolean,
  dueDate: Date | null
}

interface Context {
  id: ID,
  name: string,
  taskIDs: ID[]
}

import { action, autorun, observable, computed } from "mobx"

function assert(predicate: () => any) {
  if (!predicate())
    throw new Error("assertion failed: " + predicate)
}

function newId(type: string) {
  return type + ":" + Math.random().toString(16).slice(2);
}

class TodoApp {
  @action
  createTask(taskId: ID, name: string) {
    assert(() => !this.state.tasks.has(taskId))
    this.apply({ type: "task_created", taskId, name })
  }

  @action
  setTaskContext(taskId: ID, contextId: ID | null) {
    assert(() => this.state.tasks.has(taskId))
    for (const context of this.state.contexts.values())
      if (context.taskIDs.includes(taskId))
        this.apply({ type: "task_detached_from_context", taskId, contextId: context.id })
    if (contextId) {
      assert(() => this.state.contexts.has(contextId))
      this.apply({ type: "task_attached_to_context", taskId, contextId })
    }
  }

  @action
  renameTask(taskId: ID, name: string) {
    assert(() => this.state.tasks.has(taskId))
    this.apply({ type: "task_renamed", taskId, name })
  }

  @action
  checkTask(taskId: ID, check = true) {
    assert(() => this.state.tasks.has(taskId))
    this.apply({
      type: check ? "task_checked" : "task_unchecked",
      taskId
    } as TodoEvent)
  }

  setTaskDueDate(taskId: ID, dueDate?: Date) {
    assert(() => this.state.tasks.has(taskId))
    if (dueDate)
      this.apply({ type: "task_due_date_set", taskId, dueDate: dueDate.toISOString() })
    else
      this.apply({ type: "task_due_date_unset", taskId })
  }

  @action
  deleteTask(taskId: ID) {
    assert(() => this.state.tasks.has(taskId))
    this.apply({ type: "task_deleted", taskId })
  }

  @action
  createContext(contextId: ID, name: string) {
    assert(() => !this.state.contexts.has(contextId))
    this.apply({ type: "context_created", contextId, name })
  }

  @action
  renameContext(contextId: ID, name: string) {
    assert(() => this.state.contexts.has(contextId))
    this.apply({ type: "context_renamed", contextId, name })
  }

  @action
  deleteContext(contextId: ID, name: string) {
    assert(() => this.state.contexts.has(contextId))
    this.apply({ type: "context_deleted", contextId })
  }

  @action
  reorderTaskInContext(contextId: ID, oldPosition: number, newPosition: number): any {
    assert(() => this.state.contexts.has(contextId))
    const context = this.state.contexts.get(contextId)!
    assert(() => oldPosition >= 0 && oldPosition < context.taskIDs.length)
    assert(() => newPosition >= 0 && newPosition < context.taskIDs.length)
    this.apply({ type: "task_reordered_in_context", contextId, oldPosition, newPosition })
  }

  @observable
  state: TodoState = {
    tasks: new Map(),
    contexts: new Map()
  }

  @observable
  readonly events: TodoEvent[] = []

  apply(event: TodoEvent) {
    this.events.push(event)
    switch (event.type) {
      case "task_created":
        this.state.tasks.set(event.taskId, {
          id: event.taskId,
          name: event.name,
          checked: false,
          dueDate: null
        })
        break
      case "task_renamed":
        this.state.tasks.get(event.taskId)!.name = event.name
        break
      case "task_attached_to_context":
        this.state.contexts.get(event.contextId)!.taskIDs.push(event.taskId)
        break
      case "task_detached_from_context":
        const { taskIDs } = this.state.contexts.get(event.contextId)!
        taskIDs.splice(taskIDs.indexOf(event.taskId), 1)
        break
      case "task_checked":
        this.state.tasks.get(event.taskId)!.checked = true
        break
      case "task_unchecked":
        this.state.tasks.get(event.taskId)!.checked = false
        break
      case "task_due_date_set":
        this.state.tasks.get(event.taskId)!.dueDate = new Date(event.dueDate)
        break
      case "task_due_date_unset":
        this.state.tasks.get(event.taskId)!.dueDate = null
        break
      case "task_deleted":
        this.state.tasks.delete(event.taskId)
        break
      case "context_created":
        this.state.contexts.set(event.contextId, {
          id: event.contextId,
          name: event.name,
          taskIDs: []
        })
        break
      case "context_renamed":
        this.state.contexts.get(event.contextId)!.name = event.name
        break
      case "context_deleted":
        this.state.contexts.delete(event.contextId)
        break
      case "task_reordered_in_context":
        const context = this.state.contexts.get(event.contextId)!
        const [ taskId ] = context.taskIDs.splice(event.oldPosition, 1)
        context.taskIDs.splice(event.newPosition, 0, taskId)
        break
    }
  }
}

import { h, render, Component } from "preact"
import { observer } from "mobx-preact"

class TodoUi {
  @observable
  contextId: ID | null = null;

  @computed
  get context(): Context | null {
    return this.contextId ? app.state.contexts.get(this.contextId)! : null
  }

  set context(context: Context | null) {
    this.contextId = context ? context.id : null
  }

  @computed
  get tasks() {
    if (this.context)
      return [...this.context.taskIDs.values()].map(id => app.state.tasks.get(id)!)
    else
      return [...app.state.tasks.values()]
  }

  get daytime(): boolean {
    const time = new Date().getHours()
    return time > 6 && time < 22
  }
}

@observer
class TodoAppView extends Component {
  render() {
    const scrollable = {
      overflow: "auto",
      flex: 1,
      minHeight: 1
    }
    return (
      <div className={"uk-flex" + (ui.daytime ? "" : " uk-light uk-background-secondary")}
        style={{ height: "100vh" }}>
        <div className={"uk-width-medium uk-flex uk-flex-column" + (ui.daytime ? " uk-background-muted" : " uk-background-secondary uk-box-shadow-xlarge")}>
          <div className="uk-logo uk-padding">
            Clean Things
          </div>
          <div className="uk-padding uk-padding-remove-right" style={scrollable}>
            <ContextListView />
          </div>
        </div>
        <div className="uk-flex-1 uk-flex uk-flex-column"
          style={{ position: "relative" }}>
          <div style={scrollable}>
            <div className="uk-padding uk-padding-remove-left uk-padding-remove-right">
              <TaskListView />
              <div className="uk-padding" />
            </div>
          </div>
          <NewTaskView />
        </div>
      </div>
    )
  }
}

@observer
class ContextListView extends Component {
  render() {
    return (
      <div>
        <div className="uk-text-meta uk-flex uk-margin-right">
          <span className="uk-flex-1">
            Contexts
          </span>
          <a href="#"
            uk-icon="plus"
            onClick={action(() => app.createContext(ui.contextId = newId("context"), "New context"))} />
        </div>
        <ul className="uk-tab uk-tab-left uk-margin-remove-top">
          <li className={ui.context ? "" : "uk-active"}>
            <a href="#"
              onClick={action(() => ui.context = null)}>
              All tasks
            </a>
          </li>
          {[...app.state.contexts.values()].map(context => (
            <li className={context === ui.context ? "uk-active" : ""}>
              <a href="#"
                onClick={action(() => ui.context = context)}>
                {context.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    )
  }
}

declare global {
  const UIkit: any;
}

@observer
class TaskListView extends Component {
  dragStart?: number

  componentDidMount() {
    const $sortable = this.base!.lastChild!
    UIkit.util.on($sortable, "start", (event: any) =>
      this.dragStart = [...$sortable.childNodes].indexOf(event.detail[1]))
    UIkit.util.on($sortable, "moved", (event: any) =>
      ui.contextId && app.reorderTaskInContext(
        ui.contextId,
        this.dragStart!,
        [...$sortable.childNodes].indexOf(event.detail[1])))
  }

  render() {
    return (
      <div>
        <form className="uk-padding uk-padding-remove-bottom"
          onSubmit={event => event.preventDefault()}>
          <input className="uk-form-blank uk-h1 uk-padding-small"
            value={ui.context ? ui.context.name : "All tasks"}
            onBlur={action((event: any) => app.renameContext(ui.contextId!, event.target.value))}
            onKeyPress={(event: any) => event.keyCode === 13 && event.target.blur()}
            disabled={!ui.context} />
        </form>
        <div uk-sortable={!!ui.context}>
          {ui.tasks.map(task =>
            <TaskView task={task} key={task.id} />
          )}
        </div>
      </div>
    )
  }
}

@observer
class TaskView extends Component<{ task: Task }> {
  render() {
    const { task } = this.props
    return (
      <div className="uk-padding uk-padding-remove-top uk-padding-remove-bottom">
        <form className="uk-grid-small uk-flex-middle"
          style={task.checked && { opacity: 0.5, textDecoration: "line-through" }}
          onSubmit={event => event.preventDefault()}
          uk-grid>
          <div>
            <input className="uk-checkbox uk-border-circle"
              type="checkbox"
              checked={task.checked}
              onChange={(event: any) =>
                app.checkTask(task.id, event.target.checked)}
              style={{
                width: "2em",
                height: "2em",
                backgroundSize: "2em",
                backgroundPosition: ".1em .1em"
              }} />
          </div>
          <div className="uk-width-expand uk-flex uk-flex-column">
            <input className="uk-input uk-form-blank"
              onBlur={(event: any) => app.renameTask(task.id, event.target.value)}
              onKeyPress={(event: any) => event.keyCode === 13 && event.target.blur()}
              value={task.name} />
            <div className="uk-text-meta uk-padding-small uk-padding-remove-top uk-grid-divider"
              uk-grid>
              <div uk-form-custom>
                  <select onChange={(event: any) => app.setTaskContext(task.id, event.target.value || null)}>
                    <option value="">(no context)</option>
                    {[...app.state.contexts.values()].map(context =>
                      <option value={context.id}
                        selected={context.taskIDs.includes(task.id)}>
                        @ {context.name}
                      </option>
                    )}
                  </select>
                  <div></div>
              </div>
              <div>
                Due: {task.dueDate ? task.dueDate.toLocaleDateString() : "never"}
              </div>
            </div>
          </div>
          <div>
            <a className="uk-icon-link"
              href="#"
              uk-icon="trash"
              onClick={event => app.deleteTask(task.id)} />
          </div>
        </form>
      </div>
    )
  }
}

@observer
class NewTaskView extends Component {
  @observable
  name = ""

  @action.bound
  onKeyPress(event: any) {
    this.name = event.target.value as string
    if (event.keyCode === 13 && this.name) {
      const id = newId("task")
      app.createTask(id, this.name)
      app.setTaskContext(id, ui.contextId)
      this.name = ""
    }
  }

  render() {
    return (
      <form className="uk-position-bottom uk-margin-bottom uk-margin-medium-left uk-margin-medium-right uk-grid-collapse"
        onSubmit={event => event.preventDefault()}
        style={{ zIndex: 2 }}
        uk-grid>
        <div className={"uk-inline uk-width-expand" + (ui.daytime ? "" : " uk-background-secondary")}>
          <span className="uk-form-icon"
            uk-icon="plus" />
          <input className="uk-input uk-box-shadow-large"
            onKeyPress={this.onKeyPress}
            placeholder="New task"
            value={this.name} />
        </div>
      </form>
    )
  }
}

const app = (window as any).app = new TodoApp()
const ui = new TodoUi()
render(<TodoAppView />, document.body)
restoreEvents()
autorun(backupEvents)

function backupEvents() {
  const events = JSON.stringify(app.events)
  localStorage.setItem("events", events)
}

function restoreEvents() {
  const events = localStorage.getItem("events")
  if (events)
    for (const event of JSON.parse(events))
      app.apply(event)
}
