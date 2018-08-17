import { observer } from "mobx-preact"
import { h } from "preact"
import app from "../app";
import BaseTaskView from "./BaseTaskView";

@observer
export default class TaskView extends BaseTaskView {
  taskNameArea!: HTMLTextAreaElement
  dueDateInput!: HTMLInputElement

  componentDidMount() {
    this.updateTaskNameAreaHeight()
    flatpickr(this.dueDateInput)
  }

  updateTaskNameAreaHeight() {
    requestAnimationFrame(() => {
      const ta = this.taskNameArea
      ta.value = ta.value.replace(/\n/g, "")
      ta.style.height = "0px"
      ta.style.height = ta.offsetHeight - ta.clientHeight + ta.scrollHeight + "px"
    })
  }

  render() {
    const { task } = this.props
    return (
      <form className="uk-flex uk-flex-column uk-flex-middle uk-padding"
        style={task.checked && { opacity: 0.5, textDecoration: "line-through" }}
        onSubmit={event => event.preventDefault()}>
        <div className="uk-margin">
          {this.renderCheckbox()}
        </div>
        <textarea className="uk-textarea uk-margin"
          ref={el => this.taskNameArea = el}
          onInput={() => this.updateTaskNameAreaHeight()}
          onBlur={(event: any) => app.renameTask(task.id, event.target.value)}
          onKeyPress={(event: any) => event.keyCode === 13 && event.target.blur()}
          value={task.name}
          style={{ resize: "none" }} />
        <div className="uk-margin"
          uk-form-custom="target: > div > input">
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
        <div className="uk-margin">
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
        <div className="uk-margin">
          <a className="uk-icon-link"
            href="#"
            uk-icon="trash"
            onClick={event => app.deleteTask(task.id)} />
        </div>
      </form>
    )
  }
}
