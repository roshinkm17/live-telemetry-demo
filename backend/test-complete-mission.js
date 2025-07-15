const WebSocket = require("ws");

async function testCompleteMission() {
  console.log("🚀 Testing Complete Mission Lifecycle\n");

  // Step 1: Create a mission
  console.log("1️⃣ Creating mission...");
  const createResponse = await fetch(
    "http://localhost:3001/api/start-mission",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }
  );

  const createData = await createResponse.json();
  if (!createData.success) {
    console.error("❌ Failed to create mission:", createData.error);
    return;
  }

  const missionId = createData.mission.missionId;
  console.log("✅ Mission created:", missionId);

  // Step 2: Wait a bit for telemetry to accumulate
  console.log("\n2️⃣ Waiting 10 seconds for telemetry to accumulate...");
  await new Promise((resolve) => setTimeout(resolve, 10000));

  // Step 3: Check mission status
  console.log("\n3️⃣ Checking mission status...");
  const statusResponse = await fetch(
    `http://localhost:3001/api/missions/${missionId}`
  );
  const statusData = await statusResponse.json();
  console.log("📊 Mission Status:", statusData.mission);

  // Step 4: Get telemetry history
  console.log("\n4️⃣ Getting telemetry history...");
  const telemetryResponse = await fetch(
    `http://localhost:3001/api/missions/${missionId}/telemetry?limit=5`
  );
  const telemetryData = await telemetryResponse.json();
  console.log(`📈 Telemetry Records: ${telemetryData.count}`);
  telemetryData.telemetry.slice(0, 3).forEach((t, i) => {
    console.log(
      `   Record ${i + 1}: Battery ${t.battery.toFixed(
        1
      )}%, Pos (${t.latitude.toFixed(6)}, ${t.longitude.toFixed(
        6
      )}), Alt ${t.altitude.toFixed(1)}m`
    );
  });

  // Step 5: Connect WebSocket and get real-time updates
  console.log("\n5️⃣ Connecting WebSocket for real-time updates...");
  const ws = new WebSocket("ws://localhost:3001");

  ws.on("open", () => {
    console.log("✅ WebSocket connected");
    ws.send(
      JSON.stringify({
        type: "subscribe",
        missionId: missionId,
      })
    );
  });

  let messageCount = 0;
  ws.on("message", (data) => {
    const message = JSON.parse(data.toString());

    switch (message.type) {
      case "subscribed":
        console.log("✅ Successfully subscribed to mission");
        break;
      case "telemetry":
        messageCount++;
        console.log(
          `📡 Real-time Update ${messageCount}: Battery ${message.data.battery.toFixed(
            1
          )}%, Alt ${message.data.altitude.toFixed(1)}m`
        );
        if (messageCount >= 3) {
          ws.close();
        }
        break;
      case "error":
        console.log("❌ Error:", message.message);
        break;
    }
  });

  // Step 6: Wait for WebSocket messages then end mission
  await new Promise((resolve) => setTimeout(resolve, 8000));

  // Step 7: End the mission
  console.log("\n6️⃣ Ending mission...");
  const endResponse = await fetch(
    `http://localhost:3001/api/missions/${missionId}/end`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }
  );

  const endData = await endResponse.json();
  if (endData.success) {
    console.log("✅ Mission ended successfully");
    console.log(
      `   Total Flight Time: ${endData.mission.totalFlightTime} seconds`
    );
    console.log(
      `   End Time: ${new Date(endData.mission.endTime).toLocaleString()}`
    );
  } else {
    console.log("❌ Failed to end mission:", endData.error);
  }

  // Step 8: Final telemetry check
  console.log("\n7️⃣ Final telemetry history...");
  const finalTelemetryResponse = await fetch(
    `http://localhost:3001/api/missions/${missionId}/telemetry?limit=10`
  );
  const finalTelemetryData = await finalTelemetryResponse.json();
  console.log(`📊 Total Telemetry Records: ${finalTelemetryData.count}`);

  console.log("\n🎉 Mission lifecycle test completed!");
  process.exit(0);
}

testCompleteMission().catch(console.error);
