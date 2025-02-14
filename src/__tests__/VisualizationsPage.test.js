import React from 'react';
import App from '../App';
import { ApolloProvider } from 'react-apollo';
import { HashRouter as Router } from 'react-router-dom';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Since I updated dependencies in package.json, this seems necessary.
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

test('Test if we switch to visualization page', async () => {
  // Load page
  render(
    <Router>
      <App />
    </Router>
  );
  // Let time for ExperimentNavBar to load experiments
  // to prevent warnings about async calls not terminated
  expect(await screen.findByText(/2-dim-shape-exp/)).toBeInTheDocument();

  // Make sure we are on default (landing) page
  expect(screen.queryByText(/Landing Page/)).toBeInTheDocument();

  // Make sure we are not on visualizations page
  expect(screen.queryByText(/Nothing to display/)).toBeNull();

  // Get visualizations page link
  const menu = screen.queryByText(/Visualizations/);
  expect(menu).toBeInTheDocument();

  // CLick on visualizations page link
  fireEvent.click(menu);

  // Check we are on visualizations page
  const elements = await screen.findAllByText(/Nothing to display/);
  expect(elements.length).toBe(3);
});

test('Test if we can select and unselect experiments', async () => {
  // Load page
  render(
    <Router>
      <App />
    </Router>
  );
  const experiment = await screen.findByText(/2-dim-shape-exp/);
  expect(experiment).toBeInTheDocument();

  // Switch to visualizations page
  const menu = screen.queryByText(/Visualizations/);
  fireEvent.click(menu);
  expect((await screen.findAllByText(/Nothing to display/)).length).toBe(3);

  // Select an experiment
  fireEvent.click(experiment);

  // Check if plots are loaded
  // Wait enough (3 seconds) to let plots load
  await waitFor(
    () => {
      expect(
        screen.queryByText(/Regret for experiment '2-dim-shape-exp'/)
      ).toBeInTheDocument();
    },
    { timeout: 3000 }
  );
  expect(
    await screen.findByText(
      /Parallel Coordinates PLot for experiment '2-dim-shape-exp'/i
    )
  ).toBeInTheDocument();
  expect(
    await screen.findByText(/LPI for experiment '2-dim-shape-exp'/)
  ).toBeInTheDocument();

  // Unselect experiment
  const span = screen.queryByTitle(/unselect experiment '2-dim-shape-exp'/);
  expect(span).toBeInTheDocument();
  expect(span.tagName.toLowerCase()).toBe('span');
  fireEvent.click(span);
  expect((await screen.findAllByText(/Nothing to display/)).length).toBe(3);
  expect(
    screen.queryByText(/Regret for experiment '2-dim-shape-exp'/)
  ).toBeNull();
  expect(
    screen.queryByText(
      /Parallel Coordinates PLot for experiment '2-dim-shape-exp'/i
    )
  ).toBeNull();
  expect(screen.queryByText(/LPI for experiment '2-dim-shape-exp'/)).toBeNull();

  // re-select experiment and check if plots are loaded
  fireEvent.click(experiment);
  await waitFor(
    () => {
      expect(
        screen.queryByText(/Regret for experiment '2-dim-shape-exp'/)
      ).toBeInTheDocument();
    },
    { timeout: 3000 }
  );
  expect(
    await screen.findByText(
      /Parallel Coordinates PLot for experiment '2-dim-shape-exp'/i
    )
  ).toBeInTheDocument();
  expect(
    await screen.findByText(/LPI for experiment '2-dim-shape-exp'/)
  ).toBeInTheDocument();

  // Select another experiment and check if plots are loaded
  const anotherExperiment = await screen.findByText(/tpe-rosenbrock/);
  expect(anotherExperiment).toBeInTheDocument();
  fireEvent.click(anotherExperiment);
  await waitFor(
    () => {
      expect(
        screen.queryByText(/Regret for experiment 'tpe-rosenbrock'/)
      ).toBeInTheDocument();
    },
    { timeout: 3000 }
  );
  expect(
    await screen.findByText(
      /Parallel Coordinates PLot for experiment 'tpe-rosenbrock'/i
    )
  ).toBeInTheDocument();
  expect(
    await screen.findByText(/LPI for experiment 'tpe-rosenbrock'/)
  ).toBeInTheDocument();
});
