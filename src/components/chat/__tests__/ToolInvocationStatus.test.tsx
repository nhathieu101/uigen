import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationStatus, getToolLabel } from "../ToolInvocationStatus";

afterEach(() => {
  cleanup();
});

test("str_replace_editor create shows 'Created' when result state", () => {
  render(
    <ToolInvocationStatus
      toolInvocation={{
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "create", path: "/components/Counter.jsx" },
        result: "Success",
      }}
    />
  );

  expect(screen.getByText("Created Counter.jsx")).toBeDefined();
  expect(screen.getByTestId("status-complete")).toBeDefined();
});

test("str_replace_editor create shows 'Creating' when call state", () => {
  render(
    <ToolInvocationStatus
      toolInvocation={{
        toolName: "str_replace_editor",
        state: "call",
        args: { command: "create", path: "/components/Counter.jsx" },
      }}
    />
  );

  expect(screen.getByText("Creating Counter.jsx")).toBeDefined();
  expect(screen.getByTestId("status-loading")).toBeDefined();
});

test("str_replace_editor str_replace shows 'Edited' when result state", () => {
  render(
    <ToolInvocationStatus
      toolInvocation={{
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "str_replace", path: "/src/App.jsx" },
        result: "Success",
      }}
    />
  );

  expect(screen.getByText("Edited App.jsx")).toBeDefined();
});

test("str_replace_editor str_replace shows 'Editing' when call state", () => {
  render(
    <ToolInvocationStatus
      toolInvocation={{
        toolName: "str_replace_editor",
        state: "call",
        args: { command: "str_replace", path: "/src/App.jsx" },
      }}
    />
  );

  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("str_replace_editor view shows 'Read' when result state", () => {
  render(
    <ToolInvocationStatus
      toolInvocation={{
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "view", path: "/src/utils.ts" },
        result: "file contents",
      }}
    />
  );

  expect(screen.getByText("Read utils.ts")).toBeDefined();
});

test("str_replace_editor insert shows 'Editing' when call state", () => {
  render(
    <ToolInvocationStatus
      toolInvocation={{
        toolName: "str_replace_editor",
        state: "call",
        args: { command: "insert", path: "/src/App.jsx" },
      }}
    />
  );

  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("file_manager delete shows 'Deleted' when result state", () => {
  render(
    <ToolInvocationStatus
      toolInvocation={{
        toolName: "file_manager",
        state: "result",
        args: { command: "delete", path: "/src/old-file.ts" },
        result: "Success",
      }}
    />
  );

  expect(screen.getByText("Deleted old-file.ts")).toBeDefined();
});

test("file_manager delete shows 'Deleting' when call state", () => {
  render(
    <ToolInvocationStatus
      toolInvocation={{
        toolName: "file_manager",
        state: "call",
        args: { command: "delete", path: "/src/old-file.ts" },
      }}
    />
  );

  expect(screen.getByText("Deleting old-file.ts")).toBeDefined();
});

test("file_manager rename shows paths when result state", () => {
  render(
    <ToolInvocationStatus
      toolInvocation={{
        toolName: "file_manager",
        state: "result",
        args: { command: "rename", path: "/src/old.ts", new_path: "/src/new.ts" },
        result: "Success",
      }}
    />
  );

  expect(screen.getByText("Renamed old.ts → new.ts")).toBeDefined();
});

test("file_manager rename shows 'Renaming' when call state", () => {
  render(
    <ToolInvocationStatus
      toolInvocation={{
        toolName: "file_manager",
        state: "call",
        args: { command: "rename", path: "/src/old.ts", new_path: "/src/new.ts" },
      }}
    />
  );

  expect(screen.getByText("Renaming old.ts")).toBeDefined();
});

test("unknown tool falls back to displaying toolName", () => {
  render(
    <ToolInvocationStatus
      toolInvocation={{
        toolName: "some_unknown_tool",
        state: "result",
        args: { foo: "bar" },
        result: "done",
      }}
    />
  );

  expect(screen.getByText("some_unknown_tool")).toBeDefined();
});

test("shows spinner for in-progress state", () => {
  render(
    <ToolInvocationStatus
      toolInvocation={{
        toolName: "str_replace_editor",
        state: "call",
        args: { command: "create", path: "/test.tsx" },
      }}
    />
  );

  expect(screen.getByTestId("status-loading")).toBeDefined();
  expect(screen.queryByTestId("status-complete")).toBeNull();
});

test("shows green dot for completed state", () => {
  render(
    <ToolInvocationStatus
      toolInvocation={{
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "create", path: "/test.tsx" },
        result: "ok",
      }}
    />
  );

  expect(screen.getByTestId("status-complete")).toBeDefined();
  expect(screen.queryByTestId("status-loading")).toBeNull();
});

test("displays full path in title attribute for hover tooltip", () => {
  const { container } = render(
    <ToolInvocationStatus
      toolInvocation={{
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "create", path: "/src/components/Counter.jsx" },
        result: "ok",
      }}
    />
  );

  const wrapper = container.firstElementChild as HTMLElement;
  expect(wrapper.getAttribute("title")).toBe("/src/components/Counter.jsx");
});

test("getToolLabel returns toolName when args is null", () => {
  const result = getToolLabel("str_replace_editor", null, true);
  expect(result.text).toBe("str_replace_editor");
});
