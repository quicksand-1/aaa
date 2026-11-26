import { describe, expect, test } from 'vitest';
import {
  buildInsertSegmentsFromTriggerItem,
  buildSuggestionItems,
  filterTriggerItems,
  findActiveTriggerMatch,
} from './triggers';
import {
  buildSenderSlotConfig,
  buildValueFromSegments,
  buildValueFromSenderSlotConfig,
  computeSerializedText,
  normalizeValue,
} from './value';

describe('Xsender value helpers', () => {
  test('builds structured value from mixed text and entity segments', () => {
    const value = buildValueFromSegments([
      {
        type: 'entity',
        entity: {
          entityType: 'metadata_filter',
          id: 'region-shenzhen',
          label: '深圳',
          serializeText: '/region=深圳',
        },
      },
      {
        type: 'text',
        text: ' 关于人口计划生育需要注意什么？',
      },
    ]);

    expect(value.text).toBe(' 关于人口计划生育需要注意什么？');
    expect(computeSerializedText(value.segments)).toBe(
      '/region=深圳 关于人口计划生育需要注意什么？',
    );
    expect(value.entities).toEqual([
      expect.objectContaining({
        entityType: 'metadata_filter',
        id: 'region-shenzhen',
        label: '深圳',
        serializeText: '/region=深圳',
      }),
    ]);
  });

  test('round-trips sender slot config back to structured value', () => {
    const originalValue = normalizeValue({
      segments: [
        {
          type: 'entity',
          entity: {
            entityType: 'metadata_filter',
            id: 'type-rule',
            label: '法规',
            serializeText: '/type=法规',
          },
        },
        {
          type: 'text',
          text: ' 请总结重点',
        },
      ],
    });

    const roundTripValue = buildValueFromSenderSlotConfig(
      buildSenderSlotConfig(originalValue),
    );

    expect(roundTripValue).toEqual(originalValue);
  });
});

describe('Xsender trigger helpers', () => {
  test('finds active trailing slash trigger', () => {
    const activeTrigger = findActiveTriggerMatch('/region=深', [
      {
        key: 'slash',
        trigger: '/',
      },
    ]);

    expect(activeTrigger).toEqual(
      expect.objectContaining({
        key: 'slash',
        marker: '/',
        query: 'region=深',
        replaceText: '/region=深',
      }),
    );
  });

  test('builds entity suggestion items and filters by query', () => {
    const trigger = {
      key: 'slash',
      trigger: '/',
      entityType: 'metadata_filter',
      serializeEntity: (entity) => `/${entity.key}=${entity.value}`,
    };

    const suggestionItems = buildSuggestionItems(
      filterTriggerItems(
        [
          {
            description: '地域',
            entity: {
              key: 'region',
              value: '深圳',
              label: '深圳',
            },
            id: 'region-shenzhen',
            keywords: ['shenzhen'],
            label: '深圳',
          },
          {
            description: '类型',
            entity: {
              key: 'type',
              value: '法规',
              label: '法规',
            },
            id: 'type-rule',
            label: '法规',
          },
        ],
        'shen',
      ),
      trigger,
    );

    expect(suggestionItems).toHaveLength(1);
    expect(
      buildInsertSegmentsFromTriggerItem(suggestionItems[0].xsenderTriggerItem),
    ).toEqual([
      {
        type: 'entity',
        entity: expect.objectContaining({
          key: 'region',
          value: '深圳',
          serializeText: '/region=深圳',
        }),
      },
      {
        type: 'text',
        text: ' ',
      },
    ]);
  });
});
