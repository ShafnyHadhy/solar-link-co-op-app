import useSocialAuth from '@/hooks/useSocialAuth';
import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignInScreen() {

    const { handleSocialAuth, loadingStretergy } = useSocialAuth();

    const isGoogleClicked = loadingStretergy === "oauth_google";
    const isAppleClicked = loadingStretergy === "oauth_apple";
    const isGitHubClicked = loadingStretergy === "oauth_github";

    const isLoading = isAppleClicked || isGitHubClicked || isGoogleClicked;

    return (
        <SafeAreaView className='flex-1 bg-primary dark:bg-secondary '>
            {/* decorative elements */}
            <View className="absolute -left-16 top-12 h-56 w-56 rounded-full bg-primary/80 dark:bg-background/40" />
            <View className="absolute right-[-74px] top-40 h-72 w-72 rounded-full bg-primary/70 dark:bg-background/35" />

            <View className='px-6 pt-4'>
                <Text className="text-center text-5xl font-extrabold tracking-tight text-primary-foreground uppercase font-mono dark:text-foreground">
                    Solar-Link
                </Text>

                <Text className="mt-1 text-center text-[14px] text-primary-foreground/80 dark:text-foreground/75">
                    Community based energy sharing platform
                </Text>

                <View className="mt-6 rounded-[30px] border border-white/20 bg-white/10 p-3">
                    <Image
                        source={require("../../../assets/images/auth.png")}
                        style={{ width: "100%", height: 300 }}
                        contentFit="contain"
                    />
                </View>
            </View>

            <View className="mt-8 flex-1 rounded-t-[36px] bg-card px-6 pb-8 pt-6">
                <View className="self-center rounded-full bg-secondary px-3 py-1">
                    <Text className="text-xs font-semibold uppercase tracking-[1px] text-secondary-foreground">
                        Welcome Back
                    </Text>
                </View>
                <Text className="mt-2 text-center text-sm leading-6 text-muted-foreground">
                    Choose a social provider and jump right into your personalized grocery experience.
                </Text>

                <View className="mt-6">
                    <Pressable
                        className={`mb-3 h-14 flex-row items-center rounded-2xl border border-border bg-card px-4 active:opacity-90 ${isLoading ? "opacity-70" : ""
                            }`}
                        disabled={isLoading}
                        onPress={() => handleSocialAuth("oauth_google")}
                    >
                        <View className="h-8 w-8 items-center justify-center rounded-full bg-white">
                            <Image
                                source={require("../../../assets/images/google.png")}
                                style={{ width: 20, height: 20 }}
                            />
                        </View>

                        <Text className="ml-3 flex-1 text-lg font-semibold text-card-foreground">
                            {isGoogleClicked ? "Connecting Google..." : "Continue with Google"}
                        </Text>

                        <FontAwesome name="angle-right" size={18} color="#5f6e66" />
                    </Pressable>

                    <Pressable
                        className={`mb-3 h-14 flex-row items-center rounded-2xl border border-border bg-card px-4 active:opacity-90 ${isLoading ? "opacity-70" : ""
                            }`}
                        disabled={isLoading}
                        onPress={() => handleSocialAuth("oauth_github")}
                    >
                        <View className="h-8 w-8 items-center justify-center rounded-full bg-white">
                            <FontAwesome name="github" size={24} color="#111" />
                        </View>
                        <Text className="ml-3 flex-1 text-lg font-semibold text-card-foreground">
                            {isGitHubClicked ? "Connecting GitHub..." : "Continue with GitHub"}
                        </Text>
                        <FontAwesome name="angle-right" size={18} color="#5f6e66" />
                    </Pressable>

                    <Pressable
                        className={`mb-3 h-14 flex-row items-center rounded-2xl border border-foreground bg-foreground px-4 active:opacity-90 ${isLoading ? "opacity-70" : ""
                            }`}
                        disabled={isLoading}
                        onPress={() => handleSocialAuth("oauth_apple")}
                    >
                        <View className="h-8 w-8 items-center justify-center rounded-full bg-white">
                            <FontAwesome6 name="apple" size={22} color="#111" />
                        </View>
                        <Text className="ml-3 flex-1 text-lg font-semibold text-background">
                            {isAppleClicked ? "Connecting Apple..." : "Continue with Apple"}
                        </Text>
                        <FontAwesome name="angle-right" size={18} color="#5f6e66" />
                    </Pressable>
                </View>

                <Text className="mt-3 text-center text-sm leading-5 text-muted-foreground">
                    By continuing, you agree to our Terms and Privacy Policy.
                </Text>
            </View>
        </SafeAreaView>
    )
}





// import { useAuth, useSignIn } from '@clerk/expo'
// import { Link } from 'expo-router'
// import { useState } from 'react'
// import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native'

// export default function SignInScreen() {
//     const { isLoaded } = useAuth()
//     const { signIn } = useSignIn()

//     const [emailAddress, setEmailAddress] = useState('')
//     const [password, setPassword] = useState('')

//     const handleSignIn = async () => {
//         if (!isLoaded) {
//             return
//         }

//         // Attempt to sign in with email and password
//         const { error } = await signIn.password({ emailAddress, password })

//         if (error) {
//             // Display error cleanly (e.g. wrong password)
//             Alert.alert("Sign In Failed", error.longMessage || error.message)
//             return
//         }

//         // Check the status on the signIn object itself
//         if (signIn.status === 'complete') {
//             // Finalize the sign in to set the active session
//             const { error: finalizeError } = await signIn.finalize()
//             if (finalizeError) {
//                 Alert.alert("Error", finalizeError.longMessage || finalizeError.message)
//             }
//         } else {
//             // If they need 2FA or email verification, show a message
//             Alert.alert("Sign In Incomplete", `Status: ${signIn.status}. You may need to verify your email.`)
//         }
//     }

//     return (
//         <View style={styles.container}>
//             <TextInput
//                 style={styles.input}
//                 autoCapitalize="none"
//                 value={emailAddress}
//                 placeholder="Enter email"
//                 onChangeText={setEmailAddress}
//                 keyboardType="email-address"
//             />
//             <TextInput
//                 style={styles.input}
//                 value={password}
//                 placeholder="Enter password"
//                 secureTextEntry={true}
//                 onChangeText={setPassword}
//             />
//             <Button title="Sign in" onPress={handleSignIn} />
//             <View style={styles.footer}>
//                 <Text>Don't have an account?</Text>
//                 <Link href="/(auth)/sign-up" style={styles.link}>
//                     Sign up
//                 </Link>
//             </View>
//         </View>
//     )
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         padding: 20,
//         gap: 12,
//         justifyContent: 'center',
//     },
//     input: {
//         borderWidth: 1,
//         borderColor: '#ccc',
//         borderRadius: 8,
//         padding: 12,
//         fontSize: 16,
//     },
//     footer: {
//         marginTop: 20,
//         alignItems: 'center',
//         gap: 8,
//     },
//     link: {
//         color: '#007AFF',
//         fontWeight: 'bold',
//     },
// })

