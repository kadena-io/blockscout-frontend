import { useQuery } from '@tanstack/react-query';
import React from 'react';

import type { FeaturedNetwork } from 'types/networks';

import config from 'configs/app';
import type { ResourceError } from 'lib/api/resources';
import useFetch from 'lib/hooks/useFetch';
import * as mixpanel from 'lib/mixpanel/index';
import { useDisclosure } from 'toolkit/hooks/useDisclosure';

export function useNetworkMenu() {
  const { open, onClose, onOpen, onOpenChange, onToggle } = useDisclosure();

  const fetch = useFetch();
  const { isPending, data } = useQuery<unknown, ResourceError<unknown>, Array<FeaturedNetwork>>({
    queryKey: [ 'featured-network' ],
    queryFn: async() => fetch(config.UI.navigation.featuredNetworks || '', undefined, { resource: 'featured-network' }),
    enabled: Boolean(config.UI.navigation.featuredNetworks) && open,
    staleTime: Infinity,
  });

  const handleOpenChange = React.useCallback((details: { open: boolean }) => {
    if (details.open) {
      mixpanel.logEvent(mixpanel.EventTypes.BUTTON_CLICK, { Content: 'Network menu', Source: 'Header' });
    }
    onOpenChange(details);
  }, [ onOpenChange ]);

  const networkGroups = React.useMemo(
    () => data?.map(({ group }) => group).filter((group, index, self) => self.indexOf(group) === index) || []
    , [ data ]);

  return React.useMemo(() => ({
    open,
    onClose,
    onOpen,
    onToggle,
    onOpenChange: handleOpenChange,
    isPending,
    data,
    availableTabs: networkGroups,
  }), [ open, onClose, onOpen, onToggle, handleOpenChange, data, isPending, networkGroups ]);
}
