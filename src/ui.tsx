import { observable, computed, action, autorun } from "mobx";
import { h, Component } from "preact"
import { observer } from "mobx-preact"
import app from "./app";

declare global {
  const UIkit: any
  const flatpickr: any
}

class TodoUi {
  @observable
  contextId: ID | null = null

  @computed
  get context(): Context | null {
    return this.contextId ? app.state.contexts.get(this.contextId)! : null
  }

  set context(context: Context | null) {
    this.contextId = context ? context.id : null
  }

  @computed
  get taskList() {
    if (this.context)
      return [...this.context.taskIDs.values()].map(id => app.state.tasks.get(id)!)
    else
      return [...app.state.tasks.values()]
  }

  @observable
  taskId: ID | null = null

  @computed
  get task() {
    return this.taskId ? app.state.tasks.get(this.taskId)! : null
  }

  set task(task: Task | null) {
    this.taskId = task ? task.id : null
  }

  get daytime(): boolean {
    const time = new Date().getHours()
    return time > 6 && time < 22
  }
}

const ui = new TodoUi()
export default ui;

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
        {ui.task &&
          <div className={"uk-width-medium uk-flex uk-flex-column" + (ui.daytime ? " uk-background-muted" : " uk-background-secondary uk-box-shadow-xlarge")}>
            <TaskView task={ui.task} />
          </div>
        }
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
            onClick={action(() => app.createContext(ui.contextId = app.newId("context"), "New context"))} />
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

@observer
class TaskListView extends Component {
  sortableDiv!: HTMLDivElement;
  dragStartIndex?: number

  componentDidMount() {
    UIkit.util.on(this.sortableDiv, "start", (event: any) =>
      this.dragStartIndex = [...this.sortableDiv.childNodes].indexOf(event.detail[1]))
    UIkit.util.on(this.sortableDiv, "moved", (event: any) =>
      ui.contextId && app.reorderTaskInContext(
        ui.contextId,
        this.dragStartIndex!,
        [...this.sortableDiv.childNodes].indexOf(event.detail[1])))
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
        <div uk-sortable={!!ui.context}
          ref={el => this.sortableDiv = el}>
          {ui.taskList.map(task =>
            <TaskListItemView task={task} key={task.id} />
          )}
        </div>
      </div>
    )
  }
}

@observer
abstract class BaseTaskView extends Component<{ task: Task }> {
  @computed
  get taskContext() {
    const { task } = this.props
    return [...app.state.contexts.values()]
      .find(context => context.taskIDs.includes(task.id))
  }

  @computed
  get isOverdue() {
    const { task } = this.props
    return task.dueDate && task.dueDate.getTime() - new Date(new Date().toDateString()).getTime() < 0
  }

  renderCheckbox() {
    const { task } = this.props
    return (
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
    )
  }
}

@observer
class TaskListItemView extends BaseTaskView {
  render() {
    const { task } = this.props
    return (
      <form className="uk-flex uk-flex-middle uk-padding uk-padding-remove-top uk-padding-remove-bottom uk-margin"
        onSubmit={event => event.preventDefault()}>
        <div>
          {this.renderCheckbox()}
        </div>
        <div className="uk-flex-1 uk-padding uk-padding-remove-top uk-padding-remove-bottom uk-padding-remove-right">
          {task.name}
        </div>
        <div>
          <a className={"uk-icon-button" + (task === ui.task ? " uk-invisible" : "")}
            onClick={() => ui.task = task}
            href="#"
            uk-icon="arrow-right" />
        </div>
      </form>
    )
  }
}

@observer
class TaskView extends BaseTaskView {
  dueDateInput!: HTMLInputElement

  componentDidMount() {
    flatpickr(this.dueDateInput)
  }

  render() {
    const { task } = this.props
    return (
      <div className="uk-padding">
        <form style={task.checked && { opacity: 0.5, textDecoration: "line-through" }}
          onSubmit={event => event.preventDefault()}
          uk-grid>
          <div>
            {this.renderCheckbox()}
          </div>
          <input className="uk-input"
            onBlur={(event: any) => app.renameTask(task.id, event.target.value)}
            onKeyPress={(event: any) => event.keyCode === 13 && event.target.blur()}
            value={task.name} />
          <div uk-form-custom="target: > div > input">
            <select className="uk-select"
              onChange={(event: any) => app.setTaskContext(task.id, event.target.value || null)}>
              <option className="uk-text-muted"
                value="">
                No context
              </option>
              {[...app.state.contexts.values()].map(context =>
                <option value={context.id}
                  selected={context === this.taskContext}>
                  {context.name}
                </option>
              )}
            </select>
            <div className="uk-inline">
              <span className="uk-form-icon"
                uk-icon="location" />
              <input className={"uk-input" + (this.taskContext ? "" : " uk-text-muted")} />
            </div>
          </div>
          <div>
            <div className="uk-inline">
              <span className="uk-form-icon"
                uk-icon="calendar" />
              <input className={"uk-input" + (this.isOverdue ? " uk-form-danger" : "")}
                placeholder="No due date"
                value={task.dueDate ? task.dueDate.toLocaleDateString() : ""}
                onChange={(event: any) => app.setTaskDueDate(task.id, new Date(event.target.value))}
                ref={el => this.dueDateInput = el} />
              <a className="uk-form-icon uk-form-icon-flip"
                uk-icon="close"
                onClick={() => this.dueDateInput.value = ""} />
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
      const id = app.newId("task")
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
