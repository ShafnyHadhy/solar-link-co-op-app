import { useSSO } from "@clerk/expo"; //single sign on
import { useState } from "react";
import { Alert } from "react-native";

import * as Linking from "expo-linking";

const useSocialAuth = () => {
    const [loadingStretergy, setLoadingStretergy] = useState<String | null>(null);
    const { startSSOFlow } = useSSO();

    const handleSocialAuth = async (strategy: "oauth_google" | "oauth_github" |
        "oauth_apple") => {

        if (loadingStretergy) return; //guard clause against concurrent flows

        setLoadingStretergy(strategy);

        try {
            const { createdSessionId, setActive } = await startSSOFlow({ 
                strategy,
                redirectUrl: Linking.createURL('/')
            });

            if (!createdSessionId || !setActive) {
                Alert.alert("Sign-in incomplete", "Sign-in did not compete, Please try again later!");
                return;
            }

            await setActive({ session: createdSessionId });

        } catch (error) {

            console.log("Error during social sign in", error);
            Alert.alert("Error", "Failed to sign in. Please try again.");

        } finally {

            setLoadingStretergy(null);

        }
    }

    return { handleSocialAuth, loadingStretergy };
}

export default useSocialAuth;



