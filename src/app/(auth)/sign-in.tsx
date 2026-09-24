import TabScreenBackground from '@/components/shared/TabScreenBackground';
import useSocialAuth from '@/hooks/useSocialAuth';
import { Feather, FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import { Image } from 'expo-image';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignInScreen() {
    const { handleSocialAuth, loadingStretergy } = useSocialAuth();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const isGoogleClicked = loadingStretergy === "oauth_google";
    const isAppleClicked = loadingStretergy === "oauth_apple";
    const isGitHubClicked = loadingStretergy === "oauth_github";

    const isLoading = isAppleClicked || isGitHubClicked || isGoogleClicked;

    const iconColor = isDark ? "#F3F4F6" : "#1F2937";
    const arrowColor = isDark ? "#9CA3AF" : "#6B7280";

    return (
        <SafeAreaView className='flex-1 bg-background'>
            <TabScreenBackground />

            <ScrollView
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}
                showsVerticalScrollIndicator={false}
                bounces={false}
                className="flex-1"
            >
                {/* ===== TOP SECTION: Minimalist CleanTech Brand & Hero ===== */}
                <View className="px-6 pt-4">
                    {/* Minimalist Brand Mark & Live Badge */}
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3">
                            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-md shadow-primary/30">
                                <Feather name="sun" size={24} color={isDark ? "#1D1816" : "#231D1A"} />
                            </View>
                            <View>
                                <Text className="text-xl font-bold tracking-tight text-foreground">
                                    SolarLink
                                </Text>
                                <Text className="text-[11px] font-medium tracking-wide text-muted-foreground">
                                    Community Solar Grid
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row items-center rounded-full border border-border/80 bg-card/80 px-3 py-1.5 shadow-sm">
                            <View className="mr-1.5 h-2 w-2 rounded-full bg-emerald-500" />
                            <Text className="text-xs font-semibold text-foreground">Grid Live</Text>
                        </View>
                    </View>

                    {/* Editorial Headline */}
                    <View className="mt-8">
                        <Text className="text-4xl font-light tracking-tight text-foreground">
                            Clean energy,
                        </Text>
                        <Text className="text-4xl font-extrabold tracking-tight text-foreground">
                            shared locally.
                        </Text>

                        <Text className="mt-3 text-sm leading-6 text-muted-foreground">
                            A neighborhood solar co-operative powered by shared rooftop generation and real-time smart metering.
                        </Text>
                    </View>

                    {/* Minimalist Micro-Metrics Ribbon */}
                    <View className="mt-6 flex-row flex-wrap gap-2">
                        <View className="flex-row items-center rounded-full border border-border/80 bg-card/70 px-3.5 py-2">
                            <Feather name="zap" size={13} color={isDark ? "#FBBF24" : "#D97706"} />
                            <Text className="ml-1.5 text-xs font-bold text-foreground">2.4 MW</Text>
                            <Text className="ml-1 text-xs text-muted-foreground">Shared</Text>
                        </View>

                        <View className="flex-row items-center rounded-full border border-border/80 bg-card/70 px-3.5 py-2">
                            <Feather name="wind" size={13} color={isDark ? "#34D399" : "#059669"} />
                            <Text className="ml-1.5 text-xs font-bold text-foreground">18.4t</Text>
                            <Text className="ml-1 text-xs text-muted-foreground">CO₂ Cut</Text>
                        </View>

                        <View className="flex-row items-center rounded-full border border-border/80 bg-card/70 px-3.5 py-2">
                            <Feather name="home" size={13} color={iconColor} />
                            <Text className="ml-1.5 text-xs font-bold text-foreground">1,240</Text>
                            <Text className="ml-1 text-xs text-muted-foreground">Homes</Text>
                        </View>
                    </View>
                </View>

                {/* ===== BOTTOM SECTION: login card, anchored to the bottom ===== */}
                <View className="pt-8">
                    <View className="rounded-t-[40px] border border-border/70 bg-card/80 dark:bg-card/50 p-5 shadow-sm">
                        <View className="self-center rounded-full bg-secondary px-3.5 py-1 mb-4">
                            <Text className="text-xs font-semibold uppercase tracking-[1px] text-secondary-foreground">
                                Connect & Get Started
                            </Text>
                        </View>

                        <View className="space-y-3">
                            <Pressable
                                className={`h-13.5 flex-row items-center rounded-2xl border border-border bg-background/60 py-3 px-4 active:bg-secondary/40 ${isLoading ? "opacity-70" : ""
                                    }`}
                                disabled={isLoading}
                                onPress={() => handleSocialAuth("oauth_google")}
                            >
                                <View className="h-8 w-8 items-center justify-center rounded-full bg-card border border-border/50">
                                    <Image
                                        source={require("../../../assets/images/google.png")}
                                        style={{ width: 18, height: 18 }}
                                    />
                                </View>

                                <Text className="ml-3 flex-1 text-base font-semibold text-card-foreground">
                                    {isGoogleClicked ? "Connecting Google..." : "Continue with Google"}
                                </Text>

                                <FontAwesome name="angle-right" size={18} color={arrowColor} />
                            </Pressable>

                            <Pressable
                                className={`mt-2.5 h-13.5 flex-row items-center rounded-2xl border border-border bg-background/60 py-3 px-4 active:bg-secondary/40 ${isLoading ? "opacity-70" : ""
                                    }`}
                                disabled={isLoading}
                                onPress={() => {}}
                            >
                                <View className="h-8 w-8 items-center justify-center rounded-full bg-card border border-border/50">
                                    <FontAwesome name="facebook" size={20} color="#1877F2" />
                                </View>
                                <Text className="ml-3 flex-1 text-base font-semibold text-card-foreground">
                                    Continue with Facebook
                                </Text>
                                <FontAwesome name="angle-right" size={18} color={arrowColor} />
                            </Pressable>

                            <Pressable
                                className={`mt-2.5 h-13.5 flex-row items-center rounded-2xl border border-border bg-background/60 py-3 px-4 active:bg-secondary/40 ${isLoading ? "opacity-70" : ""
                                    }`}
                                disabled={isLoading}
                                onPress={() => handleSocialAuth("oauth_apple")}
                            >
                                <View className="h-8 w-8 items-center justify-center rounded-full bg-card border border-border/50">
                                    <FontAwesome6 name="apple" size={18} color={iconColor} />
                                </View>
                                <Text className="ml-3 flex-1 text-base font-semibold text-card-foreground">
                                    {isAppleClicked ? "Connecting Apple..." : "Continue with Apple"}
                                </Text>
                                <FontAwesome name="angle-right" size={18} color={arrowColor} />
                            </Pressable>
                        </View>

                        <Text className="mt-4 text-center text-xs leading-4 text-muted-foreground">
                            By continuing, you agree to Solar-Link's Terms and Privacy Policy.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}