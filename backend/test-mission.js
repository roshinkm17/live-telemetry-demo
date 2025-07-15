const WebSocket = require("ws");

async function testMissionCreation() {
  console.log("🧪 Testing mission creation...");

  try {
    const response = await fetch("http://localhost:3001/api/start-mission", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    console.log("✅ Mission created:", data);

    if (data.success && data.mission) {
      return data.mission.missionId;
    }
  } catch (error) {
    console.error("❌ Error creating mission:", error);
  }
}

function testWebSocketConnection(missionId) {
  console.log(`🧪 Testing WebSocket connection for mission: ${missionId}`);

  const ws = new WebSocket("ws://localhost:3001");

  ws.on("open", () => {
    console.log("✅ WebSocket connected");

    // Subscribe to mission updates
    ws.send(
      JSON.stringify({
        type: "subscribe",
        missionId: missionId,
      })
    );
  });

  ws.on("message", (data) => {
    const message = JSON.parse(data.toString());

    switch (message.type) {
      case "telemetry":
        console.log("📡 Telemetry Update:");
        console.log(`   Battery: ${message.data.battery.toFixed(1)}%`);
        console.log(
          `   Position: ${message.data.latitude.toFixed(
            6
          )}, ${message.data.longitude.toFixed(6)}`
        );
        console.log(`   Altitude: ${message.data.altitude.toFixed(1)}m`);
        console.log("---");
        break;
      case "subscribed":
        console.log(
          "✅ Successfully subscribed to mission:",
          message.missionId
        );
        break;
      case "error":
        console.log("❌ Error:", message.message);
        break;
      default:
        console.log("📡 Message:", message);
    }
  });

  ws.on("close", () => {
    console.log("❌ WebSocket disconnected");
  });

  ws.on("error", (error) => {
    console.error("❌ WebSocket error:", error);
  });

  setTimeout(() => {
    ws.close();
    process.exit(0);
  }, 10000);
}

async function runTests() {
  console.log("🚀 Starting mission tests...\n");

  const missionId = await testMissionCreation();

  if (missionId) {
    console.log("\n⏳ Waiting 2 seconds before testing WebSocket...\n");
    setTimeout(() => {
      testWebSocketConnection(missionId);
    }, 2000);
  }
}

runTests();
