import { normalizeEntity } from './value';

function normalizeText(text) {
  return String(text ?? '');
}

function escapeRegExp(text) {
  return normalizeText(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeTrigger(trigger, index) {
  if (!trigger || typeof trigger !== 'object') {
    return null;
  }

  const marker = normalizeText(trigger.trigger || trigger.marker).trim();

  if (!marker) {
    return null;
  }

  return {
    ...trigger,
    key: normalizeText(trigger.key).trim() || `trigger_${index}`,
    trigger: marker,
    allowDuplicate: trigger.allowDuplicate !== false,
  };
}

function findActiveTriggerMatch(rawText, triggers = []) {
  const normalizedRawText = normalizeText(rawText);

  for (let index = 0; index < triggers.length; index += 1) {
    const trigger = triggers[index];

    const match = normalizedRawText.match(
      new RegExp(`(?:^|\\s)(${escapeRegExp(trigger.trigger)})([^\\s]*)$`),
    );

    if (!match) {
      continue;
    }

    return {
      key: trigger.key,
      marker: trigger.trigger,
      query: match[2] || '',
      replaceText: `${trigger.trigger}${match[2] || ''}`,
      trigger,
    };
  }

  return null;
}

function resolveTriggerItems(trigger, context) {
  if (!trigger) {
    return Promise.resolve([]);
  }

  if (typeof trigger.items === 'function') {
    return Promise.resolve(trigger.items(context)).then((items) => items || []);
  }

  return Promise.resolve(trigger.items || []);
}

function normalizeSearchTokens(item) {
  const tokenList = [];

  [
    item.label,
    item.description,
    item.text,
    item?.entity?.label,
    item?.entity?.serializeText,
    ...(item.keywords || []),
  ].forEach((candidate) => {
    const normalizedCandidate = normalizeText(candidate).trim();

    if (normalizedCandidate) {
      tokenList.push(normalizedCandidate.toLowerCase());
    }
  });

  return tokenList;
}

function filterTriggerItems(items, query) {
  const normalizedQuery = normalizeText(query).trim().toLowerCase();

  if (!normalizedQuery) {
    return items;
  }

  return (items || []).filter((item) => {
    return normalizeSearchTokens(item).some((token) =>
      token.includes(normalizedQuery),
    );
  });
}

function normalizeTriggerItem(item, trigger, index) {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const baseLabel =
    item.label || item.description || item.text || item?.entity?.label || '';
  const normalizedItem = {
    ...item,
    id:
      normalizeText(item.id).trim() ||
      normalizeText(item.value).trim() ||
      `${trigger.key}_${index}`,
    label: item.label || baseLabel,
    description: item.description || '',
    appendSpace: item.appendSpace !== false,
    triggerKey: trigger.key,
  };

  if (item.entity || trigger.itemToEntity) {
    const resolvedEntity = normalizeEntity(
      item.entity || trigger.itemToEntity?.(item),
      {
        entityType: item?.entity?.entityType || trigger.entityType,
        label:
          item?.entity?.label ||
          trigger.getEntityLabel?.(item) ||
          baseLabel ||
          '',
        serializeText:
          item?.entity?.serializeText ||
          trigger.serializeEntity?.(item.entity || item, item) ||
          item.text ||
          '',
      },
    );

    if (resolvedEntity) {
      normalizedItem.entity = resolvedEntity;
    }
  }

  if (!normalizedItem.entity && normalizedItem.text === undefined) {
    normalizedItem.text = normalizeText(baseLabel);
  }

  return normalizedItem;
}

function buildSuggestionItems(items = [], trigger) {
  return items
    .map((item, index) => normalizeTriggerItem(item, trigger, index))
    .filter(Boolean)
    .map((item) => {
      const description = normalizeText(item.description).trim();

      return {
        ...item,
        value: item.id,
        extra: description ? description : item.extra,
        xsenderTriggerItem: item,
      };
    });
}

function buildInsertSegmentsFromTriggerItem(item) {
  if (!item) {
    return [];
  }

  if (item.entity) {
    return [
      {
        type: 'entity',
        entity: item.entity,
      },
      ...(item.appendSpace ? [{ type: 'text', text: ' ' }] : []),
    ];
  }

  return [
    {
      type: 'text',
      text: `${normalizeText(item.text)}${item.appendSpace ? ' ' : ''}`,
    },
  ];
}

function hasDuplicateEntity(value, entity, allowDuplicate = true) {
  if (allowDuplicate || !entity) {
    return false;
  }

  return (value?.entities || []).some((item) => {
    return (
      item.entityType === entity.entityType &&
      item.serializeText === entity.serializeText &&
      item.label === entity.label
    );
  });
}

export {
  buildInsertSegmentsFromTriggerItem,
  buildSuggestionItems,
  filterTriggerItems,
  findActiveTriggerMatch,
  hasDuplicateEntity,
  normalizeTrigger,
  resolveTriggerItems,
};
