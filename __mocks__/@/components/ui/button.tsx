import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

export const Button = ({ children, onPress, testID, ...props }: any) => (
  <TouchableOpacity onPress={onPress} testID={testID} {...props}>
    {children}
  </TouchableOpacity>
);

export const ButtonText = ({ children, ...props }: any) => (
  <Text {...props}>{children}</Text>
);