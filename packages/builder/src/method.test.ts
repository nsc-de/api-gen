import { string, undefinedType } from "@rster/types";
import { RsterApiMethod } from "./method";
import {
  ContextChildAction,
  ContextChildCondition,
  ContextConditionAnd,
  ContextConditionMethod,
  ContextConditionPath,
  rest,
} from "@rster/basic";
import { createSyntheticContext } from "@rster/common";

describe("RsterApiMethod", () => {
  describe("#constructor()", () => {
    it("should create a method with the given name", () => {
      const method = new RsterApiMethod(
        "test",
        [],
        { returns: undefinedType() },
        "/test",
        "get",
        (args) => {}
      );

      expect(method.name).toBe("test");
    });

    it("should create a method with the given description", () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        { returns: undefinedType() },
        "/test",
        "get",
        (args) => {}
      );

      expect(method.description).toEqual(["test description"]);
    });

    it("should create a method with the given http path", () => {
      const method = new RsterApiMethod(
        "test",
        [],
        { returns: undefinedType() },
        "/test",
        "get",
        (args) => {}
      );

      expect(method.httpPath).toBe("/test");
    });

    it("should create a method with the given http method", () => {
      const method = new RsterApiMethod(
        "test",
        [],
        { returns: undefinedType() },
        "/test",
        "get",
        (args) => {}
      );

      expect(method.httpMethod).toBe("get");
    });

    it("should create a method with the given declaration", () => {
      const method = new RsterApiMethod(
        "test",
        [],
        { returns: undefinedType() },
        "/test",
        "get",
        (args) => {}
      );

      expect(method.declaration).toEqual({ returns: undefinedType() });
    });

    it("should create a method with the given action", () => {
      const method = new RsterApiMethod(
        "test",
        [],
        { returns: undefinedType() },
        "/test",
        "get",
        (args) => {}
      );

      expect(method.action).toBeDefined();
    });
  });

  describe("#json()", () => {
    it("should return a json representation of the method", () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        { returns: undefinedType() },
        "/test",
        "get",
        (args) => {}
      );

      expect(method.json()).toEqual({
        name: "test",
        description: ["test description"],
        httpPath: "/test",
        httpMethod: "get",
        declaration: {
          expectBody: undefined,
          expectQuery: undefined,
          expectParams: undefined,
          returns: {
            type: "undefined",
          },
        },
      });
    });

    it("test with declaration for body, query and params", () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        {
          expectBody: {
            test: { type: string(), optional: false },
            test2: { type: string(), optional: true },
          },
          expectQuery: {
            test3: { type: string(), optional: false },
            test4: { type: string(), optional: true },
          },
          expectParams: {
            test5: { type: string(), optional: false },
            test6: { type: string(), optional: true },
          },
          returns: undefinedType(),
        },
        "/test",
        "get",
        (args) => {}
      );

      expect(method.json()).toEqual({
        name: "test",
        description: ["test description"],
        httpPath: "/test",
        httpMethod: "get",
        declaration: {
          expectBody: {
            test: { type: { type: "string" }, optional: false },
            test2: { type: { type: "string" }, optional: true },
          },
          expectQuery: {
            test3: { type: { type: "string" }, optional: false },
            test4: { type: { type: "string" }, optional: true },
          },
          expectParams: {
            test5: { type: { type: "string" }, optional: false },
            test6: { type: { type: "string" }, optional: true },
          },
          returns: {
            type: "undefined",
          },
        },
      });
    });
  });

  describe("#rest()", () => {
    it("should return a rest representation of the method", () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        {
          expectBody: {
            test: { type: string(), optional: false },
            test2: { type: string(), optional: true },
          },
          expectQuery: {
            test3: { type: string(), optional: false },
            test4: { type: string(), optional: true },
          },
          expectParams: {
            test5: { type: string(), optional: false },
            test6: { type: string(), optional: true },
          },
          returns: undefinedType(),
        },
        "/test",
        "get",
        (args) => {}
      );
      const api = rest(function () {
        method.rest(this);
      });

      expect(api.children).toHaveLength(1);
      expect(api.children[0].type).toBe("condition");

      const child = api.children[0] as ContextChildCondition;
      expect(child.condition).toBeInstanceOf(ContextConditionAnd);
      const condition = child.condition as ContextConditionAnd;
      expect(condition.conditions).toHaveLength(2);
      expect(condition.conditions[0]).toBeInstanceOf(ContextConditionPath);
      expect(condition.conditions[1]).toBeInstanceOf(ContextConditionMethod);

      const path = condition.conditions[0] as ContextConditionPath;
      expect(path.path).toBe("/test");
      const methodCondition = condition.conditions[1] as ContextConditionMethod;
      expect(methodCondition.method.toLowerCase()).toBe("get");

      const ctx = child.context;

      expect(ctx.description()).toEqual(["test description"]);
      expect(ctx.declaration()).toEqual({
        name: "test",
        expectBody: {
          test: { type: string(), optional: false },
          test2: { type: string(), optional: true },
        },
        expectQuery: {
          test3: { type: string(), optional: false },
          test4: { type: string(), optional: true },
        },
        expectParams: {
          test5: { type: string(), optional: false },
          test6: { type: string(), optional: true },
        },
        returnBody: undefinedType(),
      });

      expect(ctx.children).toHaveLength(1);
      expect(ctx.children[0].type).toBe("action");
    });
  });

  it("test action function to work", async () => {
    const method = new RsterApiMethod(
      "test",
      ["test description"],
      {
        returns: string(),
      },
      "/test",
      "get",
      () => {
        return "Hello from the test action 😉";
      }
    );

    const api = rest(function () {
      method.rest(this);
    });

    expect(api.children).toHaveLength(1);
    expect(api.children[0].type).toBe("condition");
    const child = api.children[0] as ContextChildCondition;
    expect(child.condition).toBeInstanceOf(ContextConditionAnd);
    const condition = child.condition as ContextConditionAnd;
    expect(condition.conditions).toHaveLength(2);
    expect(condition.conditions[0]).toBeInstanceOf(ContextConditionPath);
    expect(condition.conditions[1]).toBeInstanceOf(ContextConditionMethod);
    const pathCondition = condition.conditions[0] as ContextConditionPath;
    expect(pathCondition.path).toBe("/test");
    const methodCondition = condition.conditions[1] as ContextConditionMethod;
    expect(methodCondition.method.toLowerCase()).toBe("get");

    const ctx = child.context;

    expect(ctx.children).toHaveLength(1);
    expect(ctx.children[0].type).toBe("action");

    const { pass, promise } = createSyntheticContext({
      path: "/test",
      method: "get",
    });

    api.handle(...pass);

    const result = await promise;

    expect(result).toEqual({
      code: 200,
      data: '"Hello from the test action 😉"',
      headers: {
        "Content-Type": "application/json",
      },
      sendFile: undefined,
    });
  });

  it("test action function to work with body params", async () => {
    const method = new RsterApiMethod(
      "test",
      ["test description"],
      {
        expectBody: {
          test: { type: string(), optional: false },
          test2: { type: string(), optional: true },
        },
        returns: string(),
      },
      "/test",
      "get",
      (args) => {
        return (
          "Hello from the test action 😉 " + [args.test, args.test2].join(",")
        );
      }
    );

    const api = rest(function () {
      method.rest(this);
    });

    expect(api.children).toHaveLength(1);
    expect(api.children[0].type).toBe("condition");
    const child = api.children[0] as ContextChildCondition;
    expect(child.condition).toBeInstanceOf(ContextConditionAnd);
    const condition = child.condition as ContextConditionAnd;
    expect(condition.conditions).toHaveLength(2);
    expect(condition.conditions[0]).toBeInstanceOf(ContextConditionPath);
    expect(condition.conditions[1]).toBeInstanceOf(ContextConditionMethod);
    const pathCondition = condition.conditions[0] as ContextConditionPath;
    expect(pathCondition.path).toBe("/test");
    const methodCondition = condition.conditions[1] as ContextConditionMethod;
    expect(methodCondition.method.toLowerCase()).toBe("get");

    const ctx = child.context;

    expect(ctx.children).toHaveLength(1);
    expect(ctx.children[0].type).toBe("action");

    const { pass, promise } = createSyntheticContext({
      path: "/test",
      body: {
        test: "test",
        test2: "test2",
      },
    });

    api.handle(...pass);

    const result = await promise;

    expect(result).toEqual({
      code: 200,
      data: '"Hello from the test action 😉 test,test2"',
      headers: {
        "Content-Type": "application/json",
      },
      sendFile: undefined,
    });
  });

  it("test action function to work with query params", async () => {
    const method = new RsterApiMethod(
      "test",
      ["test description"],
      {
        expectQuery: {
          test: { type: string(), optional: false },
          test2: { type: string(), optional: true },
        },
        returns: string(),
      },
      "/test",
      "get",
      (args) => {
        return (
          "Hello from the test action 😉 " + [args.test, args.test2].join(",")
        );
      }
    );

    const api = rest(function () {
      method.rest(this);
    });

    expect(api.children).toHaveLength(1);
    expect(api.children[0].type).toBe("condition");
    const child = api.children[0] as ContextChildCondition;
    expect(child.condition).toBeInstanceOf(ContextConditionAnd);
    const condition = child.condition as ContextConditionAnd;
    expect(condition.conditions).toHaveLength(2);
    expect(condition.conditions[0]).toBeInstanceOf(ContextConditionPath);
    expect(condition.conditions[1]).toBeInstanceOf(ContextConditionMethod);
    const pathCondition = condition.conditions[0] as ContextConditionPath;
    expect(pathCondition.path).toBe("/test");
    const methodCondition = condition.conditions[1] as ContextConditionMethod;
    expect(methodCondition.method.toLowerCase()).toBe("get");

    const ctx = child.context;

    expect(ctx.children).toHaveLength(1);
    expect(ctx.children[0].type).toBe("action");

    const { pass, promise } = createSyntheticContext({
      path: "/test",
      query: {
        test: "test",
        test2: "test2",
      },
    });

    api.handle(...pass);

    const result = await promise;

    expect(result).toEqual({
      code: 200,
      data: '"Hello from the test action 😉 test,test2"',
      headers: {
        "Content-Type": "application/json",
      },
      sendFile: undefined,
    });
  });

  it("test action function to work with params", async () => {
    const method = new RsterApiMethod(
      "test",
      ["test description"],
      {
        expectParams: {
          test: { type: string(), optional: false },
          test2: { type: string(), optional: true },
        },
        returns: string(),
      },
      "/test/:test/:test2",
      "get",
      (args) => {
        return (
          "Hello from the test action 😉 " + [args.test, args.test2].join(",")
        );
      }
    );

    const api = rest(function () {
      method.rest(this);
    });

    expect(api.children).toHaveLength(1);
    expect(api.children[0].type).toBe("condition");
    const child = api.children[0] as ContextChildCondition;
    expect(child.condition).toBeInstanceOf(ContextConditionAnd);
    const condition = child.condition as ContextConditionAnd;
    expect(condition.conditions).toHaveLength(2);
    expect(condition.conditions[0]).toBeInstanceOf(ContextConditionPath);
    expect(condition.conditions[1]).toBeInstanceOf(ContextConditionMethod);
    const pathCondition = condition.conditions[0] as ContextConditionPath;
    expect(pathCondition.path).toBe("/test/:test/:test2");
    const methodCondition = condition.conditions[1] as ContextConditionMethod;
    expect(methodCondition.method.toLowerCase()).toBe("get");

    const ctx = child.context;

    expect(ctx.children).toHaveLength(1);
    expect(ctx.children[0].type).toBe("action");

    const { pass, promise } = createSyntheticContext({
      path: "/test/test/test2",
    });

    api.handle(...pass);

    const result = await promise;

    expect(result).toEqual({
      code: 200,
      data: '"Hello from the test action 😉 test,test2"',
      headers: {
        "Content-Type": "application/json",
      },
      sendFile: undefined,
    });
  });
});
