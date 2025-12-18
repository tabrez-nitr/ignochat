'use client'
import React, { useState , useEffect } from 'react'
import { useRouter } from 'next/navigation';
import socket from '@/socket/socket';



function HomeComponents() {
   
    const [joinRoom, setJoinRoom] = useState(false);
    const [roomCode, setRoomCode] = useState(''); 
    const router = useRouter();



  useEffect(() => {
        console.log("Attempting to connect to server...");
        
        
        if (!socket.connected) {
            socket.connect();
        }

        // 2. Listen for success
        function onConnect() {
            console.log("✅ SUCCESS: Connected to server with ID:", socket.id);
        }

        // 3. Listen for ERRORS (This is the important part!)
        function onConnectError(err) {
            console.error("❌ CONNECTION ERROR:", err.message);
            console.log("Check your server terminal. Is it running?");
            console.log("Check your URL. Are you pointing to localhost:8000?");
        }

        socket.on("connect", onConnect);
        socket.on("connect_error", onConnectError);

        return () => {
            socket.off("connect", onConnect);
            socket.off("connect_error", onConnectError);
        };
    }, []);
     
    const handleJoinClick = () => {
        setJoinRoom(true);
    }


    // create room logic handel 
    const createRoomHandle = (e) =>{
        e.preventDefault();
        console.log("Create room clicked ")
        socket.emit('create-room',(response)=>{
            console.log('inside create room emit')
            // Server responds with the new room code
            // Navigate to chat page with the code in the URL
            router.push(`/chatRoom?room=${response.roomCode}&admin=true`)
        })
    }

    // room join logic 
    const handleJoinSubmit = () => {
        console.log("Joining room:", roomCode);
        if(!roomCode.trim())
        {
         return;
        }
        console.log("test")
        socket.emit('join-room' , roomCode , (response)=>{
            console.log("inside socket")
            if (response.success){
               //if room exists then we move inside the room 
               console.log("inside the joining room ")
               setRoomCode('')
               router.push(`/chatRoom?room=${roomCode}`);
               return 
            }
            else{
                alert(response.error);
            }
        })
    }

  return (
    // 1. Container: Wraps EVERYTHING so the black background never disappears
    <div className='min-h-screen flex items-center justify-center bg-black text-white p-4 font-sans'>

      {/* 2. The Card */}
      <div className='w-full max-w-md border border-neutral-800 bg-neutral-950 rounded-2xl p-8 shadow-2xl relative overflow-hidden'>
      
        {/* Header: Stays consistent across both views */}
        <div className='mb-10 text-center'>
            <div className='w-12 h-12 bg-white rounded-full mx-auto mb-6 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.3)]'>
                <div className='w-4 h-4 bg-black rounded-full'></div>
            </div>
            <h1 className='text-4xl font-bold tracking-tighter mb-2'>Igno Chat</h1>
            <p className='text-neutral-400'>
                {joinRoom ? 'Enter your secret key.' : 'Create a space or join the void.'}
            </p>
        </div>

        {/* 3. Conditional Rendering: Switch between Menu and Join Form */}
        {!joinRoom ? (
            // === VIEW 1: MAIN MENU ===
            <div className='flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500'>
                <button 
                onClick={createRoomHandle}
                className='w-full bg-transparent border border-neutral-800 text-neutral-300 h-14 rounded-lg font-bold text-lg hover:border-white hover:text-white transition-all duration-200'>
                    Create Room
                </button>

                <button
                    onClick={handleJoinClick}
                    className='w-full bg-transparent border border-neutral-800 text-neutral-300 h-14 rounded-lg font-bold text-lg hover:border-white hover:text-white transition-all duration-200'> 
                    Join Room
                </button>
            </div>
        ) : (
            // === VIEW 2: JOIN ROOM FORM ===
            <div className='flex flex-col gap-4 animate-in fade-in zoom-in duration-300'>
                
                {/* Styled Input */}
                <div className='relative'>
                    <input 
                        type="text"
                        placeholder='Enter Room Code'
                        value={roomCode}
                        onChange={(e)=> setRoomCode(e.target.value)} 
                        className='w-full bg-neutral-900 border border-neutral-800 text-white h-14 px-4 rounded-lg focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-center text-lg placeholder:text-neutral-600'
                    />
                </div>

                {/* Join Button */}
                <button 
                    onClick={handleJoinSubmit}
                    className='w-full bg-white/95 text-black h-14 rounded-lg font-semibold text-lg hover:bg-neutral-200 transition-colors duration-200'>
                    Enter Room
                </button>

                {/* Back Button */}
                <button 
                    onClick={() => setJoinRoom(false)}
                    className='text-neutral-500 hover:text-white text-sm mt-2 transition-colors'>
                    ← Go Back
                </button>
            </div>
        )}

      </div>
    </div>
  )
}

export default HomeComponents