from fastapi import FastAPI, WebSocket
from typing import List
import uvicorn

app = FastAPI()
connections: List[WebSocket] = []

@app.get('/')
async def root():
    return {"message": "Hello from Fastapi!"}

@app.websocket('/ws')
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connections.append(websocket)
    
    # Notify others that a new user joined
    for connection in connections:
        if connection != websocket:
            await connection.send_text('{"type": "user-joined"}')

    try:
        while True:
            data = await websocket.receive_text()
            for connection in connections:
                if connection != websocket:
                    await connection.send_text(data)
    except Exception as e:
        print(f'WebSocket Error: {e}')
    finally:
        connections.remove(websocket)

if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=8000)

