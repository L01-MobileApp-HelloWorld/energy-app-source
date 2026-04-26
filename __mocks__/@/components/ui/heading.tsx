import React from 'react';
import { Text } from 'react-native';

export const Heading = ({ children, ...props }: any) => (
  <Text {...props}>{children}</Text>
);