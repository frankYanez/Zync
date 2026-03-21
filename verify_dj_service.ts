import * as djService from './src/features/dj/services/dj.service';

async function verify() {
    console.log("--- Verifying DJ Service ---");

    try {
        console.log("1. Testing getDjs...");
        // This is a real call to the API, so it might fail if the server is down or unreachable.
        const djs = await djService.getDjs("House");
        console.log("   Success:", Array.isArray(djs));
    } catch (e: any) {
        console.log("   getDjs call failed (expected if network is restricted):", e.message);
    }

    try {
        console.log("2. Testing getDjGigs...");
        const gigs = await djService.getDjGigs("test-id");
        console.log("   Success:", Array.isArray(gigs));
    } catch (e: any) {
        console.log("   getDjGigs call failed:", e.message);
    }

    try {
        console.log("3. Testing redeemPromoCode...");
        const redeem = await djService.redeemPromoCode("TEST_CODE");
        console.log("   Success:", !!redeem.code);
    } catch (e: any) {
        console.log("   redeemPromoCode call failed:", e.message);
    }

    console.log("--- Verification Finished ---");
}

verify();
