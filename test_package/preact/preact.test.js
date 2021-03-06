import { h } from "preact";
/** @jsx h */
import { deep } from "preact-render-spy";

// Package exports ui/
import { Render } from "../../dist/components/Render";
import { AsciiTable } from "../../dist/components/AsciiTable";
import { Chart } from "../../dist/components/Chart";
import { Cypher } from "../../dist/components/Cypher";
import { DesktopIntegration } from "../../dist/components/DesktopIntegration";
import { DriverProvider } from "../../dist/components/DriverProvider";
import { CypherEditor } from "../../dist/components/Editor";
import { GraphAppBase } from "../../dist/components/GraphAppBase";

// Package exports lib/
import { shallowEqual } from "../../dist/lib/utils";
import { resultHasRows } from "../../dist/lib/boltTransforms";

// components
test("Render works", () => {
  const context = deep(
    <Render if={true}>
      <p>Hello</p>
    </Render>
  );
  expect(context.output()).toMatchSnapshot();
});
test("AsciiTable works", () => {
  const data = [["x"], ["y"]];
  const context = deep(<AsciiTable data={data} />);
  context.rerender();
  expect(context.text()).toMatchSnapshot();
});
test("Chart works", () => {
  const data = [{ label: "Used", value: 30 }, { label: "Free", value: 20 }];
  const context = deep(
    <Chart
      data={data}
      title="Static circular data"
      chartType="doughnut"
      type="json"
    />
  );
  expect(context.output()).toMatchSnapshot();
});
test("CypherEditor works", () => {
  const context = deep(<CypherEditor />);
  expect(context.output()).toMatchSnapshot();
});
test("Cypher works", () => {
  const context = deep(
    <Cypher
      driver={resolvingDriver(0, "no!")}
      query="RETURN rand() as n"
      render={({ pending, error, result, tick }) => {
        return pending ? "pending" : error ? error.message : result;
      }}
    />
  );
  expect(context.output()).toMatchSnapshot();
});
test("DesktopIntegration works", () => {
  const context = deep(<DesktopIntegration integrationPoint={true} />);
  expect(context.output()).toMatchSnapshot();
});
test("DriverProvider works", () => {
  const context = deep(
    <DriverProvider driver={resolvingDriver(0, "yes")}>Hello</DriverProvider>
  );
  expect(context.output()).toMatchSnapshot();
});
test("GraphAppBase works", () => {
  const context = deep(
    <GraphAppBase
      integrationPoint={null}
      render={() => <p>Hello</p>}
      driverFactory={{ driver: () => resolvingDriver(0, "yes") }}
    />
  );
  expect(context.output()).toMatchSnapshot();
});

// Utils
test("shallowEqual works", () => {
  expect(shallowEqual({ x: 1 }, { x: 1 })).toBeTruthy();
});
test("resultHasRows works", () => {
  expect(resultHasRows({ result: { records: [{ x: 1 }] } })).toBeTruthy();
});

// Helpers
const sleep = (secs, shouldResolve = true, message) =>
  new Promise((resolve, reject) => {
    setTimeout(
      () => (shouldResolve ? resolve(message) : reject(new Error(message))),
      secs * 1000
    );
  });

const driver = (shouldResolve = true, waitSecs = 0, message = "") => ({
  session: () => ({
    close: () => {},
    run: () => sleep(waitSecs, shouldResolve, message)
  })
});

const resolvingDriver = (waitSecs = 0, resolveTo = "Resolved") =>
  driver(true, waitSecs, resolveTo);
