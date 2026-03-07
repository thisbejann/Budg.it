import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { MutableRefObject } from 'react';

export function usePreventNavigationWhilePending(
  isPending: boolean,
  allowRemoveRef?: MutableRefObject<boolean>,
) {
  const navigation = useNavigation();

  useEffect(
    () =>
      navigation.addListener('beforeRemove', (event) => {
        if (!isPending || allowRemoveRef?.current) {
          return;
        }

        event.preventDefault();
      }),
    [allowRemoveRef, isPending, navigation],
  );
}
