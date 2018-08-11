type ID = string
type TaskName = string

type TodoEvent =
  | { type: "task_created", id: ID }
  | { type: "task_renamed", id: ID, name: TaskName }
  | { type: "task_checked", id: ID }
  | { type: "task_deleted", id: ID }

interface TodoState {
  tasks: Map<ID, Task>
}

interface Task {
  id: ID,
  name: TaskName,
  checked: boolean
}

import { action, observable } from "mobx"

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
  checkTask(id: ID) {
    assert(() => this.state.tasks.has(id))
    this.apply({ type: "task_checked", id })
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

  private apply(event: TodoEvent) {
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
      case "task_deleted":
        this.state.tasks.delete(event.id)
        break
    }
  }
}

import { h, render, Component } from "preact"
import { observer } from "mobx-preact"

const app = (window as any).app = new TodoApp()

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
        <div className="uk-width-expand uk-padding">{
          [...app.state.tasks.values()].map(task =>
            <TaskView app={app} task={task} />
          )
        }</div>
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
            checked={task.checked} />
        </div>
        <div className="uk-width-expand">
          <input className="uk-input uk-form-blank"
            value={task.name} />
        </div>
      </form>
    )
  }
}

render(<TodoAppView app={app} />, document.body)
