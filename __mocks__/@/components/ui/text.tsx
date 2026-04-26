import React from 'react';
import { Text as RNText } from 'react-native';

export const Text = ({ children, ...props }: any) => (
  <RNText {...props}>{children}</RNText>
);