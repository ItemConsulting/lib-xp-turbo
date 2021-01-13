export interface TurboStreamUpdateAction {
  /**
   * Action to perform
   */
  readonly action: "append" | "prepend" | "replace";

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
export type TurboStreamAction = TurboStreamUpdateAction | TurboStreamRemoveAction;

/**
 * Guard that verifies that an object is of type TurboStreamAction
 */
export function isTurboStreamAction(v: unknown): v is TurboStreamAction {
  const value = (v as TurboStreamAction);
  return ["append",  "prepend", "replace", "remove"].indexOf(value.action) !== -1
    && typeof value.target === "string";
}

/**
 * Serializes actions to frames that can be sent over the wire
 */
export function serialize(params: TurboStreamAction): string {
  return (params.action === "remove")
    ? `<turbo-stream action="remove" target="${params.target}"></turbo-stream>`
    : `<turbo-stream action="${params.action}" target="${params.target}">
        <template>
          ${params.content}
        </template>
      </turbo-stream>`
}
