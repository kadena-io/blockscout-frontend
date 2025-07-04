'use client';

import type { ListCollection } from '@chakra-ui/react';
import { Box, Select as ChakraSelect, createListCollection, Flex, Portal, Icon, useSelectContext } from '@chakra-ui/react';
import { useDebounce } from '@uidotdev/usehooks';
import * as React from 'react';

import ArrowIcon from 'icons/arrows/east-mini.svg';
import CheckIcon from 'icons/check.svg';

import { FilterInput } from '../components/filters/FilterInput';
import { CloseButton } from './close-button';
import { Skeleton } from './skeleton';

export interface SelectOption<Value extends string = string> {
  label: string;
  renderLabel?: () => React.ReactNode;
  value: Value;
  icon?: React.ReactNode;
};

export interface SelectControlProps extends ChakraSelect.ControlProps {
  noIndicator?: boolean;
  triggerProps?: ChakraSelect.TriggerProps;
  loading?: boolean;
  intent?: SelectProps['intent'];
  type?: SelectProps['type'];
}

export enum OptionPositions {
  FIRST_ITEM = 'first-item',
  LAST_ITEM = 'last-item',
  MID_ITEM = 'mid-item',
  SINGLE_ITEM = 'single-item',
};

const getNthItem = (index: number, size: number): OptionPositions => {
  if (size === 1) return OptionPositions.SINGLE_ITEM;
  if (index === 0) return OptionPositions.FIRST_ITEM;
  if (index === size - 1) return OptionPositions.LAST_ITEM;

  return OptionPositions.MID_ITEM;
};

export const SelectControl = React.forwardRef<
  HTMLButtonElement,
  SelectControlProps
>(function SelectControl(props, ref) {
  // NOTE: here defaultValue means the "default" option of the select, not its initial value
  const { children, noIndicator, triggerProps, loading, defaultValue, type, intent, ...rest } = props;

  const context = useSelectContext();
  const isDefaultValue = Array.isArray(defaultValue) ? context.value.every((item) => defaultValue.includes(item)) : context.value === defaultValue;

  let background = 'transparent';
  let surface = 'inherit';

  if (intent) {
    if (intent === 'negative') {
      background = 'var(--kda-color-background-semantic-negative-subtlest)';
      surface = 'var(--kda-color-link-semantic-negative)';
    } else if (intent === 'warning') {
      background = 'var(--kda-color-background-semantic-warning-subtlest)';
      surface = 'var(--kda-color-link-semantic-warning)';
    } else if (intent === 'positive') {
      background = 'var(--kda-color-background-semantic-positive-subtlest)';
      surface = 'var(--kda-color-link-semantic-positive)';
    }
  }

  return (
    <Skeleton loading={ loading } asChild>
      <ChakraSelect.Control { ...rest }>
        <ChakraSelect.Trigger
          ref={ ref }
          className="group peer"
          data-default-value={ isDefaultValue }
          { ...(type === 'compact' ? { paddingRight: 1, background, color: surface, border: 'none' } : {}) }
          { ...(type === 'inline' ?
            {
              fontSize: 'inherit',
              fontWeight: 'inherit',
              background: 'transparent',
              border: 'none',
              height: 'auto',
              color: 'inherit',
            } :
            {}) }
          { ...triggerProps }
        >
          { children }
        </ChakraSelect.Trigger>
        { (!noIndicator) && (
          <ChakraSelect.IndicatorGroup
            color="inherit"
            { ...(type === 'compact' ? { paddingRight: 1 } : {}) }
            { ...(type === 'inline' ? { aspectRatio: '1/1', padding: 0 } : {}) }
          >
            { !noIndicator && (
              <ChakraSelect.Indicator
                transition="transform 0.2s ease-in-out"
                transform="rotate(-90deg)"
                _open={{ transform: 'rotate(90deg)' }}
                flexShrink={ 0 }
                color="inherit"
                { ...(type === 'inline' ? { width: '100%', height: '100%' } : {}) }
              >
                <Icon boxSize={ 5 } color="inherit" { ...(type === 'inline' ? { width: '100%', height: '100%' } : {}) }><ArrowIcon/></Icon>
              </ChakraSelect.Indicator>
            ) }
          </ChakraSelect.IndicatorGroup>
        ) }
      </ChakraSelect.Control>
    </Skeleton>
  );
});

export const SelectClearTrigger = React.forwardRef<
  HTMLButtonElement,
  ChakraSelect.ClearTriggerProps
>(function SelectClearTrigger(props, ref) {
  return (
    <ChakraSelect.ClearTrigger asChild { ...props } ref={ ref }>
      <CloseButton
        pointerEvents="auto"
      />
    </ChakraSelect.ClearTrigger>
  );
});

interface SelectContentProps extends ChakraSelect.ContentProps {
  portalled?: boolean;
  portalRef?: React.RefObject<HTMLElement>;
}

export const SelectContent = React.forwardRef<
  HTMLDivElement,
  SelectContentProps
