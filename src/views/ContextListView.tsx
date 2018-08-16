import { action } from "mobx";
import { observer } from "mobx-preact";
import { h, Component } from "preact";
import app from "../app";
import ui from "../ui";

@observer
export default class ContextListView extends Component {
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
