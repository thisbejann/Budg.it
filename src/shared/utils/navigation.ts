import type { MutableRefObject } from 'react';
import { InteractionManager, Keyboard } from 'react-native';

type NavigationWithBack = {
  canGoBack: () => boolean;
  goBack: () => void;
};

/**
 * Dismisses the keyboard and safely closes the current screen after interactions settle.
 * The optional close-request ref makes close scheduling one-shot per mutation action.
 */
export function safeCloseAfterMutation(
  navigation: NavigationWithBack,
  closeRequestedRef?: MutableRefObject<boolean>,
) {
  if (closeRequestedRef?.current) {
    return;
  }

  if (closeRequestedRef) {
    closeRequestedRef.current = true;
  }

  Keyboard.dismiss();
  InteractionManager.runAfterInteractions(() => {
    requestAnimationFrame(() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    });
  });
}

