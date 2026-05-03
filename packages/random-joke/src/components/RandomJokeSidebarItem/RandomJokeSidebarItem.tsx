import React from 'react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { SidebarItem } from '@backstage/core-components';
import EmojiEmotionsIcon from '@material-ui/icons/EmojiEmotions';
import { randomJokeRouteRef } from '../../routes';

export const RandomJokeSidebarItem = () => {
  const getPath = useRouteRef(randomJokeRouteRef);
  return (
    <SidebarItem
      icon={EmojiEmotionsIcon}
      to={getPath()}
      text="Random Joke"
    />
  );
};
