type ID = string
type TaskName = string

type TodoEvent =
  | { type: "task_created", id: ID, name: TaskName }
  | { type: "task_renamed", id: ID, name: TaskName }
  | { type: "task_checked", id: ID }
  | { type: "task_unchecked", id: ID }
  | { type: "task_deleted", id: ID }

interface TodoState {
  tasks: Map<ID, Task>
}

interface Task {
  id: ID,
  name: TaskName,
  checked: boolean
}

import { action, autorun, observable } from "mobx"

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
  renameTask(id: ID, name: TaskName) {
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

  @observable
  state: TodoState = {
    tasks: new Map()
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
      case "task_checked":
        this.state.tasks.get(event.id)!.checked = true
        break
      case "task_unchecked":
        this.state.tasks.get(event.id)!.checked = false
        break
      case "task_deleted":
        this.state.tasks.delete(event.id)
        break
    }
  }
}

import { h, render, Component } from "preact"
import { observer } from "mobx-preact"

class TodoUi {
  get daytime(): boolean {
    const time = new Date().getHours()
    return time > 6 && time < 22
  }
}

@observer
class TodoAppView extends Component<{ app: TodoApp, ui: TodoUi }> {
  render() {
    const { app, ui } = this.props
    return (
      <div className={"uk-flex" + (ui.daytime ? "" : " uk-light uk-background-secondary")}>
        <div className={"uk-width-medium uk-padding" + (ui.daytime ? " uk-background-muted" : " uk-background-secondary uk-box-shadow-xlarge")}>
          <div className="uk-logo">
            Clean Things
          </div>
        </div>
        <div className="uk-width-expand"
          style={{ height: "100vh", position: "relative" }}>
          <div className="uk-height-1-1 uk-overflow-auto uk-padding uk-padding-remove-left uk-padding-remove-right">
            {[...app.state.tasks.values()].map(task =>
              <TaskView app={app} task={task} key={task.id} />
            )}
            <div className="uk-padding" />
          </div>
          <NewTaskView app={app} ui={ui} />
        </div>
      </div>
    )
  }
}

@observer
class TaskView extends Component<{ app: TodoApp, task: Task }> {
  render() {
    const { app, task } = this.props
    return (
      <div className="uk-padding uk-padding-remove-top uk-padding-remove-bottom">
        <form className="uk-form-large uk-grid-small"
          onSubmit={event => event.preventDefault()}
          uk-grid>
          <div className="uk-width-auto">
            <input className="uk-checkbox"
              type="checkbox"
              checked={task.checked}
              onChange={(event: any) =>
                app.checkTask(task.id, event.target.checked)} />
          </div>
          <div className="uk-width-expand">
            <input className={"uk-input uk-form-blank"}
              style={task.checked && { opacity: 0.5, textDecoration: "line-through" }}
              onBlur={(event: any) => app.renameTask(task.id, event.target.value)}
              onKeyPress={(event: any) => event.keyCode === 13 && event.target.blur()}
              value={task.name} />
          </div>
          <div className="uk-width-auto">
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
class NewTaskView extends Component<{ app: TodoApp, ui: TodoUi }> {
  @observable
  name = ""

  @action.bound
  onKeyPress(event: any) {
    this.name = event.target.value as string
    if (event.keyCode === 13 && this.name) {
      const { app } = this.props
      const id = "task:" + Math.random().toString(16).slice(2)
      app.createTask(id, this.name)
      this.name = ""
    }
  }

  render() {
    const { ui } = this.props
    return (
      <form className="uk-position-bottom uk-margin-bottom uk-margin-medium-left uk-margin-medium-right uk-grid-collapse"
        onSubmit={event => event.preventDefault()}
        uk-grid>
        <div className={"uk-inline uk-width-expand" + ( ui.daytime ? "" : " uk-background-secondary")}>
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
render(<TodoAppView app={app} ui={ui} />, document.body)
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
