export const actionNames = ["append", "prepend", "replace", "update", "before", "after", "remove", "refresh"] as const;

export type TurboStreamChangeAction = {
  /**
   * Action to perform
   */
  readonly action: Exclude<(typeof actionNames)[number], "remove" | "refresh">;

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
   * Dom ID to update
   */
  readonly requestId?: string;
};

/**
 * Type that can be serialized into a turbo stream action frame
 */
export type TurboStreamAction = TurboStreamChangeAction | TurboStreamRemoveAction | TurboStreamRefreshAction;

/**
 * Guard that verifies that an object is of type TurboStreamAction
 */
export function isTurboStreamAction(v: unknown): v is TurboStreamAction {
  const value = v as TurboStreamAction;

  return (
    v !== undefined &&
    v !== null &&
    actionNames.indexOf(value.action) !== -1 &&
    (value.action === "refresh" || typeof value.target === "string")
  );
}

/**
 * Serializes actions to frames that can be sent over the wire
 */
export function serialize(action: TurboStreamAction): string;
export function serialize(actions: ReadonlyArray<TurboStreamAction>): string;
export function serialize(actions: TurboStreamAction | ReadonlyArray<TurboStreamAction>): string;
export function serialize(actions: TurboStreamAction | ReadonlyArray<TurboStreamAction>): string {
  return actions instanceof Array ? actions.map(serializeOne).join("\n") : serializeOne(actions);
}

function serializeOne(action: TurboStreamAction): string {
  switch (action.action) {
    case "remove":
      return action.target
        ? `<turbo-stream action="remove" target="${action.target}"></turbo-stream>`
        : `<turbo-stream action="remove" targets="${action.targets}"></turbo-stream>`;

    case "refresh":
      return action.requestId
        ? `<turbo-stream action="refresh" request-id="${action.requestId}"></turbo-stream>`
        : `<turbo-stream action="refresh"></turbo-stream>`;

    case "append":
    case "prepend":
    case "replace":
    case "update":
    case "before":
    case "after":
      return action.target
        ? `
<turbo-stream action="${action.action}" target="${action.target}">
  <template>
    ${action.content}
  </template>
</turbo-stream>`.trim()
        : `
<turbo-stream action="${action.action}" targets="${action.targets}">
  <template>
    ${action.content}
  </template>
</turbo-stream>`.trim();
    default:
      return "";
  }
}
