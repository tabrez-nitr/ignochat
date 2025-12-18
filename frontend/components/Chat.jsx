'use client'
import { useEffect, useState, useRef , Suspense } from "react"
import { useSearchParams , useRouter  } from "next/navigation";
import socket from "@/socket/socket"


function ChatContent() {
    const [msg, setMsg] = useState('');
    const [allMsg, setAllMsg] = useState([]);
     const messagesEndRef = useRef(null);// Ref to auto-scroll to bottom
    

     // get room code from url 
     const searchParams = useSearchParams();
     const router = useRouter();
     const roomCode = searchParams.get('room');
     const isAdmin = searchParams.get('admin') == 'true';

     // if there is no room code go back home 
     useEffect(()=>{

        if(!roomCode)
        {
            router.push('/')
            return 
        }
       
        socket.connect(); // Connect manually on mount
        //creating functions which will be passed to socket and run seprately 
        function connect(){
            console.log("connected to socket" , socket.id);
        }
        // handel standard message 
        function onMessage(newMessage){
            // We assume backend sends just the string or object
            // For now, let's wrap it uniformly
            setAllMsg((prev)=>[...prev,{text : newMessage ,type : 'received'}]);
        }
        function onSystemMessage(sysMsg){
             setAllMsg((prev)=>[...prev,{text : sysMsg , type : 'system'}]);
        }
        //if admin leaves the room 
        function onRoomClosed(){
            alert('Admin Has left the room ')
            router.push('/')
        }



        // match the functions with socket 

        socket.on('connect' , connect); // for the connection 
        socket.on('receive-message' , onMessage);  // to receive message 
        socket.on('system-message' , onSystemMessage); //to receive system message 
        socket.on('room-closed' , onRoomClosed);

        return()=>{
            socket.off('connect', connect);
            socket.off('receive-message', onMessage);
            socket.off('system-message', onSystemMessage);
            socket.off('room-closed', onRoomClosed);
        }
     },[roomCode , router])


    
   

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [allMsg]);



    const handleSubmit = (e) => {
        e.preventDefault();

        if (msg.trim()) {
            setAllMsg((prev)=> [...prev,{text : msg , type : 'sent'}])
            // send to server 
            socket.emit('send-message', {roomCode ,message : msg});
            setMsg('');
        }
    }

   return (
        <div className="flex flex-col h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
            
            {/* Header */}
            <header className="flex-none h-16 border-b border-neutral-900 flex items-center px-6 justify-between bg-black/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                        <h1 className="text-sm font-bold tracking-widest uppercase text-neutral-400">Live Feed</h1>
                        <p className="text-[15px] text-neutral-400">Room: {roomCode}</p>
                    </div>
                </div>
                <span className="text-s text-neutral-600 font-mono">
                    {isAdmin ? "ADMIN" : "GUEST"}
                </span>
            </header>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
                {allMsg.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-600 gap-2">
                        <p className="text-sm">The room is quiet.</p>
                    </div>
                ) : (
                    <ul className="space-y-3 pb-4">
                        {allMsg.map((message, index) => {
                            // Check message type for alignment
                            const isSent = message.type === 'sent';
                            const isSystem = message.type === 'system';

                            if (isSystem) {
                                return (
                                    <li key={index} className="text-center text-xs text-neutral-500 my-2">
                                        {message.text}
                                    </li>
                                )
                            }

                            return (
                                <li key={index} className={`flex w-full animate-in slide-in-from-bottom-2 fade-in duration-300 ${isSent ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`inline-block px-4 py-2 rounded-2xl max-w-[80%] wrap-break-words text-sm md:text-base 
                                        ${isSent 
                                            ? 'bg-white text-black rounded-tr-sm' 
                                            : 'bg-neutral-900 text-neutral-200 rounded-tl-sm'
                                        }`}>
                                        {/* CRITICAL FIX: Render message.text, not message */}
                                        {message.text}
                                    </div>
                                </li>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </ul>
                )}
            </div>

            {/* Input Area */}
            <div className="flex-none p-4 pb-6 bg-black">
                <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto w-full">
                    <input
                        className="w-full bg-neutral-900 text-white placeholder:text-neutral-600 rounded-full py-4 pl-6 pr-16 focus:outline-none focus:ring-1 focus:ring-neutral-700 transition-all text-sm"
                        type="text"
                        onChange={(e) => setMsg(e.target.value)}
                        value={msg}
                        placeholder="Type a message..." 
                    />
                    <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-black rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-neutral-200 transition-colors disabled:opacity-50"
                        type="submit"
                        disabled={!msg.trim()}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    )
}
// 3. CREATE THE WRAPPER (This becomes the default export)
export default function ChatPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen bg-black text-neutral-500">Loading Chat Room...</div>}>
            <ChatContent />
        </Suspense>
    )
}