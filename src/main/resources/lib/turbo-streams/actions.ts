export const NAMES_ACTIONS = [
  "append",
  "prepend",
  "replace",
  "update",
  "before",
  "after",
  "remove",
  "refresh",
] as const;

export type TurboStreamChangeAction = {
  /**
   * Action to perform
   */
  readonly action: Exclude<(typeof NAMES_ACTIONS)[number], "remove" | "refresh" | "replace" | "update">;

  /**
   * Dom ID to update
   */
  readonly target?: string;

  /**
   * CSS Query selector to update
   */
  readonly targets?: string;

  /**
   * The new content to insert into the dom
   */
  readonly content: string;
};

export type TurboStreamMorphableAction = {
  /**
   * Action to perform
   */
  readonly action: "replace" | "update";

  /**
   * Dom ID to update
   */
  readonly target?: string;

  /**
   * CSS Query selector to update
   */
  readonly targets?: string;

  /**
   * The new content to insert into the dom
   */
  readonly content: string;

  /**
   * Set to "morph" to morph the target instead of replacing it: "replace" morphs the target element itself, and
   * "update" morphs its children.
   */
  readonly method?: "morph";
};

export type TurboStreamRemoveAction = {
  /**
   * Action to perform
   */
  readonly action: "remove";

  /**
   * Dom ID to update
   */
  readonly target?: string;

  /**
   * CSS Query selector to update
   */
  readonly targets?: string;
};

export type TurboStreamRefreshAction = {
  /**
   * Action to perform
   */
  readonly action: "refresh";

  /**
   * Id of the request that caused the refresh. Turbo ignores the refresh in the browser that made that request.
   */
  readonly requestId?: string;

  /**
   * How the page is refreshed. Overrides the page's `<meta name="turbo-refresh-method">`.
   */
  readonly method?: "morph" | "replace";

  /**
   * Whether the scroll position is kept. Overrides the page's `<meta name="turbo-refresh-scroll">`.
   */
  readonly scroll?: "preserve" | "reset";
};

/**
 * Type that can be serialized into a turbo stream action frame
 */
export type TurboStreamAction =
  | TurboStreamChangeAction
  | TurboStreamRemoveAction
  | TurboStreamRefreshAction
  | TurboStreamMorphableAction;

/**
 * Guard that verifies that an object is of type TurboStreamAction
 */
export function isTurboStreamAction(v: unknown): v is TurboStreamAction {
  const value = v as TurboStreamAction;

  return (
    v !== undefined &&
    v !== null &&
    NAMES_ACTIONS.indexOf(value.action) !== -1 &&
    (value.action === "refresh" || typeof value.target === "string")
  );
}

/**
 * Serializes actions to frames that can be sent over the wire
 */
export function serialize(actions: TurboStreamAction | TurboStreamAction[]): string {
  return Array.isArray(actions) ? actions.map(serializeOne).join("\n") : serializeOne(actions);
}

function serializeOne(action: TurboStreamAction): string {
  switch (action.action) {
    case "remove":
      return `<turbo-stream${serializeAttributes([["action", "remove"], ...targetAttributes(action)])}></turbo-stream>`;

    case "refresh":
      return `<turbo-stream${serializeAttributes([
        ["action", "refresh"],
        ["request-id", action.requestId],
        ["method", action.method],
        ["scroll", action.scroll],
      ])}></turbo-stream>`;

    case "append":
    case "prepend":
    case "replace":
    case "update":
    case "before":
    case "after":
      return `
<turbo-stream${serializeAttributes([
        ["action", action.action],
        ...targetAttributes(action),
        ["method", action.action === "replace" || action.action === "update" ? action.method : undefined],
      ])}>
  <template>
    ${action.content}
  </template>
</turbo-stream>`.trim();

    default:
      return "";
  }
}

type Attribute = [name: string, value: string | undefined];

/**
 * Uses `target` when it is set, and falls back to `targets`
 */
function targetAttributes(action: { target?: string; targets?: string }): Attribute[] {
  return action.target ? [["target", action.target]] : [["targets", action.targets]];
}

/**
 * Serializes attributes as ` name="value"`, skipping attributes without a value
 */
function serializeAttributes(attributes: Attribute[]): string {
  return attributes
    .filter((attribute): attribute is [string, string] => attribute[1] !== undefined && attribute[1] !== "")
    .map(([name, value]) => ` ${name}="${escapeAttribute(value)}"`)
    .join("");
}

/**
 * Escapes a value so it can't break out of a double-quoted HTML attribute
 */
function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
