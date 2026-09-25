// Solar Asset API Routes
// GET  /api/solar-assets?ownerId=...  — list owner's assets
// POST /api/solar-assets              — create new asset

import {
    createAsset,
    getAssetsByOwner,
} from "@/lib/server/services/solarService";
