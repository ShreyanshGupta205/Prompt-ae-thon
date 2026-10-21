"""
WebSocket End-to-End Test for Resonance Local Server.
"""
import asyncio
import json
import websockets

async def test_ws():
    uri = "ws://127.0.0.1:8000/ws"
    print(f"Connecting to {uri}...")
    async with websockets.connect(uri) as ws:
        # 1. Expect initial engine_status
        msg1 = await asyncio.wait_for(ws.recv(), timeout=5)
        evt1 = json.loads(msg1)
        print("Received event 1:", evt1.get("type"), "-", evt1.get("message"))
        assert evt1.get("type") == "engine_status"

        # 2. Start session in demo mode
        print("Starting demo session...")
        await ws.send(json.dumps({
            "action": "start_session",
            "mode": "demo",
            "title": "Automated WS Verification Session"
        }))

        # 3. Receive status updated
        msg2 = await asyncio.wait_for(ws.recv(), timeout=5)
        evt2 = json.loads(msg2)
        print("Received event 2:", evt2.get("type"), "-", evt2.get("message"))

        # 4. Trigger simulated knock
        print("Triggering knock event...")
        await ws.send(json.dumps({
            "action": "demo_control",
            "command": "trigger_event",
            "event_type": "knock"
        }))

        msg3 = await asyncio.wait_for(ws.recv(), timeout=5)
        evt3 = json.loads(msg3)
        print("Received event 3:", evt3.get("type"), "-", evt3.get("label"), f"(score: {evt3.get('score')})")
        assert evt3.get("type") == "ambient"
        assert evt3.get("category") == "knock"

        # 5. Trigger simulated name call
        print("Triggering name call for 'Aman'...")
        await ws.send(json.dumps({
            "action": "demo_control",
            "command": "trigger_event",
            "event_type": "name_call",
            "name": "Aman"
        }))

        # Receive caption and name_called
        msg4 = await asyncio.wait_for(ws.recv(), timeout=5)
        evt4 = json.loads(msg4)
        print("Received event 4:", evt4.get("type"), "-", evt4.get("text"))
        assert evt4.get("type") == "caption"

        msg5 = await asyncio.wait_for(ws.recv(), timeout=5)
        evt5 = json.loads(msg5)
        print("Received event 5:", evt5.get("type"), "-", evt5.get("name"), f"in '{evt5.get('context')}'")
        assert evt5.get("type") == "name_called"
        assert evt5.get("name") == "Aman"

        print("\nAll WebSocket interaction checks passed successfully!")

if __name__ == "__main__":
    asyncio.run(test_ws())
