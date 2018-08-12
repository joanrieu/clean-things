type ID = string

type TodoEvent =
  | { type: "task_created", id: ID, name: string }
  | { type: "task_renamed", id: ID, name: string }
  | { type: "task_attached_to_context", taskId: ID, contextId: ID }
  | { type: "task_detached_from_context", taskId: ID, contextId: ID }
  | { type: "task_checked", id: ID }
  | { type: "task_unchecked", id: ID }
  | { type: "task_deleted", id: ID }
  | { type: "context_created", id: ID, name: string }
  | { type: "context_renamed", id: ID, name: string }
  | { type: "context_deleted", id: ID }

interface TodoState {
  tasks: Map<ID, Task>,
  contexts: Map<ID, Context>
}

interface Task {
  id: ID,
  name: string,
  checked: boolean
}

interface Context {
  id: ID,
  name: string,
  taskIDs: Set<ID>
}

import { action, autorun, observable, computed } from "mobx"

function assert(predicate: () => any) {
  if (!predicate())
    throw new Error("assertion failed: " + predicate)
}

class TodoApp {
  @action
  createTask(id: ID, name: string) {
    assert(() => !this.state.tasks.has(id))
    this.apply({ type: "task_created", id, name })
  }

  @action
  setTaskContext(taskId: ID, contextId: ID | null) {
    assert(() => this.state.tasks.has(taskId))
    for (const context of this.state.contexts.values())
      if (context.taskIDs.has(taskId))
        this.apply({ type: "task_detached_from_context", taskId, contextId: context.id })
    if (contextId) {
      assert(() => this.state.contexts.has(contextId))
      this.apply({ type: "task_attached_to_context", taskId, contextId })
    }
  }

  @action
  renameTask(id: ID, name: string) {
    assert(() => this.state.tasks.has(id))
    this.apply({ type: "task_renamed", id, name })
  }

  @action
  checkTask(id: ID, check = true) {
    assert(() => this.state.tasks.has(id))
    this.apply({
      type: check ? "task_checked" : "task_unchecked",
      id
    } as TodoEvent)
  }

  @action
  deleteTask(id: ID) {
    assert(() => this.state.tasks.has(id))
    this.apply({ type: "task_deleted", id })
  }

  @action
  createContext(id: ID, name: string) {
    assert(() => !this.state.contexts.has(id))
    this.apply({ type: "context_created", id, name })
  }

  @action
  renameContext(id: ID, name: string) {
    assert(() => this.state.contexts.has(id))
    this.apply({ type: "context_renamed", id, name })
  }

  @action
  deleteContext(id: ID, name: string) {
    assert(() => this.state.contexts.has(id))
    this.apply({ type: "context_deleted", id })
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
        this.state.tasks.set(event.id, {
          id: event.id,
          name: event.name,
          checked: false
        })
        break
      case "task_renamed":
        this.state.tasks.get(event.id)!.name = event.name
        break
      case "task_attached_to_context":
        this.state.contexts.get(event.contextId)!.taskIDs.add(event.taskId)
        break
      case "task_detached_from_context":
        this.state.contexts.get(event.contextId)!.taskIDs.delete(event.taskId)
        break
      case "task_checked":
        this.state.tasks.get(event.id)!.checked = true
        break
      case "task_unchecked":
        this.state.tasks.get(event.id)!.checked = false
        break
      case "task_deleted":
        this.state.tasks.delete(event.id)
        break
      case "context_created":
        this.state.contexts.set(event.id, {
          id: event.id,
          name: event.name,
          taskIDs: new ObservableSet()
        })
        break
      case "context_renamed":
        this.state.contexts.get(event.id)!.name = event.name
        break
      case "context_deleted":
        this.state.contexts.delete(event.id)
        break
    }
  }
}

import { h, render, Component } from "preact"
import { observer } from "mobx-preact"
import ObservableSet from "./ObservableSet";

class TodoUi {
  @observable
  context: Context | null = null;

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
        <div className="uk-text-meta">Contexts</div>
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

@observer
class TaskListView extends Component {
  @computed
  get tasks() {
    if (ui.context)
      return [...ui.context.taskIDs.values()].map(id => app.state.tasks.get(id)!)
    else
      return [...app.state.tasks.values()]
  }
  render() {
    return (
      <div>
        {this.tasks.map(task =>
          <TaskView task={task} key={task.id} />
        )}
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
            <div uk-form-custom>
                <select onChange={(event: any) => app.setTaskContext(task.id, event.target.value || null)}>
                  <option value="">(no context)</option>
                  {[...app.state.contexts.values()].map(context =>
                    <option value={context.id}
                      selected={context.taskIDs.has(task.id)}>
                      @ {context.name}
                    </option>
                  )}
                </select>
                <div className="uk-text-meta uk-padding-small uk-padding-remove-top"></div>
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
      const id = "task:" + Math.random().toString(16).slice(2)
      app.createTask(id, this.name)
      this.name = ""
    }
  }

  render() {
    return (
      <form className="uk-position-bottom uk-margin-bottom uk-margin-medium-left uk-margin-medium-right uk-grid-collapse"
        onSubmit={event => event.preventDefault()}
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

require("preact/devtools")
