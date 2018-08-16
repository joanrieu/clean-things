import { action } from "mobx";
import { observer } from "mobx-preact";
import { h, Component } from "preact";
import app from "../app";
import ui from "../ui";
import TaskListItemView from "./TaskListItemView";

@observer
export default class TaskListView extends Component {
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
