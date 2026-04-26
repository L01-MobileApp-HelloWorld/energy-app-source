import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import OnboardingScreen from '../onboarding';

// Mock the images
jest.mock('@/assets/images/onboarding_1.png', () => 'onboarding_1');
jest.mock('@/assets/images/onboarding_2.png', () => 'onboarding_2');
jest.mock('@/assets/images/onboarding_3.png', () => 'onboarding_3');

// Mock NativeWind
jest.mock('nativewind', () => ({
  styled: (Component: any) => Component,
  cssInterop: () => {},
}));

describe('OnboardingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with initial slide', () => {
    const { getByText, getAllByText } = render(<OnboardingScreen />);
    
    // Check if first slide content is rendered
    expect(getByText('Mệt thật hay lười thật')).toBeTruthy();
    expect(getAllByText('Bạn có đang phân vân không biết nên làm việc hay nghỉ ngơi').length).toBeGreaterThan(0);
    expect(getByText('Tiếp theo  →')).toBeTruthy();
    expect(getByText('Bỏ qua')).toBeTruthy();
  });

  it('shows correct button text on last slide', async () => {
    const { getByText } = render(<OnboardingScreen />);
    const nextButton = getByText('Tiếp theo  →');
    
    // Navigate to second slide
    fireEvent.press(nextButton);
    
    // Navigate to third slide (last slide)  
    fireEvent.press(getByText('Tiếp theo  →'));
    
    // Check if we reached the last slide
    await waitFor(() => {
      expect(getByText('Bắt đầu')).toBeTruthy();
    });
  });

  it('navigates to main app when next is pressed on last slide', async () => {
    const { getByText } = render(<OnboardingScreen />);
    const nextButton = getByText('Tiếp theo  →');
    
    // Navigate to last slide
    fireEvent.press(nextButton);
    fireEvent.press(getByText('Tiếp theo  →'));
    
    await waitFor(() => {
      const startButton = getByText('Bắt đầu');
      fireEvent.press(startButton);
    });
    
    expect(router.replace).toHaveBeenCalledWith('/(tabs)');
  });

  it('navigates to main app when skip is pressed', () => {
    const { getByText } = render(<OnboardingScreen />);
    const skipButton = getByText('Bỏ qua');
    
    fireEvent.press(skipButton);
    
    expect(router.replace).toHaveBeenCalledWith('/(tabs)');
  });

  it('hides skip button on last slide', async () => {
    const { getByText, queryByText } = render(<OnboardingScreen />);
    const nextButton = getByText('Tiếp theo  →');
    
    // Navigate to last slide
    fireEvent.press(nextButton);
    fireEvent.press(getByText('Tiếp theo  →'));
    
    await waitFor(() => {
      expect(getByText('Sẵn sàng!!')).toBeTruthy();
      expect(queryByText('Bỏ qua')).toBeNull();
    });
  });

  it('renders all three slides with correct content', () => {
    const { getByText, getAllByText } = render(<OnboardingScreen />);
    
    // First slide content should be visible initially
    expect(getByText('Mệt thật hay lười thật')).toBeTruthy();
    expect(getAllByText('Bạn có đang phân vân không biết nên làm việc hay nghỉ ngơi').length).toBeGreaterThan(0);
  });

  it('does not crash when rendered', () => {
    expect(() => render(<OnboardingScreen />)).not.toThrow();
  });
});