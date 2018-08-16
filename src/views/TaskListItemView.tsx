import { observer } from "mobx-preact"
import { h } from "preact"
import ui from "../ui";
import BaseTaskView from "./BaseTaskView";

@observer
export default class TaskListItemView extends BaseTaskView {
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
