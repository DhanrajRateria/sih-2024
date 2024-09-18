'use client'
// src/app/download/page.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './download.module.css';

const throttle = (func, delay) => {
  let lastCall = 0;
  return (...args) => {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return func(...args);
  };
};

const InteractionCapture = () => {
  const [interactionData, setInteractionData] = useState({
    mouseMovements: [],
    keystrokes: [],
    scrollingPatterns: [],
    ipAddress: '',
  });

  useEffect(() => {
    // Throttled function to handle mouse movements every 100ms
    const handleMouseMove = throttle((event) => {
      setInteractionData((prevState) => ({
        ...prevState,
        mouseMovements: [
          ...prevState.mouseMovements,
          { x: event.clientX, y: event.clientY, timestamp: Date.now() },
        ],
      }));
    }, 100); // Throttle to 100ms

    // Capture keystrokes
    const handleKeyDown = (event) => {
      setInteractionData((prevState) => ({
        ...prevState,
        keystrokes: [
          ...prevState.keystrokes,
          { key: event.key, timestamp: Date.now() },
        ],
      }));
    };

    // Capture scrolling patterns
    const handleScroll = () => {
      setInteractionData((prevState) => ({
        ...prevState,
        scrollingPatterns: [
          ...prevState.scrollingPatterns,
          { scrollY: window.scrollY, timestamp: Date.now() },
        ],
      }));
    };

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll);

    // Get client IP address
    axios.get('https://api.ipify.org?format=json').then((response) => {
      setInteractionData((prevState) => ({
        ...prevState,
        ipAddress: response.data.ip,
      }));
    });

    // Cleanup function to remove event listeners
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    // Send mouse movement data every 100ms
    const mouseMovementInterval = setInterval(() => {
      axios.post('/api/store-interactions', interactionData)
        .then((response) => {
          console.log('Mouse movements sent:', response.data);
        })
        .catch((error) => {
          console.error('Error sending mouse movements:', error);
        });
    }, 100); // 100ms

    // Send all interaction data every 30 seconds
    const allDataInterval = setInterval(() => {
      axios.post('/api/store-interactions', interactionData)
        .then((response) => {
          console.log('Data stored successfully:', response.data);
        })
        .catch((error) => {
          console.error('Error storing data:', error);
        });

      // Reset interaction data to start fresh for the next interval
      setInteractionData((prevState) => ({
        mouseMovements: [],
        keystrokes: [],
        scrollingPatterns: [],
        ipAddress: prevState.ipAddress, // Keep IP address
      }));
    }, 30000); // 30 seconds

    return () => {
      clearInterval(mouseMovementInterval);
      clearInterval(allDataInterval); // Cleanup intervals on component unmount
    };
  }, [interactionData]);

  const [showOtp, setShowOtp] = useState(false);
  const [showSecurityQuestion, setShowSecurityQuestion] = useState(false);
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const correctAnswerRef = useRef(null);

  const generateSecurityQuestion = () => {
    // Generate a simple math question
    const num1 = Math.floor(Math.random() * 10) + 1; // Random number between 1 and 10
    const num2 = Math.floor(Math.random() * 10) + 1;
    setSecurityQuestion(`What is ${num1} + ${num2}?`);
    correctAnswerRef.current = num1 + num2; // Store the correct answer
  };

  const showOtpSection = () => {
    // Check if the user has moved the mouse enough times to be considered a human
    if (interactionData.mouseMovements.length > 3) {
      setShowOtp(true);
      alert('Verified as human');
    } else {
      // If not verified, show security question
      alert('Could not verify as human. Please answer the security question.');
      generateSecurityQuestion();
      setShowSecurityQuestion(true);
    }
  };

  const handleSecurityQuestionSubmit = (e) => {
    e.preventDefault();
    if (parseInt(userAnswer) === correctAnswerRef.current) {
      setShowOtp(true);
      setShowSecurityQuestion(false);
      alert('Security question answered correctly. Verified as human.');
    } else {
      alert('Incorrect answer. Please try again.');
    }
  };

  return (
    <div className={styles.interactionPage}>
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>eAadhaar Download</h1>
        </div>
      </header>

      <div className={styles.mainContainer}>
        <div className={styles.formSection}>
          <form id="aadhaar-form">
            <p className={styles.instructions}>
              Select 12 digit Aadhaar Number / 16 digit Virtual ID (VID) Number / 28 digit Enrollment ID (EID) Number
            </p>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input type="radio" name="id-type" value="aadhaar" defaultChecked /> Aadhaar Number
              </label>
              <label className={styles.radioLabel}>
                <input type="radio" name="id-type" value="enrollment" /> Enrollment ID Number
              </label>
              <label className={styles.radioLabel}>
                <input type="radio" name="id-type" value="virtual" /> Virtual ID Number
              </label>
            </div>

            <div className={styles.inputGroup}>
              <input type="text" id="aadhaar-number" placeholder="Enter Aadhaar Number" required />
            </div>

            <button type="button" className={styles.button} onClick={showOtpSection}>Send OTP</button>

            {showSecurityQuestion && (
              <div className={styles.securityQuestionSection}>
                <form onSubmit={handleSecurityQuestionSubmit}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="security-question">Security Question:</label>
                    <p>{securityQuestion}</p>
                    <input
                      type="text"
                      id="security-question-answer"
                      placeholder="Your Answer"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className={styles.button}>Submit Answer</button>
                </form>
              </div>
            )}

            {showOtp && (
              <div className={styles.otpSection}>
                <div className={styles.inputGroup}>
                  <label htmlFor="otp">Enter OTP</label>
                  <input type="text" id="otp" placeholder="Enter OTP" required />
                </div>
                <div className={styles.errorMessage}>
                  <span className={styles.errorIcon}>⚠</span> This is a required field and valid data to be entered.
                </div>
                <button type="submit" className={styles.buttonSubmit}>Verify & Download</button>
              </div>
            )}
          </form>
        </div>

        <div className={styles.faqSection}>
          <h3 className={styles.faqTitle}>Frequently Asked Questions</h3>
          <ul className={styles.faqList}>
            <li>What is e-Aadhaar?</li>
            <li>Is e-Aadhaar equally valid like physical copy of Aadhaar?</li>
            <li>What is Masked Aadhaar?</li>
            <li>How to validate digital signatures in e-Aadhaar?</li>
            <li>What is the password of e-Aadhaar?</li>
            <li>What supporting software is needed to open e-Aadhaar?</li>
            <li>How can an Aadhaar Number holder download e-Aadhaar?</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InteractionCapture;