>(function SelectContent(props, ref) {
  const { portalled = true, portalRef, ...rest } = props;
  return (
    <Portal disabled={ !portalled } container={ portalRef }>
      <ChakraSelect.Positioner>
        <ChakraSelect.Content { ...rest } ref={ ref }/>
      </ChakraSelect.Positioner>
    </Portal>
  );
});

export interface SelectItemProps extends ChakraSelect.ItemProps {
  item: SelectOption;
}

export const SelectItem = React.forwardRef<
  HTMLDivElement,
  SelectItemProps
>(function SelectItem(props, ref) {
  const { item, children, ...rest } = props;

  const startElement = item.icon;

  return (
    <ChakraSelect.Item key={ item.value } item={ item } { ...rest } ref={ ref }>
      { startElement }
      { children }
      <ChakraSelect.ItemIndicator asChild>
        <Icon boxSize={ 5 } flexShrink={ 0 } ml="auto"><CheckIcon/></Icon>
      </ChakraSelect.ItemIndicator>
    </ChakraSelect.Item>
  );
});

interface SelectValueTextProps extends Omit<ChakraSelect.ValueTextProps, 'children'> {
  children?(items: Array<SelectOption>): React.ReactNode;
  size?: SelectRootProps['size'];
  required?: boolean;
  invalid?: boolean;
  errorText?: string;
  type?: SelectProps['type'];
}

export const SelectValueText = React.forwardRef<
  HTMLSpanElement,
  SelectValueTextProps
>(function SelectValueText(props, ref) {
  const { children, size, required, invalid, errorText, type, ...rest } = props;
  const context = useSelectContext();

  const content = (() => {
    const items = context.selectedItems;

    const placeholder = `${ props.placeholder }${ required ? '*' : '' }${ invalid && errorText ? ` - ${ errorText }` : '' }`;

    if (items.length === 0) return placeholder;

    if (children) return children(items);

    if (items.length === 1) {
      const item = items[0] as SelectOption;

      if (!item) return placeholder;

      const label = size === 'lg' ? (
        <Box
          textStyle="xs"
          color={ invalid ? 'field.placeholder.error' : 'field.placeholder' }
          display="-webkit-box"
        >
          { placeholder }
        </Box>
      ) : null;

      return (
        <>
          { label }
          <Flex
            display="inline-flex"
            alignItems="center"
            flexWrap="nowrap"
            gap={ 1 }>
            { item.icon }
            <span style={{
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              display: '-webkit-box',
              ...((type === 'inline') ? { fontSize: 'inherit', textDecoration: 'underline' } : {}),
            }}>
              { item.renderLabel ? item.renderLabel() : context.collection.stringifyItem(item) }
            </span>
          </Flex>
        </>
      );
    }

    // FIXME: we don't have multiple selection in the select yet
    return `${ items.length } selected`;
  })();

  return (
    <ChakraSelect.ValueText
      ref={ ref }
      { ...rest }
    >
      { content }
    </ChakraSelect.ValueText>
  );
});

export interface SelectRootProps extends ChakraSelect.RootProps {}

export const SelectRoot = React.forwardRef<
  HTMLDivElement,
  ChakraSelect.RootProps
>(function SelectRoot(props, ref) {
  const { lazyMount = true, unmountOnExit = true, ...rest } = props;
  return (
    <ChakraSelect.Root
      ref={ ref }
      lazyMount={ lazyMount }
      unmountOnExit={ unmountOnExit }
      { ...rest }
      positioning={{ sameWidth: false, ...props.positioning, offset: { mainAxis: 4, ...props.positioning?.offset } }}
    >
      { props.asChild ? (
        props.children
      ) : (
        <>
          <ChakraSelect.HiddenSelect/>
          { props.children }
        </>
      ) }
    </ChakraSelect.Root>
  );
}) as ChakraSelect.RootComponent;

interface SelectItemGroupProps extends ChakraSelect.ItemGroupProps {
  label: React.ReactNode;
}

export const SelectItemGroup = React.forwardRef<
  HTMLDivElement,
  SelectItemGroupProps
>(function SelectItemGroup(props, ref) {
  const { children, label, ...rest } = props;
  return (
    <ChakraSelect.ItemGroup { ...rest } ref={ ref }>
      <ChakraSelect.ItemGroupLabel>{ label }</ChakraSelect.ItemGroupLabel>
      { children }
    </ChakraSelect.ItemGroup>
  );
});

export const SelectLabel = ChakraSelect.Label;
export const SelectItemText = ChakraSelect.ItemText;

