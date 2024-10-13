import { ArrowUp, AudioLines, Mic, Image as ImageIcon, X, Paperclip } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useState, useEffect, useRef } from 'react';


function FileUploadModal({ isModalOpen, toggleModal , sendNotification}) {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    sendNotification('File uploaded successfully.');
    toggleModal();
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
     
      const response = await fetch('/api/ingest', {
        method: 'POST',
        body: formData,
      });
      
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while uploading the file.');
    }
  };

  return (
    <>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out">
          <div className="relative bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl max-w-3xl w-full mx-4 transform transition-transform duration-500 ease-in-out">
            {/* Close button */}
            <button
              onClick={toggleModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
            >
              <X size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Upload a File</h1>

            {/* Dropzone */}
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag
                    and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PDF,XLSX,CSV,EMAIL,DOCX,etc
                  </p>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  accept=".pdf,.xlsx,.csv,.docx,.eml,.epub"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* File Preview */}
            {selectedFile && (
              <div className="mt-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">File Name:</span> {selectedFile.name}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">File Size:</span>{' '}
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSubmit}
                className={`bg-purple-500 text-white py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out ${
                  !selectedFile
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-purple-600'
                }`}
                disabled={!selectedFile}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


function ChatInput({ sendMessage, sendImage ,sendNotification }) {
  const [inputContent, setInputContent] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [image, setImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const toggleModal = () => {
    setIsModalOpen((prev) => !prev); // Toggle modal state
  };

  return (
    <>
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
                className="p-2 absolute top-2 left-28 rounded-lg bg-purple-500 dark:bg-purple-500 text-white"
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
            <button
              type="button"
              onClick={toggleModal}
              className="mr-2 p-2 rounded-lg bg-purple-500 dark:bg-purple-500 text-white"
            >
              <Paperclip size={24} />
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
      {  isModalOpen && <FileUploadModal isModalOpen={isModalOpen} toggleModal={toggleModal} sendNotification={sendNotification} /> }
    </>
  );
}

export default ChatInput;
