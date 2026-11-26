const getSlotDefinitions = (capability = {}) => capability?.slots || {};

const getSlotDefaultValue = (slot = {}) =>
  Object.prototype.hasOwnProperty.call(slot, 'defaultValue')
    ? slot.defaultValue
    : null;

export const normalizeCapabilitySlots = ({ capability = {}, slots = {} }) => {
  const definitions = getSlotDefinitions(capability);

  return Object.keys(definitions).reduce((acc, key) => {
    const slot = definitions[key] || {};
    const rawValue = Object.prototype.hasOwnProperty.call(slots || {}, key)
      ? slots[key]
      : getSlotDefaultValue(slot);

    acc[key] =
      typeof slot.normalize === 'function'
        ? slot.normalize(rawValue, {
            key,
            capability,
            slots,
          })
        : rawValue;

    if (typeof acc[key] === 'undefined') {
      acc[key] = getSlotDefaultValue(slot);
    }

    return acc;
  }, {});
};

export const mergeCapabilitySlots = ({
  capability = {},
  currentSlots = {},
  nextSlots = {},
}) =>
  normalizeCapabilitySlots({
    capability,
    slots: Object.keys(getSlotDefinitions(capability)).reduce((acc, key) => {
      if (Object.prototype.hasOwnProperty.call(nextSlots || {}, key)) {
        acc[key] = nextSlots[key];
      } else if (
        Object.prototype.hasOwnProperty.call(currentSlots || {}, key)
      ) {
        acc[key] = currentSlots[key];
      } else {
        acc[key] = getSlotDefaultValue(getSlotDefinitions(capability)[key]);
      }

      return acc;
    }, {}),
  });

export const pickCapabilitySlotPatch = ({ capability = {}, args = {} }) =>
  Object.keys(getSlotDefinitions(capability)).reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(args || {}, key)) {
      acc[key] = args[key];
    }

    return acc;
  }, {});

export const getCapabilitySlotLabel = ({ capability = {}, slotKey = '' }) =>
  getSlotDefinitions(capability)?.[slotKey]?.label || slotKey;
