import React, { useState } from 'react';
import styles from './FormElement.module.css';

const FormElement = ({ element, response, onResponse, onSubmit, isSubmitted }) => {
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(phone);
  };

  const validateInput = (value, type) => {
    if (type === 'email-input' && value && !validateEmail(value)) {
      return 'Please enter a valid email address';
    } 
    if (type === 'phone-input' && value && !validatePhone(value)) {
      return 'Please enter a valid phone number';
    }
    return '';
  };

  const handleSubmitClick = () => {
    const error = validateInput(response, element.type);
    if (error) {
      alert(error);
      return;
    }
    if (element.required && !response) {
      alert('This field is required');
      return;
    }
    onSubmit(element._id);
  };

  const renderSubmitButton = () => (
    <button 
      className={styles.submitButton}
      onClick={handleSubmitClick}
      type="button"
      disabled={isSubmitted}
    >
      <svg 
        className={styles.submitIcon} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  );

  const renderResponseBubble = () => (
    <div className={styles.userResponseBubble}>
      {response}
    </div>
  );

  const renderInput = () => {
    if (isSubmitted) {
      return renderResponseBubble();
    }

    switch (element.type) {
      case 'number-input':
        return (
          <div className={styles.inputWrapper}>
            <input
              type="number"
              className={styles.input}
              placeholder={element.label}
              value={response || ''}
              onChange={(e) => onResponse(element._id, e.target.value)}
              required={element.required}
            />
            {renderSubmitButton()}
          </div>
        );

      case 'text-bubble':
        return (
          <div className={styles.bubble}>
            <p>{element.value || element.label}</p>
          </div>
        );

      case 'image-bubble':
        return (
          <div className={`${styles.bubble} ${styles.imageBubble}`}>
            {element.value && (
              <img 
                src={element.value} 
                alt={element.label} 
                className={styles.bubbleImage}
              />
            )}
            <p>{element.label}</p>
          </div>
        );

      case 'rating-input':
        return (
          <div className={styles.inputWrapper}>
            <div className={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  className={`${styles.ratingButton} ${
                    response === rating ? styles.active : ''
                  }`}
                  onClick={() => onResponse(element._id, rating)}
                  type="button"
                >
                  {rating}
                </button>
              ))}
            </div>
            {renderSubmitButton()}
          </div>
        );

      case 'phone-input':
      case 'email-input':
        return (
          <div className={styles.inputWrapper}>
            <input
              type={element.type === 'phone-input' ? 'tel' : 'email'}
              className={styles.input}
              placeholder={element.label}
              value={response || ''}
              onChange={(e) => onResponse(element._id, e.target.value)}
              required={element.required}
            />
            {renderSubmitButton()}
          </div>
        );

      case 'text-input':
        return (
          <div className={styles.inputWrapper}>
            <input
              type="text"
              className={styles.input}
              placeholder={element.label}
              value={response || ''}
              onChange={(e) => onResponse(element._id, e.target.value)}
              required={element.required}
            />
            {renderSubmitButton()}
          </div>
        );

      case 'date-input':
        return (
          <div className={styles.inputWrapper}>
            <input
              type="date"
              className={styles.input}
              placeholder={element.label}
              value={response || ''}
              onChange={(e) => onResponse(element._id, e.target.value)}
              required={element.required}
            />
            {renderSubmitButton()}
          </div>
        );

      case 'button-input':
        return (
          <div className={styles.buttonWrapper}>
            <button
              className={styles.button}
              onClick={async () => {
                await onResponse(element._id, 'completed');
                await onSubmit(element._id);
                alert('Form submitted successfully');
              }}
              type="button"
            >
              Submit
            </button>
          </div>
        );

      default:
        return <div className={styles.error}>Unsupported element type: {element.type}</div>;
    }
  };

  return (
    <div className={styles.elementWrapper}>
      {renderInput()}
    </div>
  );
};

export default FormElement;