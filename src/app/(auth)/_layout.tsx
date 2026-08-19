import { useUser } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";


export default function AuthRoutesLayout() {
    const { isSignedIn, isLoaded } = useUser()

    if (!isLoaded) {
        return null
    }

    if (isSignedIn) {

        return <Redirect href="/" />
    }
    return <Stack screenOptions={{ headerShown: false }} />
}