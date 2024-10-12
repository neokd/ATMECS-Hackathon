import { ArrowUp, AudioLines, Mic, Image as ImageIcon, X } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useState, useEffect, useRef } from 'react';

function ChatInput({ sendMessage, sendImage }) {
  const [inputContent, setInputContent] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [image, setImage] = useState(null);
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const timeoutId = useRef(null);

  useEffect(() => {
    if (isListening) {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
      timeoutId.current = setTimeout(() => {
        setIsListening(false);
        SpeechRecognition.stopListening();
      }, 5000);
    } else {
      clearTimeout(timeoutId.current);
      SpeechRecognition.stopListening();
    }
    return () => clearTimeout(timeoutId.current);
  }, [isListening, resetTranscript]);

  const handleLiveTranscript = () => {
    if (transcript && !inputContent.trim()) {
      setInputContent(transcript);
    }
    clearTimeout(timeoutId.current);
    timeoutId.current = setTimeout(() => {
      setIsListening(false);
      SpeechRecognition.stopListening();
    }, 10000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputContent.trim() === '' && !image) return; // Don't send empty messages or images
    if (image) {
      sendImage(image); // Send the image if it exists
      setImage(null); // Clear the image preview after sending
    }
    if (inputContent.trim()) {
      sendMessage(inputContent); // Send the message
      setInputContent(''); // Clear input after sending
    }
    setIsListening(false);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
  };

  return (
    <form onSubmit={handleSubmit} className="relative z-5 px-2 pb-6 2xl:px-6 2xl:pb-5 md:px-4 md:pb-4">
      
      <div className="relative z-2 border border-neutral-500 rounded-xl overflow-hidden dark:border-n-5">
      {image && (
          <div className="flex items-center mt-2 mx-2">
            <img
              src={URL.createObjectURL(image)}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg mr-2"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="p-2 rounded-lg bg-purple-500 dark:bg-purple-500 text-white"
            >
              <X size={24} />
              </button>
          </div>
        )}
        {/* Chat input area */}
        <div className="relative flex items-center min-h-[3.5rem] text-md p-2">
          <button
            type="button"
            onClick={() => setIsListening((prev) => !prev)}
            className={`mr-2 p-2 rounded-lg bg-purple-500 dark:bg-purple-500 text-white ${isListening ? 'bg-red-500' : ''}`}
          >
            {isListening ? <AudioLines size={24} /> : <Mic size={24} />}
          </button>
          <label htmlFor="image-upload" className="cursor-pointer mr-2 p-2 rounded-lg bg-purple-500 dark:bg-purple-500 text-white">
            <ImageIcon size={24} />
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>

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
            disabled={inputContent.length === 0 && !image}
            className={`absolute right-2 bg-purple-500 dark:bg-purple-500 text-white p-2 fonts-semibold rounded-lg ${inputContent.length === 0 && !image ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ArrowUp size={24} />
          </button>
        </div>
      </div>
    </form>
  );
}

export default ChatInput;
