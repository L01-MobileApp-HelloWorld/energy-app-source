import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../index';

describe('HomeScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<HomeScreen />);
    
    // Check if main elements are rendered
    expect(getByText('Chào Huy! 👋')).toBeTruthy();
    expect(getByText('Hôm nay bạn cảm thấy thế nào?')).toBeTruthy();
    expect(getByText('Dành 1 phút để thấu hiểm cảm xúc của mình')).toBeTruthy();
    expect(getByText('Bắt đầu kiểm tra')).toBeTruthy();
  });

  it('displays user greeting and shows time', () => {
    const { getByText } = render(<HomeScreen />);
    
    expect(getByText('Chào Huy! 👋')).toBeTruthy();
    // Time is dynamically generated, so just check the emoji exists
    expect(getByText('🧑')).toBeTruthy();
  });

  it('shows previous result card with correct content', () => {
    const { getByText } = render(<HomeScreen />);
    
    expect(getByText('Lần trước,')).toBeTruthy();
    expect(getByText('Tỉnh táo, sẵn sàng')).toBeTruthy();
    expect(getByText('Hôm nay, 12:00')).toBeTruthy();
  });

  it('displays menu items correctly', () => {
    const { getByText } = render(<HomeScreen />);
    
    expect(getByText('Kiểm tra lịch sử')).toBeTruthy();
    expect(getByText('Xem nhắc nhở')).toBeTruthy();
  });

  it('handles button press without crashing', () => {
    const { getByText } = render(<HomeScreen />);
    const startButton = getByText('Bắt đầu kiểm tra');
    
    expect(() => {
      fireEvent.press(startButton);
    }).not.toThrow();
  });

  it('does not crash when rendered', () => {
    expect(() => render(<HomeScreen />)).not.toThrow();
  });

  it('renders scroll view content properly', () => {
    const { getByText } = render(<HomeScreen />);
    
    // Check that both menu items are rendered
    expect(getByText('Kiểm tra lịch sử')).toBeTruthy();
    expect(getByText('Xem nhắc nhở')).toBeTruthy();
  });
});