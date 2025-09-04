const DevToolsComponent = require('../dev-tools/dev-tools-component');
const IndexListView = require('../dashboard/index-list-view');
const PowerUpInspector = require('../dev-tools/power-up-inspector');
const TileCounterView = require('../dev-tools/tile-counter-view');
const DataInspectorComponent = require('../dev-tools/data-inspector-component');
const CitizenRequestView = require('../dashboard/citizen-request-view');
const CitizenRequestViewMgr = require('../dashboard/citizen-request-view-mgr');
const GoalDebugView = require('../dev-tools/goal-debug-view');
const mapObject = require('../data/map-object');

function initDevTools(config, mapView, mapEditorController, stats, powerUpMgr) {
  const devTools = new DevToolsComponent();

  //
  // Status section
  //
  devTools.addSection('status', 'Status', true);
  const indexListView = new IndexListView(config, config.dashboard.status.indexes);
  indexListView.setValues(Object.fromEntries(
    Object.entries(config.dashboard.status.indexes)
      .map(([id]) => [id, 0])
  ));
  devTools.addToSection('status', indexListView.$element);
  stats.events.on('update', () => {
    indexListView.setValues(
      mapObject(
        config.dashboard.status.indexes,
        ([key, props]) => [key, stats.get(props.variable)]
      )
    );
  });

  //
  // Goals section
  //
  // devTools.addSection('goals', 'Goals');
  // const citizenRequestView = new CitizenRequestView(config);
  // devTools.addToSection('goals', citizenRequestView.$element);
  // const citizenRequestViewMgr = new CitizenRequestViewMgr(citizenRequestView);
  // citizenRequestViewMgr.handleUpdate(stats.getGoals());
  // stats.events.on('update', () => {
  //   citizenRequestViewMgr.handleUpdate(stats.getGoals());
  // });

  //
  // Power-ups section
  //
  devTools.addSection('power-ups', 'Power-Ups');
  const powerUpInspector = new PowerUpInspector(config);
  devTools.addToSection('power-ups', powerUpInspector.$element);
  powerUpInspector.events.on('power-up-change', (id, enabled) => {
    powerUpMgr.setState(id, enabled);
    stats.calculateAll();
  });

  //
  // Counters section
  //
  devTools.addSection('counters', 'Counters');
  const counterView = new TileCounterView(config);
  devTools.addToSection('counters', counterView.$element);
  stats.events.on('update', () => {
    counterView.update(stats);
  });

  // const zoneBalanceView = new ZoneBalanceView(config, {
  //   residential: 'residential-difference',
  //   commercial: 'commercial-difference',
  //   industrial: 'industrial-difference',
  // });
  // devTools.addToSection('counters', zoneBalanceView.$element);
  // stats.events.on('update', () => {
  //   zoneBalanceView.update(stats);
  // });
  // zoneBalanceView.update(stats);

  //
  // Data inspector section
  //
  devTools.addSection('data-inspector', 'Data Inspector');
  const dataInspectorComponent = new DataInspectorComponent(
    stats,
    config?.devTools?.dataInspector?.variables ?? {}
  );
  devTools.addToSection('data-inspector', dataInspectorComponent.$element);
  mapEditorController.events.on('inspect', (data) => dataInspectorComponent
    .display(data));

  //
  // Goal inspector section
  //
  devTools.addSection('goal-inspector', 'Goal Inspector');
  const goalDebugView = new GoalDebugView(stats.getGoals());
  devTools.addToSection('goal-inspector', goalDebugView.$element);
  stats.events.on('update', () => {
    goalDebugView.setValues(stats.getGoals());
  });

  return devTools.$element;
}

module.exports = initDevTools;
