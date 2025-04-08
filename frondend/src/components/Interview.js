// import React, { useState, useEffect, useRef } from 'react';
// import { getQuestions, saveAnswer, evaluateAnswer } from '../services/api';
// import Results from './Results';

// const Interview = () => {
//   const [questions, setQuestions] = useState([]);
//   const [currentQuestion, setCurrentQuestion] = useState(0);
//   const [candidateAnswers, setCandidateAnswers] = useState([]);
//   const [results, setResults] = useState([]);
//   const [testCompleted, setTestCompleted] = useState(false);
//   const [timer, setTimer] = useState(60);
//   const [isRecording, setIsRecording] = useState(false);
//   const [transcript, setTranscript] = useState('');

//   const videoRef = useRef(null);
//   const timerRef = useRef(null);
//   const recognitionRef = useRef(null);

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true
//       });
//       videoRef.current.srcObject = stream;

//       if ('webkitSpeechRecognition' in window) {
//         recognitionRef.current = new webkitSpeechRecognition();
//         recognitionRef.current.lang = 'en-US';
//         recognitionRef.current.continuous = true;
//         recognitionRef.current.interimResults = true;

//         recognitionRef.current.onresult = (event) => {
//           let finalTranscript = '';
//           for (let i = event.resultIndex; i < event.results.length; i++) {
//             if (event.results[i].isFinal) {
//               finalTranscript += event.results[i][0].transcript + ' ';
//             }
//           }
//           setTranscript(finalTranscript.trim());
//         };

//         recognitionRef.current.onerror = (event) => {
//           console.error('Speech recognition error:', event.error);
//         };

//         recognitionRef.current.start();
//         setIsRecording(true);
//         startTimer();
//       } else {
//         alert('Your browser does not support speech recognition.');
//       }
//     } catch (err) {
//       console.error('Error accessing media devices:', err);
//     }
//   };

//   const startTimer = () => {
//     clearInterval(timerRef.current);
//     timerRef.current = setInterval(() => {
//       setTimer((prev) => {
//         if (prev <= 1) {
//           clearInterval(timerRef.current);
//           stopRecording();
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   };

//   const stopRecording = () => {
//     if (recognitionRef.current) {
//       recognitionRef.current.stop();
//     }
//     setIsRecording(false);
//     clearInterval(timerRef.current);
//     saveTranscript();
//   };

//   const saveTranscript = async () => {
//     if (!transcript.trim()) {
//       alert('No answer detected! Please try again.');
//       return;
//     }

//     const updatedAnswers = [...candidateAnswers, transcript];
//     setCandidateAnswers(updatedAnswers);
//     await saveAnswer(questions[currentQuestion].id, transcript);
//     recognitionRef.current = null;

//     if (currentQuestion < questions.length - 1) {
//       setCurrentQuestion((prev) => prev + 1);
//       setTimer(60);
//       setTranscript('');
//     } else {
//       evaluateAnswers(updatedAnswers);
//     }
//   };

//   const evaluateAnswers = async (answers) => {
//     const results = [];
//     for (let i = 0; i < questions.length; i++) {
//       console.log(`Sending prompt:\n Correct: "${questions[i].correct_answer}".\n Candidate: "${answers[i]}"`);

//       const response = await evaluateAnswer(answers[i], questions[i].correct_answer);

//       results.push({
//         candidate_answer: answers[i],
//         similarity_score: response.data.similarity_score,
//       });
//     }
//     setResults(results);
//     setTestCompleted(true);
//   };

//   useEffect(() => {
//     const fetchQuestions = async () => {
//       const response = await getQuestions();
//       setQuestions(response.data);
//     };
//     fetchQuestions();
//   }, []);

//   return (
//     <div>
//       {!testCompleted ? (
//         <div>
//           {questions.length > 0 && (
//             <div>
//               <h2>Question {currentQuestion + 1}</h2>
//               <p>{questions[currentQuestion].question_text}</p>

//               <video
//                 ref={videoRef}
//                 autoPlay
//                 muted
//                 style={{ width: '500px', height: '375px' }}
//               />

//               <div>Time Remaining: {timer} seconds</div>

//               <div>
//                 <h3>Transcript:</h3>
//                 <p>{transcript}</p>
//               </div>

//               {!isRecording ? (
//                 <button onClick={startRecording}>Start Recording</button>
//               ) : (
//                 <button onClick={stopRecording}>Stop Recording Early</button>
//               )}
//             </div>
//           )}
//         </div>
//       ) : (
//         <Results results={results} />
//       )}
//     </div>
//   );
// };

