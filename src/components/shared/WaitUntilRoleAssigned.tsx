import TabScreenBackground from '@/components/shared/TabScreenBackground';
import { useAuth } from '@clerk/expo';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

const WaitUntilRoleAssigned = () => {
    const { signOut } = useAuth();

    return (
        <View className='flex-1 bg-background px-6 justify-center items-center'>
            <TabScreenBackground />

            {/* Content Card */}
            <View className='w-full items-center rounded-[32px] border border-border/60 bg-card/70 dark:bg-card/40 p-8 shadow-sm'>
                {/* Sun / Clock Icon Badge */}
                <View className='mb-6 h-16 w-16 items-center justify-center rounded-2xl bg-secondary border border-border/50'>
                    <Feather name="sun" size={32} className="text-primary" color="#F59E0B" />
                </View>

                <View className='flex-row items-center justify-center mb-3'>
                    <Text className='text-3xl font-extrabold text-foreground'>
                        Solar-
                    </Text>
                    <Text className='text-3xl font-extrabold text-primary'>
                        Link
                    </Text>
                </View>

                <View className='self-center rounded-full bg-secondary px-3.5 py-1 mb-4'>
                    <Text className='text-xs font-semibold uppercase tracking-[1px] text-secondary-foreground'>
                        Pending Role Assignment
                    </Text>
                </View>

                <Text className='text-center text-sm font-medium text-foreground leading-5 mb-2'>
                    Welcome! Your account was created successfully.
                </Text>

                <Text className='text-center text-sm leading-5 text-muted-foreground'>
                    Please wait while an administrator assigns your role so you can start sharing and monitoring clean solar energy.
                </Text>

                <Pressable 
                    onPress={() => signOut()} 
                    className='mt-8 w-full flex-row items-center justify-center rounded-2xl bg-primary py-3.5 active:opacity-90 shadow-sm'
                >
                    <Feather name="log-out" size={18} color="#1F1B18" style={{ marginRight: 8 }} />
                    <Text className='text-base font-bold text-primary-foreground'>
                        Sign Out
                    </Text>
                </Pressable>
            </View>
        </View>
    );
};

export default WaitUntilRoleAssigned;
