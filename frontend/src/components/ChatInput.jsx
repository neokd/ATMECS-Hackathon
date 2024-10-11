import { ArrowUp, AudioLines, Mic } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition, } from 'react-speech-recognition';
import { useState, useEffect, useRef } from 'react';

function ChatInput({ sendMessage }) {
    const [inputContent, setInputContent] = useState('');
    const [isListening, setIsListening] = useState(false);
    const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
    const timeoutId = useRef();
  
    useEffect(() => {
      // Reset the transcript and start listening when isListening becomes true
      if (isListening) {
        resetTranscript();
        SpeechRecognition.startListening({ continuous: true });
        // Set a timeout to stop listening after 10 seconds of silence
        timeoutId.current = setTimeout(() => {
          setIsListening(false);
          SpeechRecognition.stopListening();
        }, 5000);
      } else {
        // Clear the timeout when isListening becomes false
        clearTimeout(timeoutId.current);
        SpeechRecognition.stopListening();
      }
  
      // Clean up the timeout on component unmount
      return () => clearTimeout(timeoutId.current);
    }, [isListening, resetTranscript]);
  
  
    const handleLiveTranscript = () => {
      // Only update transcript if it is not empty and user has not started typing
      if (transcript && !inputContent.trim()) {
        setInputContent(transcript);
      }
  
      // Reset the timeout on every input
      clearTimeout(timeoutId.current);
  
      // Set a new timeout
      timeoutId.current = setTimeout(() => {
        setIsListening(false);
        SpeechRecognition.stopListening();
      }, 10000);
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (inputContent.trim() === '') return; // Don't send empty messages
      sendMessage(inputContent);
      console.log(inputContent);
      setInputContent(''); // Clear input after sending
      setIsListening(false); // Stop listening after sending
      resetTranscript(); // Clear the transcript after sending
    };
  
    const handleInputChange = (e) => {
      setInputContent(e.target.value);
    };
  
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    };
  
    return (
      <form onSubmit={handleSubmit} className="relative z-5 px-2 pb-6 2xl:px-6 2xl:pb-5 md:px-4 md:pb-4">
        <div className="relative z-2 border border-neutral-500 rounded-xl overflow-hidden dark:border-n-5">
          {/* Chat input area */}
          <div className="relative flex items-center min-h-[3.5rem] text-md p-2">
            <button
              type="button"
              onClick={() => setIsListening((prev) => !prev)}
              className={`mr-2 p-2 rounded-lg bg-purple-500 dark:bg-purple-500 text-white ${isListening ? 'bg-red-500' : ''}`}
            >
              {isListening ? <AudioLines size={24} /> : <Mic size={24} />}
            </button>
  
            <TextareaAutosize
              value={inputContent}
              minRows={1}
              maxRows={7}
              onChange={handleInputChange}
              className="w-full h-auto resize-none border-none outline-none focus:outline-none bg-transparent dark:border-neutral-500 placeholder-gray-500 dark:placeholder:text-gray-200 dark:caret-gray-200 dark:text-gray-50"
              placeholder={transcript || 'Type a message...'}
              onKeyDown={handleKeyDown}
              onFocus={() => handleLiveTranscript()}
            />
            <button
              type="submit"
              disabled={inputContent.length === 0}
              className={`absolute right-2 bg-purple-500 dark:bg-purple-500 text-white p-2 fonts-semibold rounded-lg ${inputContent.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ArrowUp size={24} />
            </button>
          </div>
        </div>
      </form>
    );
  }

export default ChatInput;