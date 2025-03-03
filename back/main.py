from fastapi import FastAPI,WebSocket
from typing import List
app =FastAPI()
connections : List[WebSocket] = []
@app.get('/')
async def root():
    return {"message":"Hello from Fastapi!"}

@app.websocket('/ws')
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connections.append(websocket)

    try:
        while True:
            data=await websocket.receive_text()
            for connection in connections:
                if connection !=websocket:
                    await connection.send_text(data)
    except Exception as e:
        print(f'WebSocket Error :{e}')
        connections.remove(websocket)


        
if __name__=='__main__':
    import uvicorn
    uvicorn.run(app,host="0.0.0.0",port=8000)