// export default Interview;





//styling by vercel code



// "use client"

import React, { useState, useEffect, useRef } from 'react';
import { questionsAPI, evaluateAPI } from '../services/api';
import Results from './Results';
import '../styles/interviewcomponent.css';

// Declare webkitSpeechRecognition
declare var webkitSpeechRecognition: any;

const Interview = ({ setEvaluationData }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [candidateAnswers, setCandidateAnswers] = useState([]);
  const [results, setResults] = useState([]);
  const [testCompleted, setTestCompleted] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [animateQuestion, setAnimateQuestion] = useState(false);

  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      videoRef.current.srcObject = stream;

      if ('webkitSpeechRecognition' in window) {
        recognitionRef.current = new webkitSpeechRecognition();
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' ';
            }
          }
          setTranscript(finalTranscript.trim());
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
        };

        recognitionRef.current.start();
        setIsRecording(true);
        startTimer();
      } else {
        alert('Your browser does not support speech recognition.');
      }
    } catch (err) {
      console.error('Error accessing media devices:', err);
    }
  };

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    clearInterval(timerRef.current);
    saveTranscript();
  };

  const saveTranscript = async () => {
    if (!transcript.trim()) {
      alert('No answer detected! Please try again.');
      return;
    }

    const updatedAnswers = [...candidateAnswers, transcript];
    setCandidateAnswers(updatedAnswers);
    await questionsAPI.saveAnswer(questions[currentQuestion].id, transcript);
    recognitionRef.current = null;

    if (currentQuestion < questions.length - 1) {
      setAnimateQuestion(true);
      setTimeout(() => {
        setCurrentQuestion((prev) => prev + 1);
        setTimer(60);
        setTranscript('');
        setAnimateQuestion(false);
      }, 500);
    } else {
      evaluateAnswers(updatedAnswers);
    }
  };

  const evaluateAnswers = async (answers) => {
    const results = [];
    for (let i = 0; i < questions.length; i++) {
      console.log(`Sending prompt:\n Correct: "${questions[i].correct_answer}".\n Candidate: "${answers[i]}"`);

      const response = await evaluateAPI.evaluateAnswer(answers[i], questions[i].correct_answer);

      results.push({
        candidate_answer: answers[i],
        similarity_score: response.data.similarity_score,
      });
    }
    setResults(results);
    setTestCompleted(true);
    if (setEvaluationData) {
      setEvaluationData(results);
    }
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      const response = await questionsAPI.getQuestions();
      setQuestions(response.data);
    };
    fetchQuestions();
  }, []);

  return (
    <div className="interview-container">
      <header className="interview-header">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="brand">AI Interview</h1>
            <button className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      {!testCompleted ? (
        <div className="container interview-content">
          {questions.length > 0 && (
            <div className={`question-container ${animateQuestion ? 'slide-out' : ''}`}>
              <div className="question-header">
                <h2 className="question-number">Question {currentQuestion + 1}</h2>
                <div className={`timer ${timer <= 10 ? 'timer-warning' : ''}`}>
                  <div className="timer-circle">
                    <svg viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" className="timer-background" />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        className="timer-progress"
                        style={{
                          strokeDashoffset: `${(1 - timer / 60) * 283}`
                        }}
                      />
                    </svg>
                    <span className="timer-text">{timer}</span>
                  </div>
                  <p>seconds remaining</p>
                </div>
              </div>

              <div className="question-text">
                <p>{questions[currentQuestion].question_text}</p>
              </div>

              <div className="interview-media">
                <div className="video-container">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="candidate-video"
                  />
                  {isRecording && (
                    <div className="recording-indicator">
                      <span className="recording-dot"></span> Recording
                    </div>
                  )}
                </div>

                <div className="transcript-container">
                  <h3>Transcript:</h3>
                  <div className="transcript-box">
                    {transcript ? (
                      <p>{transcript}</p>
                    ) : (
                      <p className="transcript-placeholder">Your answer will appear here as you speak...</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="controls">
                {!isRecording ? (
                  <button
                    className="record-btn start"
                    onClick={startRecording}
                  >
                    <span className="btn-icon">●</span> Start Recording
                  </button>
                ) : (
                  <button
                    className="record-btn stop"
                    onClick={stopRecording}
                  >
                    <span className="btn-icon">■</span> Stop Recording Early
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Results results={results} />
      )}
    </div>
  );
};

export default Interview;
