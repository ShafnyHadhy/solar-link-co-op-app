import TabScreenBackground from '@/components/shared/TabScreenBackground';
import { getApiUrl } from '@/lib/api';
import { useUser } from '@clerk/expo';
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TestResult = {
    name: string;
    status: 'pass' | 'fail' | 'running' | 'pending';
    detail?: string;
};

function uid() {
    return 'test_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

export default function ApiTestScreen() {
    const insets = useSafeAreaInsets();
    const { user } = useUser();
    const [results, setResults] = useState<TestResult[]>([]);
    const [running, setRunning] = useState(false);

    const TEST_USER_ID = uid();
    const TEST_ASSET_ID = uid();

    function updateResult(index: number, result: Partial<TestResult>) {
        setResults((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], ...result };
            return next;
        });
    }

    async function fetchJSON(url: string, options: RequestInit = {}) {
        const res = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            ...options,
        });
        return res.json();
    }

    async function runAllTests() {
        setRunning(true);

        const BASE = getApiUrl('/api');

        const tests: { name: string; fn: () => Promise<string> }[] = [
            // ─── 1. USER SYNC ───
            {
                name: '📋 Create Test User',
                fn: async () => {
                    const res = await fetchJSON(`${BASE}/users/sync`, {
                        method: 'POST',
                        body: JSON.stringify({
                            id: TEST_USER_ID,
                            name: 'Viva Test User',
                            email: `${TEST_USER_ID}@test.com`,
                            role: 'solar_owner',
                        }),
                    });
                    if (!res.success) throw new Error(JSON.stringify(res));
                    return `Created: ${res.data.user.name} (${res.data.action})`;
                },
            },
            {
                name: '📋 Fetch Test User',
                fn: async () => {
                    const res = await fetchJSON(`${BASE}/users/sync?userId=${TEST_USER_ID}`);
                    if (!res.success) throw new Error(JSON.stringify(res));
                    return `Found: ${res.data.user.name}, role: ${res.data.user.role}`;
                },
            },

            // ─── 2. SOLAR ASSETS ───
            {
                name: '🔆 Create Solar Asset',
                fn: async () => {
                    const res = await fetchJSON(`${BASE}/solar-assets`, {
                        method: 'POST',
                        body: JSON.stringify({
                            id: TEST_ASSET_ID,
                            ownerId: TEST_USER_ID,
                            assetType: 'solar_panel',
                            name: 'Home Solar System',
                            capacityKw: '5.00',
                            status: 'active',
                            location: 'Main Roof',
                        }),
                    });
                    if (!res.success) throw new Error(JSON.stringify(res));
                    return `Created: ${res.asset.name} (${res.asset.capacityKw} kW)`;
                },
            },
            {
                name: '🔆 List Solar Assets',
                fn: async () => {
                    const res = await fetchJSON(`${BASE}/solar-assets?ownerId=${TEST_USER_ID}`);
                    if (!res.success) throw new Error(JSON.stringify(res));
                    return `Found ${res.assets.length} asset(s): ${res.assets.map((a: any) => a.name).join(', ')}`;
                },
            },
            {
                name: '🔆 Get Asset by ID',
                fn: async () => {
                    const res = await fetchJSON(`${BASE}/solar-assets/${TEST_ASSET_ID}`);
                    if (!res.success) throw new Error(JSON.stringify(res));
                    return `${res.asset.name} | Status: ${res.asset.status} | Location: ${res.asset.location}`;
                },
            },
            {
                name: '🔆 Update Asset (→ maintenance)',
                fn: async () => {
                    const res = await fetchJSON(`${BASE}/solar-assets/${TEST_ASSET_ID}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            name: 'Updated Solar System',
                            status: 'maintenance',
                        }),
                    });
                    if (!res.success) throw new Error(JSON.stringify(res));
                    return `Updated: ${res.asset.name} | Status: ${res.asset.status}`;
                },
            },

            // ─── 3. ENERGY SURPLUS ───
            {
                name: '⚡ Check Energy Surplus',
                fn: async () => {
                    const res = await fetchJSON(`${BASE}/energy-surplus?assetId=${TEST_ASSET_ID}`);
                    if (!res.success) throw new Error(JSON.stringify(res));
                    const s = res.data.surplus;
                    return `Gen: ${s.generationKwh} kWh | Con: ${s.consumptionKwh} kWh | Surplus: ${s.surplusKwh} kWh`;
                },
            },

            // ─── 4. SOLAR OFFERS ───
            {
                name: '🤝 Create Offer (should fail — no surplus)',
                fn: async () => {
                    const res = await fetchJSON(`${BASE}/solar-offers`, {
                        method: 'POST',
                        body: JSON.stringify({
                            id: uid(),
                            ownerId: TEST_USER_ID,
                            assetId: TEST_ASSET_ID,
                            energyAmountKwh: 5.0,
                        }),
                    });
                    if (res.success === false) {
                        return `Correctly rejected: "${res.error}"`;
                    }
                    throw new Error('Should have been rejected!');
                },
            },
            {
                name: '🤝 List Offers (should be empty)',
                fn: async () => {
                    const res = await fetchJSON(`${BASE}/solar-offers?ownerId=${TEST_USER_ID}`);
                    if (!res.success) throw new Error(JSON.stringify(res));
                    return `${res.data.offers.length} offers found`;
                },
            },

            // ─── 5. VALIDATION TESTS ───
            {
                name: '🛡️ Reject missing fields (asset)',
                fn: async () => {
                    const res = await fetchJSON(`${BASE}/solar-assets`, {
                        method: 'POST',
                        body: JSON.stringify({ id: 'x' }),
                    });
                    if (res.error) return `Correctly rejected: "${res.error}"`;
                    throw new Error('Should have failed');
                },
            },
            {
                name: '🛡️ 404 for non-existent asset',
                fn: async () => {
                    const res = await fetchJSON(`${BASE}/solar-assets/does_not_exist`);
                    if (res.error) return `Correctly returned: "${res.error}"`;
                    throw new Error('Should have been 404');
                },
            },
        ];

        // Initialize all as pending
        setResults(tests.map((t) => ({ name: t.name, status: 'pending' as const })));

        // Run sequentially
        for (let i = 0; i < tests.length; i++) {
            updateResult(i, { status: 'running' });
            try {
                const detail = await tests[i].fn();
                updateResult(i, { status: 'pass', detail });
            } catch (err: any) {
                updateResult(i, { status: 'fail', detail: err.message });
            }
            // Small delay so the user can see each step
            await new Promise((r) => setTimeout(r, 300));
        }

        setRunning(false);
    }

    const passCount = results.filter((r) => r.status === 'pass').length;
    const failCount = results.filter((r) => r.status === 'fail').length;

    return (
        <View className="flex-1 bg-background">
            <TabScreenBackground />
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: insets.top > 0 ? insets.top + 10 : 24,
                    paddingBottom: 60,
                }}
            >
                {/* Header */}
                <View className="mb-5">
                    <Text className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-1">
                        Backend CRUD Verification
                    </Text>
                    <Text className="text-2xl font-black text-foreground tracking-tight">
                        API Test Suite 🧪
                    </Text>
                    <Text className="text-xs text-muted-foreground mt-1">
                        Tests solar assets, energy surplus, offers & validation against Neon DB
                    </Text>
                </View>

                {/* Run Button */}
                <Pressable
                    onPress={runAllTests}
                    disabled={running}
                    className={`rounded-2xl p-4 mb-5 flex-row items-center justify-center gap-2 ${
                        running
                            ? 'bg-amber-500/30 border border-amber-500/20'
                            : 'bg-amber-500 active:bg-amber-600'
                    }`}
                >
                    {running ? (
                        <ActivityIndicator color="#F59E0B" size="small" />
                    ) : (
                        <Feather name="play" size={18} color="#1C1917" />
                    )}
                    <Text className={`font-bold text-base ${running ? 'text-amber-500' : 'text-amber-950'}`}>
                        {running ? 'Running Tests...' : results.length > 0 ? 'Run Again' : 'Run All Tests'}
                    </Text>
                </Pressable>

                {/* Score */}
                {results.length > 0 && !running && (
                    <View className={`rounded-2xl p-4 mb-5 border ${
                        failCount === 0
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-red-500/10 border-red-500/30'
                    }`}>
                        <Text className={`text-center font-black text-lg ${
                            failCount === 0 ? 'text-emerald-500' : 'text-red-400'
                        }`}>
                            {failCount === 0 ? '✅ ALL TESTS PASSED' : `${failCount} FAILED`}
                        </Text>
                        <Text className="text-center text-xs text-muted-foreground mt-1">
                            {passCount} passed, {failCount} failed out of {results.length}
                        </Text>
                    </View>
                )}

                {/* Test Results */}
                {results.map((r, i) => (
                    <View
                        key={i}
                        className={`rounded-2xl border p-3.5 mb-2.5 ${
                            r.status === 'pass'
                                ? 'border-emerald-500/30 bg-emerald-500/5'
                                : r.status === 'fail'
                                ? 'border-red-500/30 bg-red-500/5'
                                : r.status === 'running'
                                ? 'border-amber-500/30 bg-amber-500/5'
                                : 'border-border/50 bg-card/50'
                        }`}
                    >
                        <View className="flex-row items-center gap-2 mb-1">
                            {r.status === 'pass' && <Text className="text-sm">✅</Text>}
                            {r.status === 'fail' && <Text className="text-sm">❌</Text>}
                            {r.status === 'running' && (
                                <ActivityIndicator color="#F59E0B" size="small" />
                            )}
                            {r.status === 'pending' && <Text className="text-sm">⏳</Text>}
                            <Text className="text-sm font-bold text-foreground flex-1" numberOfLines={1}>
                                {r.name}
                            </Text>
                        </View>
                        {r.detail && (
                            <Text
                                className={`text-xs ml-6 leading-relaxed ${
                                    r.status === 'fail' ? 'text-red-400' : 'text-muted-foreground'
                                }`}
                                numberOfLines={3}
                            >
                                {r.detail}
                            </Text>
                        )}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}
