export interface TurboStreamChangeAction {
  /**
   * Action to perform
   */
  readonly action:
    | "append"
    | "prepend"
    | "replace"
    | "update"
    | "before"
    | "after";

  /**
   * Dom ID to update
   */
  readonly target: string;

  /**
   * The new content to insert into the dom
   */
  readonly content: string;
}

export interface TurboStreamRemoveAction {
  /**
   * Action to perform
   */
  readonly action: "remove";

  /**
   * Dom ID to update
   */
  readonly target: string;
}

/**
 * Type that can be serialized into a turbo stream action frame
 */
export type TurboStreamAction =
  | TurboStreamChangeAction
  | TurboStreamRemoveAction;

/**
 * Guard that verifies that an object is of type TurboStreamAction
 */
export function isTurboStreamAction(v: unknown): v is TurboStreamAction {
  const value = v as TurboStreamAction;
  return (
    v !== undefined &&
    v !== null &&
    ["append", "prepend", "replace", "update", "remove"].indexOf(
      value.action
    ) !== -1 &&
    typeof value.target === "string"
  );
}

/**
 * Serializes actions to frames that can be sent over the wire
 */
export function serialize(action: TurboStreamAction): string;
export function serialize(actions: ReadonlyArray<TurboStreamAction>): string;
export function serialize(
  actions: TurboStreamAction | ReadonlyArray<TurboStreamAction>
): string;
export function serialize(
  actions: TurboStreamAction | ReadonlyArray<TurboStreamAction>
): string {
  return actions instanceof Array
    ? actions.map(serializeOne).join("\n")
    : serializeOne(actions);
}

function serializeOne(action: TurboStreamAction): string {
  return action.action === "remove"
    ? `<turbo-stream action="remove" target="${action.target}"></turbo-stream>`
    : `
<turbo-stream action="${action.action}" target="${action.target}">
  <template>
    ${action.content}
  </template>
</turbo-stream>`.trim();
}
