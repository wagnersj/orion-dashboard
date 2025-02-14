import React from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { CloseFilled16 } from '@carbon/icons-react';
import { Backend } from '../../utils/queryServer';
import { BackendContext } from '../../BackendContext';

import {
  SideNav,
  StructuredListWrapper,
  StructuredListHead,
  StructuredListBody,
  StructuredListRow,
  StructuredListInput,
  StructuredListCell,
  Search,
} from 'carbon-components-react';

import { settings } from 'carbon-components';

const { prefix } = settings;

export class ExperimentNavBar extends React.Component {
  static contextType = BackendContext;
  constructor(props) {
    // prop: onSelectExperiment: function(experiment)
    super(props);
    this.state = {
      experiments: null,
      search: '',
    };
    this.onSearch = this.onSearch.bind(this);
    this.onUnselect = this.onUnselect.bind(this);
  }
  render() {
    return (
      <SideNav
        isFixedNav
        expanded={true}
        isChildOfHeader={false}
        aria-label="Side navigation">
        <StructuredListWrapper selection>
          <StructuredListHead>
            <StructuredListRow head>
              <StructuredListCell head>{''}</StructuredListCell>
              <StructuredListCell head>Experiment</StructuredListCell>
              <StructuredListCell head>Status</StructuredListCell>
            </StructuredListRow>
          </StructuredListHead>
          <StructuredListBody>
            {this.renderExperimentsList()}
          </StructuredListBody>
        </StructuredListWrapper>
        <Search
          placeholder="Search experiment"
          labelText="Search experiment"
          onChange={this.onSearch}
        />
      </SideNav>
    );
  }
  renderExperimentsList() {
    if (this.state.experiments === null)
      return this.renderMessageRow('Loading experiments ...');
    if (!this.state.experiments.length)
      return this.renderMessageRow('No experiment available');
    // Apply search.
    let experiments;
    if (this.state.search.length) {
      // String to search
      experiments = this.state.experiments.filter(
        experiment => experiment.toLowerCase().indexOf(this.state.search) >= 0
      );
      if (!experiments.length)
        return this.renderMessageRow('No matching experiment');
    } else {
      // No string to search, display all experiments
      experiments = this.state.experiments;
    }
    return experiments.map((experiment, i) => (
      <StructuredListRow label key={`row-${i}`}>
        <StructuredListInput
          id={`select-experiment-${i}`}
          value={`row-${i}`}
          title={`row-${i}`}
          name="select-experiment"
          onChange={() => this.props.onSelectExperiment(experiment)}
        />
        <StructuredListCell>
          <span
            title={`unselect experiment '${experiment}'`}
            style={{
              visibility:
                this.context.experiment === experiment ? 'visible' : 'hidden',
            }}
            onClick={event =>
              this.onUnselect(event, experiment, `select-experiment-${i}`)
            }>
            <CloseFilled16
              className={`${prefix}--structured-list-svg`}
              aria-label="unselect experiment">
              <title>unselect experiment</title>
            </CloseFilled16>
          </span>
        </StructuredListCell>
        <StructuredListCell>
          [{i + 1}] {experiment}
        </StructuredListCell>
        <StructuredListCell>
          <ProgressBar>
            <ProgressBar variant="success" now={35} key={1} />
            <ProgressBar variant="warning" now={20} key={2} />
            <ProgressBar variant="danger" now={10} key={3} />
            <ProgressBar variant="info" now={15} key={4} />
          </ProgressBar>
        </StructuredListCell>
      </StructuredListRow>
    ));
  }
  renderMessageRow(message) {
    return (
      <StructuredListRow>
        <StructuredListCell />
        <StructuredListCell>{message}</StructuredListCell>
        <StructuredListCell />
      </StructuredListRow>
    );
  }
  componentDidMount() {
    const backend = new Backend(this.context.address);
    backend
      .query('experiments')
      .then(results => {
        const experiments = results.map(experiment => experiment.name);
        experiments.sort();
        this.setState({ experiments });
      })
      .catch(error => {
        this.setState({ experiments: [] });
      });
  }
  onSearch(event) {
    this.setState({ search: event.target.value.toLowerCase() });
  }
  onUnselect(event, experiment, inputID) {
    /*
     * By default, a click anywhere in experiment line (including on cross icon)
     * will select the experiment.
     * Here, we want to click on cross icon to deselect experiment.
     * So, we must prevent click on cross icon to act like click on experiment
     * line.
     * To do that, we call event's preventDefault() method to cancel default
     * behavior.
     * */
    event.preventDefault();
    /*
     * Uncheck hidden radiobutton input associated to selected experiment.
     * This is necessary to allow to immediately click again to experiment
     * line to re-select experiment.
     * */
    document.getElementById(inputID).checked = false;
    /*
     * Tell global interface to unselect experiment
     * */
    this.props.onSelectExperiment(null);
  }
}

export default ExperimentNavBar;
