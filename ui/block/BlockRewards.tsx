import { chakra, Text } from '@chakra-ui/react';
import React, { useCallback } from 'react';

import { currencyUnits } from 'lib/units';
import { Skeleton } from 'toolkit/chakra/skeleton';
import { Tooltip } from 'toolkit/chakra/tooltip';
import { Hint } from 'toolkit/components/Hint/Hint';
import { space } from 'toolkit/utils/htmlEntities';

import RawDataSnippet from '../shared/RawDataSnippet';
import type { BlockQuery } from './useBlockQuery';
import { useKDABlockRewardsData } from './useKDABlockRewards';

interface Props {
  query: BlockQuery;
}

type MouseEnterLeaveHandler = (event: React.MouseEvent<HTMLDivElement>) => void;
type MouseEnterLeaveLabelHandler = (event: React.MouseEvent<HTMLSpanElement>) => void;

interface TKDABreakdownItemProps {
  isLoading: boolean;
  onMouseEnter?: MouseEnterLeaveHandler;
  onMouseLeave?: MouseEnterLeaveHandler;
  children: React.ReactNode;
}

const KDABreakdownItem = React.forwardRef<HTMLDivElement, TKDABreakdownItemProps>(({
  children,
  isLoading,
  onMouseEnter,
  onMouseLeave,
}, ref) => {
  return (
    <chakra.div
      ref={ ref }
      display="flex"
      flexDirection="row"
      gap={ 1 }
      alignItems="center"
      fontSize="xs"
      whiteSpace="nowrap"
      textOverflow="ellipsis"
      overflow="hidden"
      onMouseEnter={ onMouseEnter }
      onMouseLeave={ onMouseLeave }
    >
      <RawDataSnippet
        title={ undefined }
        beforeSlot={ null }
        showCopy={ false }
        data={ children }
        isLoading={ isLoading }
      />
    </chakra.div>
  );
});

KDABreakdownItem.displayName = 'KDABreakdownItem';

interface BreakdownLabelProps {
  onMouseEnterValues: MouseEnterLeaveLabelHandler;
  onMouseLeaveValues: MouseEnterLeaveLabelHandler;
  children: React.ReactNode;
}

const BreakdownLabel = React.forwardRef<HTMLSpanElement, BreakdownLabelProps>(({
  onMouseEnterValues,
  onMouseLeaveValues,
  children,
}, ref) => (
  <chakra.span
    ref={ ref }
    onMouseEnter={ onMouseEnterValues }
    onMouseLeave={ onMouseLeaveValues }
    display="flex"
    flexDirection="row"
    flex="1"
    width="100%"
    alignItems="center"
    justifyContent="space-between"
  >
    { children }
  </chakra.span>
));

BreakdownLabel.displayName = 'BreakdownLabel';

