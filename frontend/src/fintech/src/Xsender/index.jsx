import { Sender } from '@ant-design/x';
import { Popover } from 'antd';
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import useDraftCache from './hooks/useDraftCache';
import useInputHistory from './hooks/useInputHistory';
import {
  buildInsertSegmentsFromTriggerItem,
  buildSuggestionItems,
  filterTriggerItems,
  findActiveTriggerMatch,
  hasDuplicateEntity,
  normalizeTrigger,
  resolveTriggerItems,
} from './triggers';
import {
  buildEntitySegment,
  buildSenderSlotConfig,
  buildTextSegment,
  buildValueFromSegments,
  buildValueFromSenderSlotConfig,
  computeSerializedText,
  createEmptyValue,
  isEmptyValue,
  normalizeValue,
  serializeValueSignature,
} from './value';

const EMPTY_TRIGGERS = [];

const printableKey = (event) => {
  return (
    event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey
  );
};

const buildContext = (historyItems) => {
  return {
    historyItems,
  };
};

function Xsender(props) {
  const {
    actionRef,
    value,
    defaultValue,
    placeholder = '输入内容，按 Enter 发送，输入 / 触发结构化命令',
    maxLength = 4000,
    triggers = EMPTY_TRIGGERS,
    enableHistory = true,
    enableDraft = true,
    entityToText,
    historyProvider,
    draftProvider,
    onSubmit,
    onChange,
    onCancel,
    beforeSubmit,
    ...rest
  } = props;

  const normalizedDefaultValue = useMemo(() => {
    return normalizeValue(defaultValue);
  }, [defaultValue]);
  const normalizedControlledValue = useMemo(() => {
    if (value === undefined) {
      return undefined;
    }

    return normalizeValue(value);
  }, [value]);
  const controlledValueSignature = useMemo(() => {
    if (normalizedControlledValue === undefined) {
      return '';
    }

    return serializeValueSignature(normalizedControlledValue);
  }, [normalizedControlledValue]);
  const triggerList = useMemo(() => {
    return triggers.map(normalizeTrigger).filter(Boolean);
  }, [triggers]);
  const initialValue = normalizedControlledValue || normalizedDefaultValue;
  const senderRef = useRef(null);
  const senderWrapperRef = useRef(null);
  const currentValueRef = useRef(initialValue);
  const programmaticChangeRef = useRef(null);
  const triggerRequestIdRef = useRef(0);
  const [currentValue, setCurrentValue] = useState(initialValue);
  const [senderSlotConfig, setSenderSlotConfig] = useState(() => {
    return buildSenderSlotConfig(initialValue, entityToText);
  });
  const [draftBeforeHistory, setDraftBeforeHistory] = useState(initialValue);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;
  const beforeSubmitRef = useRef(beforeSubmit);
  beforeSubmitRef.current = beforeSubmit;

  const [suggestionState, setSuggestionState] = useState({
    open: false,
    items: [],
    activeTrigger: null,
  });
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

  const {
    historyItems,
    historyIndex,
    setHistoryIndex,
    saveHistory,
    clearHistory,
  } = useInputHistory({
    enabled: enableHistory,
    historyProvider,
  });

  const applyValueState = useCallback((nextValue, meta, options = {}) => {
    const normalizedValue = normalizeValue(nextValue);

    currentValueRef.current = normalizedValue;
    setCurrentValue(normalizedValue);

    if (options.notify !== false) {
      onChangeRef.current?.(normalizedValue, meta || { reason: 'input' });
    }

    return normalizedValue;
  }, []);

  const replaceSenderValue = useCallback(
    (nextValue, meta, options = {}) => {
      const normalizedValue = normalizeValue(nextValue);
      const nextSlotConfig = buildSenderSlotConfig(
        normalizedValue,
        entityToText,
      );
      const targetSignature = serializeValueSignature(normalizedValue);

      setSenderSlotConfig(nextSlotConfig);

      if (!senderRef.current?.clear || !senderRef.current?.insert) {
        programmaticChangeRef.current = null;
        return applyValueState(normalizedValue, meta, options);
      }

      programmaticChangeRef.current = {
        targetSignature,
        swallowIntermediateClear: !isEmptyValue(normalizedValue),
      };

      senderRef.current.clear();

      if (nextSlotConfig.length > 0) {
        senderRef.current.insert(nextSlotConfig, 'cursor', '', true);
      }

      if (options.focus) {
        senderRef.current.focus?.();
      }

      return applyValueState(normalizedValue, meta, options);
    },
    [applyValueState, entityToText],
  );

  const insertSegmentsToSender = useCallback(
    (segments, meta, options = {}) => {
      const nextSegments = Array.isArray(segments) ? segments : [segments];
      const insertSlotConfig = buildSenderSlotConfig(
        buildValueFromSegments(nextSegments),
        entityToText,
      );

      if (insertSlotConfig.length === 0 || !senderRef.current?.insert) {
        return false;
      }

      senderRef.current.insert(
        insertSlotConfig,
        options.position || 'cursor',
        options.replaceCharacters,
        true,
      );

      const insertedValue = buildValueFromSenderSlotConfig(
        senderRef.current?.getValue?.().slotConfig || [],
      );

      programmaticChangeRef.current = {
        targetSignature: serializeValueSignature(insertedValue),
        swallowIntermediateClear: false,
      };

      applyValueState(insertedValue, meta, options);

      if (options.focus !== false) {
        senderRef.current.focus?.();
      }

      return true;
    },
    [applyValueState, entityToText],
  );

  const removeEntity = useCallback(
    (entityId, options = {}) => {
      const nextSegments = currentValueRef.current.segments.filter(
        (segment) => {
          if (segment.type !== 'entity') {
            return true;
          }

          return segment.entity.id !== entityId;
        },
      );

      replaceSenderValue(buildValueFromSegments(nextSegments), {
        reason: 'removeEntity',
        entityId,
      });

      if (options.focus) {
        senderRef.current?.focus?.();
      }
    },
    [replaceSenderValue],
  );

  const { clearDraft } = useDraftCache({
    enabled: enableDraft,
    draftProvider,
    value: currentValue,
    setValue: replaceSenderValue,
  });

  const restoreDraft = useCallback(() => {
    setHistoryIndex(-1);
    replaceSenderValue(
      draftBeforeHistory,
      {
        reason: 'historyRestore',
      },
      {
        focus: true,
      },
    );
  }, [draftBeforeHistory, replaceSenderValue, setHistoryIndex]);

  const navigateHistory = useCallback(
    (direction) => {
      if (!enableHistory || historyItems.length === 0) {
        return;
      }

      let nextIndex = historyIndex;

      if (direction === 'up') {
        if (historyIndex === -1) {
          setDraftBeforeHistory(currentValueRef.current);
          nextIndex = 0;
        } else if (historyIndex < historyItems.length - 1) {
          nextIndex = historyIndex + 1;
        } else {
          return;
        }
      }

      if (direction === 'down') {
        if (historyIndex === -1) {
          return;
        }

        if (historyIndex === 0) {
          restoreDraft();
          return;
        }

        nextIndex = historyIndex - 1;
      }

      setHistoryIndex(nextIndex);
      replaceSenderValue(
        historyItems[nextIndex]?.value || createEmptyValue(),
        {
          reason: 'historyNavigate',
          historyIndex: nextIndex,
        },
        {
          focus: true,
        },
      );
    },
    [
      enableHistory,
      historyIndex,
      historyItems,
      replaceSenderValue,
      restoreDraft,
      setHistoryIndex,
    ],
  );

  useEffect(() => {
    if (normalizedControlledValue === undefined) {
      return;
    }

    if (
      controlledValueSignature ===
      serializeValueSignature(currentValueRef.current)
    ) {
      return;
    }

    replaceSenderValue(
      normalizedControlledValue,
      {
        reason: 'controlledValue',
      },
      {
        notify: false,
      },
    );
  }, [controlledValueSignature, normalizedControlledValue, replaceSenderValue]);

  useEffect(() => {
    if (triggerList.length === 0) {
      setSuggestionState((previousState) => {
        if (
          !previousState.open &&
          previousState.items.length === 0 &&
          !previousState.activeTrigger
        ) {
          return previousState;
        }

        return {
          open: false,
          items: [],
          activeTrigger: null,
        };
      });
      return;
    }

    const serializedText = computeSerializedText(
      currentValue.segments,
      entityToText,
    );
    const activeTrigger = findActiveTriggerMatch(serializedText, triggerList);

    if (!activeTrigger) {
      setSuggestionState((previousState) => {
        if (
          !previousState.open &&
          previousState.items.length === 0 &&
          !previousState.activeTrigger
        ) {
          return previousState;
        }

        return {
          open: false,
          items: [],
          activeTrigger: null,
        };
      });
      return;
    }

    triggerRequestIdRef.current += 1;
    const requestId = triggerRequestIdRef.current;

    resolveTriggerItems(activeTrigger.trigger, {
      query: activeTrigger.query,
      trigger: activeTrigger.trigger,
      value: currentValue,
    }).then((items) => {
      if (requestId !== triggerRequestIdRef.current) {
        return;
      }

      const normalizedItems = buildSuggestionItems(
        filterTriggerItems(items, activeTrigger.query),
        activeTrigger.trigger,
      );

      setSuggestionState({
        open: normalizedItems.length > 0,
        items: normalizedItems,
        activeTrigger,
      });
    });
  }, [currentValue, triggerList, entityToText]);

  useEffect(() => {
    if (!suggestionState.open || suggestionState.items.length === 0) {
      setActiveSuggestionIndex(0);
      return;
    }

    setActiveSuggestionIndex((previousIndex) => {
      return Math.min(previousIndex, suggestionState.items.length - 1);
    });
  }, [suggestionState.items, suggestionState.open]);

  const handleSubmit = useCallback(
    async (_, nextSlotConfig = []) => {
      const nextValue =
        nextSlotConfig.length > 0
          ? buildValueFromSenderSlotConfig(nextSlotConfig)
          : currentValueRef.current;

      if (isEmptyValue(nextValue)) {
        return;
      }

      const context = buildContext(historyItems);

      if (beforeSubmitRef.current) {
        const submitResult = await beforeSubmitRef.current(nextValue, context);

        if (submitResult === false || typeof submitResult === 'string') {
          return;
        }
      }

      await onSubmitRef.current?.(nextValue, context);
      await saveHistory(nextValue);
      await clearDraft();

      replaceSenderValue(createEmptyValue(), {
        reason: 'submit',
      });

      setHistoryIndex(-1);
      setDraftBeforeHistory(createEmptyValue());
    },
    [
      clearDraft,
      historyItems,
      replaceSenderValue,
      saveHistory,
      setDraftBeforeHistory,
      setHistoryIndex,
    ],
  );

  useImperativeHandle(actionRef, () => {
    const insert = (segments, options = {}) =>
      insertSegmentsToSender(
        Array.isArray(segments) ? segments : [segments],
        {
          reason: 'insertSegments',
        },
        options,
      );

    return {
      get nativeElement() {
        return senderRef.current?.nativeElement;
      },
      get inputElement() {
        return senderRef.current?.inputElement;
      },
      focus: (...args) => senderRef.current?.focus?.(...args),
      blur: () => senderRef.current?.blur?.(),
      clear: () =>
        replaceSenderValue(createEmptyValue(), {
          reason: 'clear',
        }),
      setValue: (nextValue, options = {}) =>
        replaceSenderValue(
          nextValue,
          {
            reason: 'setValue',
          },
          options,
        ),
      insert,
      insertSegments: insert,
      insertText: (text, options = {}) =>
        insertSegmentsToSender(
          [buildTextSegment(text)].filter(Boolean),
          {
            reason: 'insertText',
          },
          options,
        ),
      insertEntity: (entity, options = {}) =>
        insertSegmentsToSender(
          [
            buildEntitySegment(entity, options),
            options.appendSpace === false ? null : buildTextSegment(' '),
          ].filter(Boolean),
          {
            reason: 'insertEntity',
          },
          options,
        ),
      removeEntity: (entityId, options = {}) => removeEntity(entityId, options),
      getValue: () => currentValueRef.current,
      clearHistory: () => clearHistory(),
      resetDraft: async () => {
        await clearDraft();
        replaceSenderValue(createEmptyValue(), {
          reason: 'resetDraft',
        });
      },
    };
  });

  const handleSelectSuggestion = useCallback(
    (selectedItem) => {
      const activeTrigger = suggestionState.activeTrigger;

      if (!selectedItem || !activeTrigger) {
        return;
      }

      if (
        selectedItem.entity &&
        hasDuplicateEntity(
          currentValueRef.current,
          selectedItem.entity,
          activeTrigger.trigger.allowDuplicate,
        )
      ) {
        setSuggestionState((previousState) => ({
          ...previousState,
          open: false,
        }));
        return;
      }

      insertSegmentsToSender(
        buildInsertSegmentsFromTriggerItem(selectedItem),
        {
          reason: 'triggerSelect',
          triggerKey: activeTrigger.key,
          itemId: selectedItem.id,
        },
        {
          focus: true,
          replaceCharacters: activeTrigger.replaceText,
        },
      );

      setSuggestionState({
        open: false,
        items: [],
        activeTrigger: null,
      });
    },
    [insertSegmentsToSender, suggestionState.activeTrigger],
  );

  const suggestionContent =
    suggestionState.open && suggestionState.items.length > 0 ? (
      <div
        style={{
          maxHeight: 240,
          overflowY: 'auto',
          minWidth: 240,
        }}
      >
        {suggestionState.items.map((item, index) => {
          const active = index === activeSuggestionIndex;

          return (
            <div
              key={item.id}
              onMouseDown={(event) => {
                event.preventDefault();
              }}
              onClick={() => {
                handleSelectSuggestion(item.xsenderTriggerItem || item);
              }}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                background: active ? 'rgba(22, 119, 255, 0.08)' : 'transparent',
              }}
            >
              <div>{item.label}</div>
              {item.extra ? (
                <div
                  style={{
                    marginTop: 2,
                    fontSize: 12,
                    color: 'rgba(0, 0, 0, 0.45)',
                  }}
                >
                  {item.extra}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    ) : null;

  return (
    <Popover
      content={suggestionContent}
      open={suggestionState.open && suggestionState.items.length > 0}
      overlayStyle={{ width: 320 }}
      placement="topLeft"
      trigger={[]}
      getPopupContainer={() => senderWrapperRef.current || document.body}
    >
      <div ref={senderWrapperRef}>
        <Sender
          ref={senderRef}
          {...rest}
          autoSize={{
            minRows: 1,
            maxRows: 6,
          }}
          onCancel={onCancel}
          onChange={(_, event, nextSlotConfig = []) => {
            const nextValue = buildValueFromSenderSlotConfig(nextSlotConfig);
            const pendingChange = programmaticChangeRef.current;
            const nextSignature = serializeValueSignature(nextValue);

            if (pendingChange) {
              if (
                pendingChange.swallowIntermediateClear &&
                isEmptyValue(nextValue)
              ) {
                return;
              }

              if (nextSignature === pendingChange.targetSignature) {
                programmaticChangeRef.current = null;
                return;
              }

              programmaticChangeRef.current = null;
            }

            if (
              maxLength > 0 &&
              computeSerializedText(nextValue.segments, entityToText).length >
                maxLength
            ) {
              replaceSenderValue(
                currentValueRef.current,
                {
                  reason: 'maxLengthRestore',
                },
                {
                  notify: false,
                  focus: true,
                },
              );
              return;
            }

            applyValueState(nextValue, {
              reason: 'input',
              event,
            });
          }}
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' &&
              event.shiftKey &&
              !event.ctrlKey &&
              !event.metaKey &&
              !event.altKey
            ) {
              event.preventDefault();
              insertSegmentsToSender([buildTextSegment('\n')].filter(Boolean), {
                reason: 'newline',
              });
              return false;
            }

            if (suggestionState.open && suggestionState.items.length > 0) {
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setActiveSuggestionIndex((previousIndex) => {
                  return (previousIndex + 1) % suggestionState.items.length;
                });
                return false;
              }

              if (event.key === 'ArrowUp') {
                event.preventDefault();
                setActiveSuggestionIndex((previousIndex) => {
                  return (
                    (previousIndex - 1 + suggestionState.items.length) %
                    suggestionState.items.length
                  );
                });
                return false;
              }

              if (
                event.key === 'Enter' &&
                !event.shiftKey &&
                !event.ctrlKey &&
                !event.metaKey &&
                !event.altKey
              ) {
                event.preventDefault();
                const activeItem = suggestionState.items[activeSuggestionIndex];
                handleSelectSuggestion(
                  activeItem?.xsenderTriggerItem || activeItem,
                );
                return false;
              }
            }

            if (event.key === 'Escape') {
              if (suggestionState.open) {
                setSuggestionState((previousState) => ({
                  ...previousState,
                  open: false,
                }));
                return;
              }

              if (historyIndex !== -1) {
                restoreDraft();
                return;
              }
            }

            if (
              !suggestionState.open &&
              (event.key === 'ArrowUp' || event.key === 'ArrowDown')
            ) {
              event.preventDefault();
              navigateHistory(event.key === 'ArrowUp' ? 'up' : 'down');
              return;
            }

            if (historyIndex !== -1 && printableKey(event)) {
              setHistoryIndex(-1);
            }
          }}
          onSubmit={handleSubmit}
          placeholder={placeholder}
          slotConfig={senderSlotConfig}
          submitType="enter"
        />
      </div>
    </Popover>
  );
}

export default Xsender;
