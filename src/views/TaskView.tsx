import { observer } from "mobx-preact"
import { h } from "preact"
import app from "../app";
import BaseTaskView from "./BaseTaskView";

@observer
export default class TaskView extends BaseTaskView {
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
