import { Ionicons } from "@expo/vector-icons";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useAppColors, useAppTheme } from "@/hooks/use-app-theme";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { Dimensions, Image, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const scale = (size: number) => (width / 390) * size;

const slides = [
  {
    id: "1",
    image: require("@/assets/images/onboarding_1.png"),
    title: "Mệt thật hay lười thật",
    description: "Bạn có đang phân vân không biết nên làm việc hay nghỉ ngơi",
  },
  {
    id: "2",
    image: require("@/assets/images/onboarding_2.png"),
    title: "Trả lời 10 câu hỏi\nchỉ trong 60 giây",
    description: "Bạn có đang phân vân không biết nên làm việc hay nghỉ ngơi",
  },
  {
    id: "3",
    image: require("@/assets/images/onboarding_3.png"),
    title: "Sẵn sàng!!",
    description: "Bắt đầu hành trình hiểu rõ bản thân",
  },
];

export default function OnboardingScreen() {
  const colors = useAppColors();
  const { resolvedTheme } = useAppTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const isLastSlide = currentIndex === slides.length - 1;

  const completeOnboarding = async () => {
    // Navigate to main app - no need to store state for testing
    router.replace("/login");
  };

  const handleNext = () => {
    if (!isLastSlide) {
      const nextIndex = currentIndex + 1;
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const handleScroll = (e: {
    nativeEvent: { contentOffset: { x: number } };
  }) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgSurface1 }}>
      {/* Skip button */}
      <View
        style={{
          height: 48,
          alignItems: "flex-end",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        {!isLastSlide && (
          <Pressable onPress={handleSkip} hitSlop={12}>
            <Text
              className="font-jakarta-bold"
              style={{ fontSize: scale(22), lineHeight: scale(30), color: colors.textPrimary }}
            >
              Bỏ qua
            </Text>
          </Pressable>
        )}
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {slides.map((slide) => (
          <View
            key={slide.id}
            style={{
              width,
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 32,
            }}
          >
            <Image
              source={slide.image}
              style={{ width: width * 0.72, height: width * 0.72 }}
              resizeMode="contain"
            />
            <Heading
              className="font-jakarta-bold text-center"
              style={{
                marginTop: 40,
                fontSize: scale(28),
                lineHeight: scale(38),
                color: colors.textPrimary,
              }}
            >
              {slide.title}
            </Heading>
            <Text
              className="font-jakarta-medium text-center"
              style={{ marginTop: 16, fontSize: scale(16), color: colors.textMuted }}
            >
              {slide.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Bottom section */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
        {/* Pagination dots */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            marginBottom: 32,
          }}
        >
          {slides.map((_, index) => (
            <View
              key={index}
              style={{
                height: 8,
                width: index === currentIndex ? 24 : 8,
                borderRadius: 4,
                backgroundColor: index === currentIndex ? colors.primaryMain : colors.textGhost,
              }}
            />
          ))}
        </View>

        {/* CTA button */}
        <Button
          size="xl"
          onPress={handleNext}
          className="w-full"
          endIcon={
            !isLastSlide ? (
              <Ionicons
                name="arrow-forward"
                size={18}
                color={resolvedTheme === "dark" ? colors.textPrimary : "#ffffff"}
              />
            ) : undefined
          }
        >
          <ButtonText>{isLastSlide ? "Bắt đầu" : "Tiếp theo"}</ButtonText>
        </Button>
      </View>
    </SafeAreaView>
  );
}
