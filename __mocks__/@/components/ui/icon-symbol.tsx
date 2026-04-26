import React from 'react';
import { Text } from 'react-native';

export const IconSymbol = ({ name, size, color, ...props }: any) => (
  <Text {...props} style={{ fontSize: size || 16, color: color || '#000' }}>
    {name === 'clock.arrow.circlepath' ? '🕐' :
     name === 'alarm' ? '⏰' :
     name === 'chevron.right' ? '›' : '?'}
  </Text>
);