const KDABlockRewards = ({ query }: Props) => {
  const blockRewardValuesRef = React.useRef<HTMLDivElement>(null);
  const blockRewardLabelRef = React.useRef<HTMLSpanElement>(null);
  const txFeesValuesRef = React.useRef<HTMLDivElement>(null);
  const txFeesLabelRef = React.useRef<HTMLSpanElement>(null);
  const burntFeesValuesRef = React.useRef<HTMLDivElement>(null);
  const burntFeesLabelRef = React.useRef<HTMLSpanElement>(null);

  const {
    isLoading,
    calculatedValues,
    formattedValues: {
      rewardAmount,
      rewardBaseFee,
      txFees,
      burntFees,
    },
  } = useKDABlockRewardsData(query);

  const {
    hasRewardBaseFee,
    hasTxFees,
    hasBurntFees,
  } = calculatedValues ?? {};

  const onMouseEnterValues = useCallback((ref: React.RefObject<HTMLDivElement | null>) => {
    const element = ref.current?.querySelector('.chakra-skeleton') as HTMLElement;

    if (element) {
      element.style.backgroundColor = 'var(--kda-explorer-alert-background-semantic-info) !important';
    }
  }, []);

  const onMouseLeaveValues = useCallback((ref: React.RefObject<HTMLDivElement | null>) => {
    const element = ref.current?.querySelector('.chakra-skeleton') as HTMLElement;

    if (element) {
      element.style.backgroundColor = '';
    }
  }, []);

  const onMouseEnterLabels = useCallback((ref: React.RefObject<HTMLSpanElement | null>) => {
    if (ref.current) {
      ref.current.style.color = 'var(--kda-color-accent-blue)';
    }
  }, []);

  const onMouseLeaveLabels = useCallback((ref: React.RefObject<HTMLSpanElement | null>) => {
    if (ref.current) {
      ref.current.style.color = '';
    }
  }, []);

  const handleBlockRewardMouseEnter = useCallback(() => onMouseEnterLabels(blockRewardLabelRef), [ onMouseEnterLabels ]);
  const handleBlockRewardMouseLeave = useCallback(() => onMouseLeaveLabels(blockRewardLabelRef), [ onMouseLeaveLabels ]);

  const handleTxFeesMouseEnter = useCallback(() => onMouseEnterLabels(txFeesLabelRef), [ onMouseEnterLabels ]);
  const handleTxFeesMouseLeave = useCallback(() => onMouseLeaveLabels(txFeesLabelRef), [ onMouseLeaveLabels ]);

  const handleBurntFeesMouseEnter = useCallback(() => onMouseEnterLabels(burntFeesLabelRef), [ onMouseEnterLabels ]);
  const handleBurntFeesMouseLeave = useCallback(() => onMouseLeaveLabels(burntFeesLabelRef), [ onMouseLeaveLabels ]);

  const handleBlockRewardValuesMouseEnter = useCallback(() => onMouseEnterValues(blockRewardValuesRef), [ onMouseEnterValues ]);
  const handleBlockRewardValuesMouseLeave = useCallback(() => onMouseLeaveValues(blockRewardValuesRef), [ onMouseLeaveValues ]);

  const handleTxFeesValuesMouseEnter = useCallback(() => onMouseEnterValues(txFeesValuesRef), [ onMouseEnterValues ]);
  const handleTxFeesValuesMouseLeave = useCallback(() => onMouseLeaveValues(txFeesValuesRef), [ onMouseLeaveValues ]);

  const handleBurntFeesValuesMouseEnter = useCallback(() => onMouseEnterValues(burntFeesValuesRef), [ onMouseEnterValues ]);
  const handleBurntFeesValuesMouseLeave = useCallback(() => onMouseLeaveValues(burntFeesValuesRef), [ onMouseLeaveValues ]);

  if (isLoading) {
    return <Skeleton loading={ isLoading } minH="140px" maxW="380px" w="100%"/>;
  }

  if (!calculatedValues) {
    return null;
  }

  return (
    <chakra.div>
      <chakra.span fontFamily="var(--kda-typography-family-monospace-font)">
        { rewardAmount } { currencyUnits.ether }
      </chakra.span>
      <chakra.div>
        <Text color="text.primary" fontWeight="bold" fontSize="sm" display="inline">
          Breakdown{ space }
        </Text>
        <chakra.div display={{ base: 'none', md: 'flex' }} flexDirection="row" gap={ 2 } alignItems="center" mt={ 3 }>
          <KDABreakdownItem
            ref={ blockRewardValuesRef }
            isLoading={ isLoading }
            onMouseEnter={ handleBlockRewardMouseEnter }
            onMouseLeave={ handleBlockRewardMouseLeave }>
            <Text color="text.primary" fontSize="sm" display="inline" fontFamily="var(--global-font-body, var(--font-fallback))">
              <chakra.span whiteSpace="nowrap">
                <Hint label="PoW mining reward"/>
                Mining reward
              </chakra.span>
            </Text>
          </KDABreakdownItem>
          +
          <KDABreakdownItem
            ref={ txFeesValuesRef }
            isLoading={ isLoading }
            onMouseEnter={ handleTxFeesMouseEnter }
            onMouseLeave={ handleTxFeesMouseLeave }>
            <Text color="text.primary" fontSize="sm" display="inline" fontFamily="var(--global-font-body, var(--font-fallback))">
              <chakra.span whiteSpace="nowrap">
                <Hint label="Total transaction fees collected from all transactions in the block"/>
                Transaction fees
              </chakra.span>
            </Text>
          </KDABreakdownItem>
          -
          <KDABreakdownItem
            ref={ burntFeesValuesRef }
            isLoading={ isLoading }
            onMouseEnter={ handleBurntFeesMouseEnter }
            onMouseLeave={ handleBurntFeesMouseLeave }>
            <Text color="text.primary" fontSize="sm" display="inline" fontFamily="var(--global-font-body, var(--font-fallback))">
              <chakra.span whiteSpace="nowrap">
                <Hint label="Base fees burned (EIP-1559 mechanism)"/>
                Burnt fees
              </chakra.span>
            </Text>
          </KDABreakdownItem>
        </chakra.div>
        <RawDataSnippet
          data={ (
            <Text
              display="flex"
              flexDirection={{ base: 'column', md: 'row' }}
              color="text.secondary"
              fontSize="sm"
              whiteSpace="nowrap"
              gap={ 1 }
              fontFamily="var(--kda-typography-family-monospace-font)">
              { hasRewardBaseFee && (
                <Tooltip content="Block reward">
                  <BreakdownLabel
                    ref={ blockRewardLabelRef }
                    onMouseEnterValues={ handleBlockRewardValuesMouseEnter }
                    onMouseLeaveValues={ handleBlockRewardValuesMouseLeave }
                  >
                    <chakra.span display={{ base: '', md: 'none' }} fontFamily="var(--global-font-body, var(--font-fallback))">
                      Reward fee:
                    </chakra.span>
                    <span>{ rewardBaseFee }</span>
                  </BreakdownLabel>
                </Tooltip>
              )
              }
              { space }+{ space }
              { hasTxFees && (
                <Tooltip content="Total transaction fees">
                  <BreakdownLabel
                    ref={ txFeesLabelRef }
                    onMouseEnterValues={ handleTxFeesValuesMouseEnter }
                    onMouseLeaveValues={ handleTxFeesValuesMouseLeave }
                  >
                    <chakra.span display={{ base: '', md: 'none' }} fontFamily="var(--global-font-body, var(--font-fallback))">
                      Transaction fees:
                    </chakra.span>
                    <span>{ txFees }</span>
                  </BreakdownLabel>
                </Tooltip>
              ) }
              { space }-{ space }
              { hasBurntFees && (
                <Tooltip content="Burnt fees">
                  <BreakdownLabel
                    ref={ burntFeesLabelRef }
                    onMouseEnterValues={ handleBurntFeesValuesMouseEnter }
                    onMouseLeaveValues={ handleBurntFeesValuesMouseLeave }
                  >
                    <chakra.span display={{ base: '', md: 'none' }} fontFamily="var(--global-font-body, var(--font-fallback))">
                      Burnt fees:{ ' ' }
                    </chakra.span>
                    <span>{ burntFees }</span>
                  </BreakdownLabel>
                </Tooltip>
              ) }
            </Text>
          ) }
          isLoading={ isLoading }
        />
      </chakra.div>
    </chakra.div>
  );
};

KDABlockRewards.displayName = 'KDABlockRewards';

export default KDABlockRewards;