export interface SelectProps extends SelectRootProps {
  collection: ListCollection<SelectOption>;
  placeholder: string;
  portalled?: boolean;
  loading?: boolean;
  errorText?: string;
  intent?: 'info' | 'positive' | 'warning' | 'negative';
  contentProps?: SelectContentProps;
  type?: 'default' | 'inline' | 'compact';
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>((props, ref) => {
  const { collection, placeholder, portalled = true, loading, errorText, contentProps, type, ...rest } = props;
  return (
    <SelectRoot
      ref={ ref }
      collection={ collection }
      { ...rest }
    >
      <SelectControl loading={ loading } type={ type }>
        <SelectValueText
          placeholder={ placeholder }
          size={ props.size }
          required={ props.required }
          invalid={ props.invalid }
          errorText={ errorText }
        />
      </SelectControl>
      <SelectContent portalled={ portalled } { ...contentProps }>
        { collection.items.map((item: SelectOption, index) => (
          <SelectItem data-position={ getNthItem(index, collection.items.length) } item={ item } key={ item.value }>
            { item.renderLabel ? item.renderLabel() : item.label }
          </SelectItem>
        )) }
      </SelectContent>
    </SelectRoot>
  );
});

export const CompactSelect = React.forwardRef<HTMLDivElement, SelectProps>((props, ref) => {
  const { collection, placeholder, portalled = true, loading, errorText, contentProps, intent, ...rest } = props;
  return (
    <SelectRoot
      ref={ ref }
      collection={ collection }
      paddingRight={ 1 }
      { ...rest }
    >
      <SelectControl loading={ loading } intent={ intent } type="compact">
        <SelectValueText
          paddingLeft={ 2 }
          paddingRight={ 3 }
          marginRight={ 2 }
          placeholder={ placeholder }
          size={ props.size }
          required={ props.required }
          invalid={ props.invalid }
          errorText={ errorText }
        />
      </SelectControl>
      <SelectContent portalled={ portalled } { ...contentProps }>
        { collection.items.map((item: SelectOption, index) => (
          <SelectItem data-position={ getNthItem(index, collection.items.length) } item={ item } key={ item.value }>
            { item.label }
          </SelectItem>
        )) }
      </SelectContent>
    </SelectRoot>
  );
});

export const InlineSelect = React.forwardRef<HTMLDivElement, SelectProps>((props, ref) => {
  const { collection, placeholder, portalled = true, loading, errorText, contentProps, intent, ...rest } = props;
  return (
    <SelectRoot
      ref={ ref }
      collection={ collection }
      paddingRight={ 1 }
      { ...rest }
    >
      <SelectControl loading={ loading } type="inline">
        <SelectValueText
          display="inline"
          paddingLeft={ 0 }
          paddingRight={ 3 }
          marginRight={ 0 }
          height="unset"
          overflow="visible"
          color="inherit"
          placeholder={ placeholder }
          size={ props.size }
          required={ props.required }
          invalid={ props.invalid }
          errorText={ errorText }
          type="inline"
        />
      </SelectControl>
      <SelectContent padding="var(--kda-explorer-navigation-dimensions-select-option-padding)" portalled={ portalled } { ...contentProps }>
        { collection.items.map((item: SelectOption, index) => (
          <SelectItem data-position={ getNthItem(index, collection.items.length) } item={ item } key={ item.value }>
            { item.label }
          </SelectItem>
        )) }
      </SelectContent>
    </SelectRoot>
  );
});

export interface SelectAsyncProps extends Omit<SelectProps, 'collection'> {
  placeholder: string;
  portalled?: boolean;
  loading?: boolean;
  loadOptions: (input: string, currentValue: Array<string>) => Promise<ListCollection<SelectOption>>;
  extraControls?: React.ReactNode;
}

export const SelectAsync = React.forwardRef<HTMLDivElement, SelectAsyncProps>((props, ref) => {
  const { placeholder, portalled = true, loading, loadOptions, extraControls, onValueChange, errorText, ...rest } = props;

  const [ collection, setCollection ] = React.useState<ListCollection<SelectOption>>(createListCollection<SelectOption>({ items: [] }));
  const [ inputValue, setInputValue ] = React.useState('');
  const [ value, setValue ] = React.useState<Array<string>>([]);

  const debouncedInputValue = useDebounce(inputValue, 300);

  React.useEffect(() => {
    loadOptions(debouncedInputValue, value).then(setCollection);
  }, [ debouncedInputValue, loadOptions, value ]);

  const handleFilterChange = React.useCallback((value: string) => {
    setInputValue(value);
  }, [ ]);

  const handleValueChange = React.useCallback(({ value, items }: { value: Array<string>; items: Array<SelectOption> }) => {
    setValue(value);
    onValueChange?.({ value, items });
  }, [ onValueChange ]);

  return (
    <SelectRoot
      ref={ ref }
      collection={ collection }
      onValueChange={ handleValueChange }
      { ...rest }
    >
      <SelectControl loading={ loading }>
        <SelectValueText
          placeholder={ placeholder }
          size={ props.size }
          required={ props.required }
          invalid={ props.invalid }
          errorText={ errorText }
        />
      </SelectControl>
      <SelectContent portalled={ portalled }>
        <Box px="4">
          <FilterInput
            placeholder="Search"
            initialValue={ inputValue }
            onChange={ handleFilterChange }
            inputProps={{ pl: '9' }}
          />
          { extraControls }
        </Box>
        { collection.items.map((item, index) => (
          <SelectItem data-position={ getNthItem(index, collection.items.length) } item={ item } key={ item.value }>
            { item.renderLabel ? item.renderLabel() : item.label }
          </SelectItem>
        )) }
      </SelectContent>
    </SelectRoot>
  );
});
