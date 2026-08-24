import { getUserRole } from "@/lib/getUserRole";
import { useUser } from "@clerk/expo";
import { Redirect } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useColorScheme } from "nativewind";

export default function TabsLayout() {
  const { user, isSignedIn, isLoaded } = useUser();

  const role = getUserRole(user?.publicMetadata?.role);

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const tabTincolor = isDark ? "hsl(45 90% 60%)" : "hsl(45 97% 62%)";

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <NativeTabs tintColor={tabTincolor}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{
            default: "house",
            selected: "house.fill",
          }}
          md="house"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="energy">
        <NativeTabs.Trigger.Icon
          sf={{
            default: "bolt.circle",
            selected: "bolt.circle.fill",
          }}
          md="bolt"
        />
        <NativeTabs.Trigger.Label>Energy</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      {role === "solar_owner" && (
        <NativeTabs.Trigger name="share">
          <NativeTabs.Trigger.Icon
            sf={{
              default: "arrow.up.right.circle",
              selected: "arrow.up.right.circle.fill",
            }}
            md="share"
          />
          <NativeTabs.Trigger.Label>Share</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      )}

      {role === "manager" && (
        <NativeTabs.Trigger name="member">
          <NativeTabs.Trigger.Icon
            sf={{
              default: "person.3",
              selected: "person.3.fill",
            }}
            md="people"
          />
          <NativeTabs.Trigger.Label>Members</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      )}

      {role === "household" && (
        <NativeTabs.Trigger name="saving">
          <NativeTabs.Trigger.Icon
            sf={{
              default: "banknote",
              selected: "banknote.fill",
            }}
            md="account_balance_wallet"
          />
          <NativeTabs.Trigger.Label>Savings</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      )}

      {role === "technician" && (
        <NativeTabs.Trigger name="requests">
          <NativeTabs.Trigger.Icon
            sf={{
              default: "exclamationmark.triangle",
              selected: "exclamationmark.triangle.fill",
            }}
            md="add"
          />
          <NativeTabs.Trigger.Label>Requests</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Badge>2</NativeTabs.Trigger.Badge>
        </NativeTabs.Trigger>
      )}

      <NativeTabs.Trigger name="menu">
        <NativeTabs.Trigger.Icon
          sf={{
            default: "line.3.horizontal",
            selected: "line.3.horizontal",
          }}
          md="list"
        />
        <NativeTabs.Trigger.Label>Menu</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
