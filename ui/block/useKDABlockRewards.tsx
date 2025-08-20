import BigNumber from 'bignumber.js';
import { useMemo } from 'react';

import useApiQuery from 'lib/api/useApiQuery';
import { WEI, ZERO } from 'toolkit/utils/consts';

import getBlockReward from '../../lib/block/getBlockReward';
import type { BlockQuery } from './useBlockQuery';

export type TKDABlockRewardsData = {
  isLoading: boolean;
  loading: {
    queryIsLoading: boolean;
    withdrawalsIsLoading: boolean;
  };
  data: {
    blockData?: BlockQuery['data'];
    withdrawalsData?: { items: Array<{ amount?: string }> };
  } | null;
  calculatedValues: {
    rewardAmount: BigNumber;
    rewardBaseFee: BigNumber;
    txFees: BigNumber;
    burntFees: BigNumber;
    hasRewardBaseFee: boolean;
    hasTxFees: boolean;
    hasBurntFees: boolean;
  } | null;
  formattedValues: {
    rewardAmount?: string;
    rewardBaseFee?: string;
    txFees?: string;
    burntFees?: string;
  };
};

export const useKDABlockRewardsData = (query: BlockQuery): TKDABlockRewardsData => {
  const { data, isLoading: queryIsLoading } = query;
  const { data: withdrawalsData, isLoading: withdrawalsIsLoading } = useApiQuery('general:block_withdrawals', {
    queryParams: { height_or_hash: `${ data?.height }` },
  });
  const { totalReward, burntFees, txFees } = data ? getBlockReward(data) : { totalReward: ZERO, burntFees: ZERO, txFees: ZERO };

  const calculatedValues = useMemo(() => {
    if (!withdrawalsData?.items?.length) {
      return null;
    }

    const [ reward ] = withdrawalsData.items;
    const rewardAmount = BigNumber(reward.amount ?? 0);
    const rewardBaseFee = BigNumber(rewardAmount.toNumber() - totalReward.toNumber() + burntFees.toNumber());

    return {
      rewardAmount: rewardAmount.dividedBy(WEI),
      rewardBaseFee: rewardBaseFee.dividedBy(WEI),
      txFees: txFees.dividedBy(WEI),
      burntFees: burntFees.dividedBy(WEI),
      hasRewardBaseFee: !rewardBaseFee.isEqualTo(ZERO),
      hasTxFees: !txFees.isEqualTo(ZERO),
      hasBurntFees: !burntFees.isEqualTo(ZERO),
    };
  }, [ withdrawalsData, totalReward, burntFees, txFees ]);

  return {
    isLoading: withdrawalsIsLoading || queryIsLoading,
    loading: {
      queryIsLoading,
      withdrawalsIsLoading,
    },
    data: {
      blockData: data,
      withdrawalsData,
    },
    calculatedValues,
    formattedValues: {
      rewardAmount: calculatedValues?.rewardAmount ? BigNumber(calculatedValues.rewardAmount).toFixed() : undefined,
      rewardBaseFee: calculatedValues?.rewardBaseFee ? BigNumber(calculatedValues.rewardBaseFee).toFixed() : undefined,
      txFees: calculatedValues?.txFees ? BigNumber(calculatedValues.txFees).toFixed() : undefined,
      burntFees: calculatedValues?.burntFees ? BigNumber(calculatedValues.burntFees).toFixed() : undefined,
    },
  };
};
