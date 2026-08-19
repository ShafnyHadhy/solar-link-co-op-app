import { useUser } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";


export default function AuthRoutesLayout() {
    const { user, isSignedIn, isLoaded } = useUser()

    if (!isLoaded) {
        return null
    }

    if (isSignedIn) {

        // const role = user.publicMetadata.role;

        // console.log("Logged in use role: ", role);

        return <Redirect href="/" />
    }
    return <Stack screenOptions={{ headerShown: false }} />
}