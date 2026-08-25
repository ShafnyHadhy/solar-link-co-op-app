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
                {/* ===== TOP SECTION: brand + hero + headline ===== */}
                <View className="px-6 pt-4">

                    {/* Icon-based hero, replaces the old stock photo */}
                    <View className="mt-8 items-center">
                        <View className="h-28 w-28 items-center justify-center rounded-full bg-accent">
                            <View className="h-20 w-20 items-center justify-center rounded-full bg-primary">
                                <Feather name="sun" size={36} color={isDark ? "#1D1816" : "#231D1A"} />
                            </View>
                        </View>

                        {/* Stat chips */}
                        <View className="mt-6 flex-row gap-2">
                            <View className="items-center rounded-2xl border border-border bg-card/80 px-3.5 py-2.5">
                                <View className="flex-row items-center">
                                    <Feather name="home" size={12} color={iconColor} />
                                    <Text className="ml-1.5 text-sm font-bold text-card-foreground">1,240</Text>
                                </View>
                                <Text className="mt-0.5 text-[10px] text-muted-foreground">Homes</Text>
                            </View>

                            <View className="items-center rounded-2xl border border-border bg-card/80 px-3.5 py-2.5">
                                <View className="flex-row items-center">
                                    <Feather name="zap" size={12} color={iconColor} />
                                    <Text className="ml-1.5 text-sm font-bold text-card-foreground">2.4 MW</Text>
                                </View>
                                <Text className="mt-0.5 text-[10px] text-muted-foreground">Shared</Text>
                            </View>

                            <View className="items-center rounded-2xl border border-border bg-card/80 px-3.5 py-2.5">
                                <View className="flex-row items-center">
                                    <Feather name="wind" size={12} color={iconColor} />
                                    <Text className="ml-1.5 text-sm font-bold text-card-foreground">18t</Text>
                                </View>
                                <Text className="mt-0.5 text-[10px] text-muted-foreground">CO₂ Saved</Text>
                            </View>
                        </View>
                    </View>

                    {/* Headline */}
                    <View className="mt-9">
                        <Text className="text-3xl font-light tracking-tight text-foreground">
                            Smarter
                        </Text>
                        <View className="flex-row items-center flex-wrap gap-2 my-1">
                            <Text className="text-4xl font-extrabold tracking-tight text-foreground">
                                Solar
                            </Text>
                            <View className="rounded-xl bg-primary px-3 py-0.5">
                                <Text className="text-4xl font-extrabold tracking-tight text-primary-foreground">
                                    Energy
                                </Text>
                            </View>
                        </View>
                        <Text className="text-3xl font-extrabold tracking-tight text-foreground">
                            Starts With You
                        </Text>

                        <Text className="mt-2 text-sm leading-5 text-muted-foreground">
                            Stay informed about community energy usage and improve savings with smart solar sharing.
                        </Text>
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
                                onPress={() => handleSocialAuth("oauth_github")}
                            >
                                <View className="h-8 w-8 items-center justify-center rounded-full bg-card border border-border/50">
                                    <FontAwesome name="github" size={20} color={iconColor} />
                                </View>
                                <Text className="ml-3 flex-1 text-base font-semibold text-card-foreground">
                                    {isGitHubClicked ? "Connecting GitHub..." : "Continue with GitHub"}
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