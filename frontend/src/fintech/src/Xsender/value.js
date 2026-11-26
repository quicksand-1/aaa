const ENTITY_SLOT_PREFIX = 'xsender_entity_';

function createEmptyValue() {
  return {
    text: '',
    segments: [],
    entities: [],
  };
}

function normalizeText(text) {
  return String(text ?? '');
}

function buildTextSegment(text) {
  const normalizedText = normalizeText(text);

  if (!normalizedText) {
    return null;
  }

  return {
    type: 'text',
    text: normalizedText,
  };
}

function buildEntityId(entityType, serializeText, label) {
  const normalizedEntityType = normalizeText(entityType || 'entity').trim();
  const normalizedSerializeText = normalizeText(serializeText).trim();
  const normalizedLabel = normalizeText(label).trim();

  return (
    normalizedSerializeText ||
    normalizedLabel ||
    `${normalizedEntityType || 'entity'}_${Date.now()}`
  );
}

function normalizeEntity(entity, options = {}) {
  if (!entity || typeof entity !== 'object') {
    return null;
  }

  const fallbackLabel =
    options.label ||
    entity.label ||
    entity.value ||
    entity.name ||
    entity.serializeText ||
    '';
  const fallbackSerializeText =
    options.serializeText || entity.serializeText || fallbackLabel || '';
  const normalizedEntityType = normalizeText(
    options.entityType || entity.entityType || 'entity',
  ).trim();
  const normalizedLabel = normalizeText(fallbackLabel).trim();
  const normalizedSerializeText = normalizeText(fallbackSerializeText).trim();

  return {
    ...entity,
    id: normalizeText(entity.id).trim()
      ? normalizeText(entity.id).trim()
      : buildEntityId(
          normalizedEntityType,
          normalizedSerializeText,
          normalizedLabel,
        ),
    entityType: normalizedEntityType || 'entity',
    label: normalizedLabel || normalizedSerializeText,
    serializeText: normalizedSerializeText || normalizedLabel,
  };
}

function buildEntitySegment(entity, options = {}) {
  const normalizedEntity = normalizeEntity(entity, options);

  if (!normalizedEntity) {
    return null;
  }

  return {
    type: 'entity',
    entity: normalizedEntity,
  };
}

function pushTextSegment(segmentList, text) {
  const nextTextSegment = buildTextSegment(text);

  if (!nextTextSegment) {
    return;
  }

  const lastSegment = segmentList[segmentList.length - 1];

  if (lastSegment?.type === 'text') {
    lastSegment.text += nextTextSegment.text;
    return;
  }

  segmentList.push(nextTextSegment);
}

function normalizeSegments(inputSegments = []) {
  const segmentList = [];

  inputSegments.forEach((segment) => {
    if (!segment) {
      return;
    }

    if (typeof segment === 'string') {
      pushTextSegment(segmentList, segment);
      return;
    }

    if (segment.type === 'text') {
      pushTextSegment(segmentList, segment.text);
      return;
    }

    if (segment.type === 'entity') {
      const nextEntitySegment = buildEntitySegment(segment.entity, segment);

      if (nextEntitySegment) {
        segmentList.push(nextEntitySegment);
      }

      return;
    }

    const fallbackEntitySegment = buildEntitySegment(segment, segment);

    if (fallbackEntitySegment) {
      segmentList.push(fallbackEntitySegment);
    }
  });

  return segmentList;
}

function buildValueFromSegments(inputSegments = []) {
  const segments = normalizeSegments(inputSegments);
  const entities = [];
  let text = '';

  segments.forEach((segment) => {
    if (segment.type === 'text') {
      text += segment.text;
      return;
    }

    if (segment.type === 'entity' && segment.entity) {
      entities.push(segment.entity);
    }
  });

  return {
    text,
    segments,
    entities,
  };
}

function normalizeValue(value) {
  if (!value) {
    return createEmptyValue();
  }

  if (typeof value === 'string') {
    return buildValueFromSegments([{ type: 'text', text: value }]);
  }

  if (Array.isArray(value)) {
    return buildValueFromSegments(value);
  }

  if (Array.isArray(value.segments)) {
    return buildValueFromSegments(value.segments);
  }

  if (typeof value.text === 'string') {
    return buildValueFromSegments([{ type: 'text', text: value.text }]);
  }

  return createEmptyValue();
}

function computeSerializedText(
  segments,
  entityToText = (e) => e.serializeText || e.label || '',
) {
  return (segments || [])
    .map((segment) => {
      if (segment.type === 'text') {
        return segment.text;
      }

      if (segment.type === 'entity' && segment.entity) {
        return entityToText(segment.entity);
      }

      return '';
    })
    .join('');
}

function buildEntitySlotKey(entity, index) {
  return `${ENTITY_SLOT_PREFIX}${entity.id}_${index}`;
}

function buildEntitySlotConfig(
  entity,
  index,
  entityToText = (e) => e.serializeText || e.label || '',
) {
  const slotKey = buildEntitySlotKey(entity, index);
  const serializedText = entityToText(entity);

  return {
    type: 'tag',
    key: slotKey,
    props: {
      label: entity.label,
      value: serializedText,
    },
    formatResult: () => serializedText || '',
    xsenderEntity: entity,
    xsenderSegmentType: 'entity',
  };
}

function buildSenderSlotConfig(value, entityToText) {
  const normalizedValue = normalizeValue(value);

  return normalizedValue.segments.map((segment, index) => {
    if (segment.type === 'text') {
      return {
        type: 'text',
        value: segment.text,
      };
    }

    return buildEntitySlotConfig(segment.entity, index, entityToText);
  });
}

function buildValueFromSenderSlotConfig(slotConfig = []) {
  const segments = [];

  slotConfig.forEach((item) => {
    if (!item) {
      return;
    }

    if (item.xsenderSegmentType === 'entity' || item.xsenderEntity) {
      const entitySegment = buildEntitySegment(
        item.xsenderEntity || item.entity,
        item,
      );

      if (entitySegment) {
        segments.push(entitySegment);
      }

      return;
    }

    if (item.type === 'text') {
      pushTextSegment(segments, item.value);
      return;
    }

    pushTextSegment(segments, item.value);
  });

  return buildValueFromSegments(segments);
}

function serializeValueSignature(value) {
  const normalizedValue = normalizeValue(value);

  return JSON.stringify(
    normalizedValue.segments.map((segment) => {
      if (segment.type === 'text') {
        return {
          type: 'text',
          text: segment.text,
        };
      }

      return {
        type: 'entity',
        entity: segment.entity,
      };
    }),
  );
}

function isEmptyValue(value) {
  const normalizedValue = normalizeValue(value);

  return !normalizedValue.text.trim() && normalizedValue.entities.length === 0;
}

export {
  buildEntitySegment,
  buildSenderSlotConfig,
  buildTextSegment,
  buildValueFromSegments,
  buildValueFromSenderSlotConfig,
  computeSerializedText,
  createEmptyValue,
  isEmptyValue,
  normalizeEntity,
  normalizeValue,
  serializeValueSignature,
};
