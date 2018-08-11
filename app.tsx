type ID = string
type TaskName = string

type TodoEvent =
  | { type: "task_created", id: ID }
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
  createTask(id: ID) {
    assert(() => !this.state.tasks.has(id))
    this.apply({ type: "task_created", id })
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
          name: "",
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

@observer
class TodoAppView extends Component<{ app: TodoApp }> {
  render() {
    const { app } = this.props
    return (
      <div className="uk-height-viewport uk-grid-collapse"
        uk-grid>
        <div className="uk-width-medium uk-background-muted uk-padding">
          <div className="uk-logo">
            Clean Things
          </div>
        </div>
        <div className="uk-width-expand uk-padding">
          {[...app.state.tasks.values()].map(task =>
            <TaskView app={app} task={task} key={task.id} />
          )}
          <NewTaskView app={app} />
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
      <form className="uk-form-large uk-grid-collapse"
        onSubmit={event => event.preventDefault()}
        uk-grid>
        <div className="uk-width-auto uk-margin-right">
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
          <button className="uk-icon-link"
            uk-icon="trash"
            onClick={event => (app.deleteTask(task.id), event.preventDefault())} />
        </div>
      </form>
    )
  }
}

@observer
class NewTaskView extends Component<{ app: TodoApp }> {
  @observable
  name = ""

  @action.bound
  onKeyPress(event: any) {
    this.name = event.target.value as string
    if (event.keyCode === 13 && this.name) {
      const { app } = this.props
      const id = "task:" + Math.random().toString(16).slice(2)
      app.createTask(id)
      app.renameTask(id, this.name)
      this.name = ""
    }
  }

  render() {
    return (
      <form className="uk-margin-top uk-grid-collapse"
        onSubmit={event => event.preventDefault()}
        uk-grid>
        <div className="uk-inline uk-width-expand">
          <span className="uk-form-icon"
            uk-icon="plus" />
          <input className="uk-input"
            onKeyPress={this.onKeyPress}
            placeholder="New task"
            value={this.name} />
        </div>
      </form>
    )
  }
}

const app = (window as any).app = new TodoApp()
render(<TodoAppView app={app} />, document.body)
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
