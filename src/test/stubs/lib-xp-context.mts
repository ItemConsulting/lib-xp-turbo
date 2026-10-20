// Stub for "/lib/xp/context". Keeps the attributes set with `setCustomLocalAttribute()` in memory, and
// returns them from `get()` with the "custom." prefix, like Enonic XP does.
import type {
  Context,
  ContextAttributeValue,
  get as GetContext,
  setCustomLocalAttribute as SetCustomLocalAttribute,
} from "@enonic-types/lib-context";

const attributes = new Map<string, ContextAttributeValue>();

export const setCustomLocalAttribute: typeof SetCustomLocalAttribute = (name, value) => {
  if (value === null || value === undefined) {
    attributes.delete(`custom.${name}`);
  } else {
    attributes.set(`custom.${name}`, value as ContextAttributeValue);
  }
};

export const get: typeof GetContext = <Attributes extends object>() =>
  ({
    attributes: Object.fromEntries(attributes),
  }) as Context<Attributes>;
